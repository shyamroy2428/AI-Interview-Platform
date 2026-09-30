import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { useUser } from '@/store/auth'

type Phase = 'idle' | 'thinking' | 'speaking' | 'listening' | 'done'

export default function VoiceInterview() {
  const { id } = useParams()
  const nav = useNavigate()
  const u = useUser()
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentQ, setCurrentQ] = useState<{ id: number; text: string; idx: number } | null>(null)
  const [transcript, setTranscript] = useState('')
  const [live, setLive] = useState('')
  const [level, setLevel] = useState(0)
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Ready when you are.')
  const [summary, setSummary] = useState<{ overall: number; text: string } | null>(null)
  const recRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const finalTextRef = useRef('')
  const silenceTimer = useRef<any>(null)

  useEffect(() => { start(); return () => cleanup() }, [])

  async function askNext() {
    setPhase('thinking'); setStatus('Interviewer is thinking…')
    const { data } = await api.post('/interviews/next', {
      interview_id: Number(id), candidate_name: u?.full_name,
    })
    setCurrentQ({ id: data.question_id, text: data.question, idx: data.idx })
    setCount(data.idx)
    await speak(data.question)
    await listen()
  }

  async function start() {
    try { await askNext() } catch (e) { setStatus('Failed to start') }
  }

  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      setPhase('speaking'); setStatus('Interviewer is speaking…')
      try {
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 1; u.pitch = 1
        const voices = speechSynthesis.getVoices()
        const v = voices.find(v => /en/i.test(v.lang) && /female|zira|samantha|susan/i.test(v.name)) || voices.find(v => /en/i.test(v.lang))
        if (v) u.voice = v
        u.onend = () => resolve()
        u.onerror = () => resolve()
        speechSynthesis.cancel(); speechSynthesis.speak(u)
      } catch { resolve() }
    })
  }

  async function listen() {
    setPhase('listening'); setStatus('Listening… take your time.')
    finalTextRef.current = ''; setLive('')
    await startMeter()

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setStatus('Speech recognition not supported'); return }
    const rec = new SR()
    recRef.current = rec
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true
    rec.onresult = (ev: any) => {
      let interim = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i]
        if (r.isFinal) finalTextRef.current += r[0].transcript + ' '
        else interim += r[0].transcript
      }
      setLive(finalTextRef.current + interim)
      resetSilence()
    }
    rec.onerror = () => {}
    rec.onend = () => {}
    rec.start()
    resetSilence()
  }

  function resetSilence() {
    clearTimeout(silenceTimer.current)
    silenceTimer.current = setTimeout(() => finishAnswer(), 2600)
  }

  async function finishAnswer() {
    if (!currentQ) return
    clearTimeout(silenceTimer.current)
    try { recRef.current?.stop() } catch {}
    stopMeter()
    const ans = (finalTextRef.current || live).trim()
    if (!ans) { setStatus('I did not catch that. Take another moment.'); await listen(); return }
    setTranscript(t => t + `\n\nQ${currentQ.idx}: ${currentQ.text}\nA${currentQ.idx}: ${ans}`)
    setPhase('thinking'); setStatus('Interviewer is thinking…')
    await api.post('/interviews/answer', { question_id: currentQ.id, answer: ans })
    if (count >= 8) { await finish(); return }
    await askNext()
  }

  async function finish() {
    setPhase('thinking'); setStatus('Wrapping up…')
    const { data } = await api.post(`/interviews/${id}/complete`)
    setSummary({ overall: data.overall_score, text: data.summary })
    setPhase('done'); setStatus('Interview complete.')
  }

  async function startMeter() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new (window as any).AudioContext()
      audioCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser(); an.fftSize = 256
      src.connect(an); analyserRef.current = an
      const buf = new Uint8Array(an.frequencyBinCount)
      const tick = () => {
        if (!analyserRef.current) return
        an.getByteFrequencyData(buf)
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length
        setLevel(avg / 128)
        requestAnimationFrame(tick)
      }
      tick()
    } catch {}
  }
  function stopMeter() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close(); audioCtxRef.current = null; analyserRef.current = null
  }
  function cleanup() {
    try { recRef.current?.stop() } catch {}
    stopMeter(); speechSynthesis.cancel(); clearTimeout(silenceTimer.current)
  }

  if (summary) {
    return (
      <main className="max-w-3xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Interview complete</h1>
        <div className="glass rounded-2xl p-8">
          <div className="text-6xl font-bold text-brand-500">{summary.overall.toFixed(1)}<span className="text-2xl text-slate-400">/10</span></div>
          <p className="mt-4 whitespace-pre-wrap text-slate-200">{summary.text}</p>
        </div>
        <button onClick={() => nav('/')} className="bg-brand-600 px-5 py-2.5 rounded-lg">Back to dashboard</button>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-56px)] grid lg:grid-cols-[1fr_360px]">
      <section className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <Avatar phase={phase} level={level} />
        <div className="mt-6 text-slate-400 text-sm">Question {count} · {status}</div>
        <div className="mt-4 max-w-xl text-center text-lg">{currentQ?.text}</div>
        <div className="mt-6 h-16 w-full max-w-xl">
          <Waveform level={level} active={phase === 'listening'} />
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={finishAnswer} className="bg-brand-600 px-4 py-2 rounded-lg">I'm done answering</button>
          <button onClick={finish} className="border border-slate-700 px-4 py-2 rounded-lg">End interview</button>
        </div>
        <div className="mt-4 text-slate-300 text-sm max-w-xl min-h-[40px]">{live}</div>
      </section>
      <aside className="glass p-6 overflow-y-auto max-h-[calc(100vh-56px)]">
        <h3 className="font-semibold mb-3">Live transcript</h3>
        <pre className="whitespace-pre-wrap text-xs text-slate-300">{transcript || '—'}</pre>
      </aside>
    </main>
  )
}

function Avatar({ phase, level }: { phase: Phase; level: number }) {
  const scale = phase === 'speaking' ? 1 + Math.min(0.15, level * 0.15) : phase === 'listening' ? 1.03 : 1
  const color = phase === 'speaking' ? 'from-brand-500 to-brand-700' : phase === 'listening' ? 'from-emerald-500 to-emerald-700' : 'from-slate-600 to-slate-800'
  return (
    <motion.div animate={{ scale }} transition={{ type: 'spring', stiffness: 200 }}
      className={`w-52 h-52 rounded-full bg-gradient-to-br ${color} shadow-2xl flex items-center justify-center text-6xl font-bold`}>
      A
    </motion.div>
  )
}

function Waveform({ level, active }: { level: number; active: boolean }) {
  const bars = Array.from({ length: 40 })
  return (
    <div className="flex items-center justify-center gap-1 h-full">
      {bars.map((_, i) => {
        const base = 6 + Math.abs(Math.sin((i + Date.now() / 100) * 0.5)) * (active ? level * 40 : 4)
        return <div key={i} className="w-1.5 bg-brand-500 rounded-full" style={{ height: base }} />
      })}
    </div>
  )
}
