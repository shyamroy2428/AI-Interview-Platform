import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

api.interceptors.response.use(r => r, err => {
  if (err?.response?.status === 401) {
    localStorage.removeItem('token')
    if (!location.pathname.startsWith('/auth')) location.href = '/auth'
  }
  return Promise.reject(err)
})
