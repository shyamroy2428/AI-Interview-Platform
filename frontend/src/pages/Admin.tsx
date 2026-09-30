import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

export default function Admin() {
  const qc = useQueryClient()
  const users = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/admin/users')).data })
  const qs = useQuery({ queryKey: ['qs'], queryFn: async () => (await api.get('/admin/questions')).data })
  const [nq, setNq] = useState({ category: 'hr', question: '', difficulty: 'medium' })

  const add = useMutation({
    mutationFn: async () => (await api.post('/admin/questions', nq)).data,
    onSuccess: () => { setNq({ category: 'hr', question: '', difficulty: 'medium' }); qc.invalidateQueries({ queryKey: ['qs'] }) },
  })

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Admin</h1>
      <section className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-3">Users</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-400"><th>Email</th><th>Name</th><th>Role</th></tr></thead>
          <tbody>{(users.data || []).map((u: any) => (
            <tr key={u.id} className="border-t border-slate-800"><td className="py-2">{u.email}</td><td>{u.full_name}</td><td>{u.role}</td></tr>
          ))}</tbody>
        </table>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Question bank</h3>
        <div className="flex gap-2 flex-wrap">
          <select className="bg-slate-800 rounded p-2" value={nq.category} onChange={e=>setNq({...nq, category: e.target.value})}>
            <option>hr</option><option>technical</option><option>behavioral</option>
          </select>
          <input className="bg-slate-800 rounded p-2 flex-1" placeholder="Question" value={nq.question} onChange={e=>setNq({...nq, question: e.target.value})} />
          <button onClick={() => add.mutate()} className="bg-brand-600 px-4 rounded">Add</button>
        </div>
        <ul className="space-y-1 text-sm">
          {(qs.data || []).map((q: any) => <li key={q.id} className="border-t border-slate-800 py-2">[{q.category}] {q.question}</li>)}
        </ul>
      </section>
    </main>
  )
}
