import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function CreateDriverAccount() {
  const [drivers, setDrivers] = useState([])
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    driver_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get('/drivers/')
        setDrivers(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchDrivers()
  }, [])

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!form.email || !form.username || !form.password || !form.driver_id) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register-driver', {
        email: form.email,
        username: form.username,
        password: form.password,
        driver_id: parseInt(form.driver_id),
      })
      setSuccess('Driver account created successfully!')
      setForm({ email: '', username: '', password: '', driver_id: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8 max-w-lg mx-auto">
        <div className="mb-8">
          <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>
            Create Driver Account
          </h2>
          <p style={{ color: '#8892a4' }} className="text-sm mt-1">
            Create a login for an existing driver so they can access the Driver Portal.
          </p>
        </div>

        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 space-y-5">

          {error && (
            <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#10b98120', border: '1px solid #10b98140', color: '#34d399' }} className="rounded-lg px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div>
            <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">
              Assign to Driver
            </label>
            <select
              value={form.driver_id}
              onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
              style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.license_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="driver@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="john_doe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
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
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: loading ? '#2a3147' : '#3b82f6' }}
            className="w-full text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition text-sm"
          >
            {loading ? 'Creating...' : 'Create Driver Account'}
          </button>

        </div>
      </div>
    </div>
  )
}