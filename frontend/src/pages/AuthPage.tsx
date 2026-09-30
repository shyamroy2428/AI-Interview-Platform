import { useState } from 'react'
import { api } from '@/lib/api'
import { setUser } from '@/store/auth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const body: any = { email, password }
      if (mode === 'register') body.full_name = name
      const { data } = await api.post(url, body)
      setUser({ email: data.email, full_name: data.full_name, role: data.role }, data.access_token)
      nav('/')
    } catch (e: any) { setErr(e?.response?.data?.detail || 'Failed') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-700/20">
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        {mode === 'register' && (
          <input className="w-full bg-slate-800 rounded-lg p-3" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        )}
        <input className="w-full bg-slate-800 rounded-lg p-3" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full bg-slate-800 rounded-lg p-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 rounded-lg p-3 font-medium">
          {loading ? '...' : mode === 'login' ? 'Sign in' : 'Sign up'}
        </button>
        <p className="text-sm text-slate-400 text-center">
          {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
          <button type="button" className="text-brand-500" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.form>
    </div>
  )
}
