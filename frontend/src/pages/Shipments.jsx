import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ origin: '', destination: '', status: 'pending' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchShipments = async () => {
    try {
      const res = await api.get('/shipments/')
      setShipments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.origin || !form.destination) {
      setError('Origin and destination are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/shipments/', form)
      setForm({ origin: '', destination: '', status: 'pending' })
      setShowForm(false)
      fetchShipments()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete('/shipments/' + id)
      fetchShipments()
    } catch (err) {
      console.error(err)
    }
  }

  const statusStyle = (status) => {
    const styles = {
      pending: { background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' },
      in_transit: { background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640' },
      delivered: { background: '#10b98120', color: '#34d399', border: '1px solid #10b98140' },
    }
    return styles[status] || styles.pending
  }

  return (
    <Layout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Shipments</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Track and manage all shipments.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#3b82f6' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Shipment
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-bold">Create New Shipment</h3>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Origin</label>
                <input
                  type="text"
                  placeholder="Chicago, IL"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="Dallas, TX"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ background: loading ? '#2a3147' : '#10b981' }}
              className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        )}

        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#0f1420' }}>
              <tr>
                {['ID', 'Origin', 'Destination', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ color: '#8892a4' }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ color: '#8892a4' }} className="text-center py-12 text-sm">No shipments found</td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #2a3147' }}>
                    <td style={{ color: '#60a5fa' }} className="px-5 py-4 font-mono text-sm font-bold">#{s.id}</td>
                    <td style={{ color: '#e2e8f0' }} className="px-5 py-4 text-sm">{s.origin}</td>
                    <td style={{ color: '#e2e8f0' }} className="px-5 py-4 text-sm">{s.destination}</td>
                    <td className="px-5 py-4">
                      <span style={statusStyle(s.status)} className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{ color: '#f87171' }}
                        className="text-sm hover:opacity-70 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  )
}