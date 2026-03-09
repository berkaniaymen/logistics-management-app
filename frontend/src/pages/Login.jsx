import { useState } from 'react'
import api from '../api/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const token = response.data.access_token
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))

      localStorage.setItem('token', token)
      localStorage.setItem('role', payload.role || 'dispatcher')
      if (payload.driver_id) {
        localStorage.setItem('driver_id', String(payload.driver_id))
      }

      if (payload.role === 'driver') {
        window.location.href = '/driver'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }} className="flex items-center justify-center">

      {/* Background grid effect */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(#2a314720 1px, transparent 1px), linear-gradient(90deg, #2a314720 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }} className="px-4">

        <div className="text-center mb-8">
          <div style={{ color: '#e2e8f0', fontSize: '32px', fontWeight: '800' }}>🚚 LogiTrack</div>
          <div style={{ color: '#8892a4' }} className="text-sm mt-2">Logistics Management Platform</div>
        </div>

        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-2xl p-8 space-y-5">

          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '700' }}>Sign in</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Welcome back. Enter your credentials below.</p>
          </div>

          {error && (
            <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: loading ? '#2a3147' : '#3b82f6' }}
            className="w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </div>

        <div style={{ color: '#8892a4' }} className="text-center text-xs mt-6">
          Dispatcher or Driver? Use your assigned credentials to sign in.
        </div>

      </div>
    </div>
  )
}