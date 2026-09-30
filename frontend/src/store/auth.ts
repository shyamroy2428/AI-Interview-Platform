import { useSyncExternalStore } from 'react'

type User = { email: string; full_name?: string | null; role: string } | null
let user: User = (() => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(l => l())

export function setUser(u: User, token?: string) {
  user = u
  if (u) localStorage.setItem('user', JSON.stringify(u)); else localStorage.removeItem('user')
  if (token) localStorage.setItem('token', token)
  if (u === null) localStorage.removeItem('token')
  notify()
}

export function useUser() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => user,
    () => user,
  )
}
