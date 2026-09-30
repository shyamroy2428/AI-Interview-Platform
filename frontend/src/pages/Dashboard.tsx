import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Link } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const { data: s } = useQuery({ queryKey: ['summary'], queryFn: async () => (await api.get('/analytics/summary')).data })
  const { data: ivs } = useQuery({ queryKey: ['interviews'], queryFn: async () => (await api.get('/interviews')).data })

  const timeline = (s?.timeline || []).slice().reverse().map((t: any, i: number) => ({ n: i + 1, score: t.score || 0 }))
  const byMode = Object.entries(s?.by_mode || {}).map(([k, v]) => ({ mode: k, count: v as number }))

  return (
    <main className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/new" className="bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-lg">Start Interview</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total interviews" value={s?.total ?? 0} />
        <Stat label="Completed" value={s?.completed ?? 0} />
        <Stat label="Average score" value={(s?.average_score ?? 0).toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 h-72">
          <h3 className="font-semibold mb-3">Score over time</h3>
          <ResponsiveContainer><LineChart data={timeline}>
            <XAxis dataKey="n" stroke="#64748b" /><YAxis stroke="#64748b" domain={[0,10]} /><Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
          </LineChart></ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6 h-72">
          <h3 className="font-semibold mb-3">By mode</h3>
          <ResponsiveContainer><BarChart data={byMode}>
            <XAxis dataKey="mode" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart></ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-3">Recent interviews</h3>
        <div className="divide-y divide-slate-800">
          {(ivs || []).map((i: any) => (
            <Link key={i.id} to={`/interview/${i.id}`} className="flex items-center justify-between py-3 hover:bg-slate-800/40 px-2 rounded">
              <div>
                <div className="font-medium">{i.role_title || i.mode}</div>
                <div className="text-sm text-slate-400">{i.mode} · {i.status}</div>
              </div>
              <div className="text-brand-500 font-semibold">{i.overall_score ? i.overall_score.toFixed(1) : '—'}</div>
            </Link>
          ))}
          {(!ivs || ivs.length === 0) && <p className="text-slate-400 text-sm py-4">No interviews yet.</p>}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  )
}
