import { useState } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

const MODES = [
  { id: 'hr', label: 'HR' },
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'resume', label: 'Resume Based' },
  { id: 'project', label: 'Project Discussion' },
]

export default function NewInterview() {
  const nav = useNavigate()
  const [mode, setMode] = useState('hr'); const [role, setRole] = useState(''); const [seniority, setSeniority] = useState('mid')
  const [resume, setResume] = useState(''); const [jd, setJd] = useState(''); const [loading, setLoading] = useState(false)

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const fd = new FormData(); fd.append('file', f)
    const { data } = await api.post('/resume/parse', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setResume(data.text)
  }

  async function start() {
    setLoading(true)
    try {
      const { data } = await api.post('/interviews', {
        mode, role_title: role, seniority, resume_text: resume || null, jd_text: jd || null,
      })
      nav(`/interview/${data.id}/voice`)
    } finally { setLoading(false) }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Start a new interview</h1>

      <div>
        <label className="text-sm text-slate-400">Mode</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg border ${mode === m.id ? 'bg-brand-600 border-brand-600' : 'border-slate-700 bg-slate-800/50'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Role / Position"><input className="w-full bg-slate-800 rounded-lg p-3" value={role} onChange={e=>setRole(e.target.value)} placeholder="Senior React Engineer" /></Field>
        <Field label="Seniority">
          <select className="w-full bg-slate-800 rounded-lg p-3" value={seniority} onChange={e=>setSeniority(e.target.value)}>
            <option>junior</option><option>mid</option><option>senior</option><option>staff</option>
          </select>
        </Field>
      </div>

      <Field label="Upload resume (PDF)">
        <input type="file" accept=".pdf" onChange={upload} className="block text-sm" />
        {resume && <textarea readOnly value={resume.slice(0, 800)} className="mt-2 w-full h-24 bg-slate-800 rounded-lg p-2 text-xs" />}
      </Field>

      <Field label="Job description (optional)">
        <textarea className="w-full h-32 bg-slate-800 rounded-lg p-3" value={jd} onChange={e=>setJd(e.target.value)} />
      </Field>

      <button disabled={loading} onClick={start} className="bg-brand-600 hover:bg-brand-700 px-6 py-3 rounded-lg">
        {loading ? 'Preparing…' : 'Start voice interview'}
      </button>
    </main>
  )
}

function Field({ label, children }: any) {
  return <div><label className="text-sm text-slate-400 block mb-1">{label}</label>{children}</div>
}
