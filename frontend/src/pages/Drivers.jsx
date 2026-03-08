import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', license_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers/')
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.name || !form.phone || !form.license_number) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/drivers/', form)
      setForm({ name: '', phone: '', license_number: '' })
      setShowForm(false)
      fetchDrivers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete('/drivers/' + id)
      fetchDrivers()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Drivers</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Manage your fleet drivers.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#3b82f6' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Driver
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-bold">Add New Driver</h3>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Phone</label>
                <input
                  type="text"
                  placeholder="555-1234"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">License Number</label>
                <input
                  type="text"
                  placeholder="DL123456"
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ background: loading ? '#2a3147' : '#10b981' }}
              className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              {loading ? 'Creating...' : 'Create Driver'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers.length === 0 ? (
            <div style={{ color: '#8892a4' }} className="col-span-3 text-center py-16 text-sm">
              No drivers yet. Add your first driver above.
            </div>
          ) : (
            drivers.map((d) => (
              <div key={d.id} style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div style={{ background: '#3b82f620', color: '#60a5fa' }} className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      {d.name[0]}
                    </div>
                    <div>
                      <div style={{ color: '#e2e8f0' }} className="font-bold">{d.name}</div>
                      <div style={{ color: '#8892a4' }} className="text-xs">{d.phone}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    style={{ color: '#f87171' }}
                    className="text-xs hover:opacity-70 transition"
                  >
                    Delete
                  </button>
                </div>
                <div style={{ borderTop: '1px solid #2a3147' }} className="pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#8892a4' }}>License</span>
                    <span style={{ color: '#e2e8f0' }} className="font-mono">{d.license_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#8892a4' }}>Driver ID</span>
                    <span style={{ color: '#60a5fa' }} className="font-bold">#{d.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}