import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function InterviewDetail() {
  const { id } = useParams()
  const { data: iv } = useQuery({ queryKey: ['iv', id], queryFn: async () => (await api.get(`/interviews/${id}`)).data })
  if (!iv) return <main className="p-8">Loading…</main>
  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">{iv.role_title || iv.mode}</h1>
      <div className="glass rounded-2xl p-6">
        <div className="text-sm text-slate-400">Overall score</div>
        <div className="text-4xl font-bold text-brand-500">{iv.overall_score ? iv.overall_score.toFixed(1) : '—'}</div>
        {iv.summary && <p className="mt-4 whitespace-pre-wrap">{iv.summary}</p>}
      </div>
      <div className="space-y-3">
        {iv.questions.map((q: any) => (
          <details key={q.id} className="glass rounded-xl p-4">
            <summary className="cursor-pointer font-medium">Q{q.idx}. {q.question} <span className="text-brand-500 ml-2">{q.score ?? '—'}</span></summary>
            <div className="mt-3 text-sm space-y-2">
              <p><b>Your answer:</b> {q.answer || '—'}</p>
              {q.evaluation && (
                <>
                  <p><b>Feedback:</b> {q.evaluation.feedback}</p>
                  <p><b>Strengths:</b> {(q.evaluation.strengths || []).join(', ')}</p>
                  <p><b>Weaknesses:</b> {(q.evaluation.weaknesses || []).join(', ')}</p>
                  <p><b>Ideal answer:</b> {q.evaluation.ideal_answer}</p>
                </>
              )}
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
