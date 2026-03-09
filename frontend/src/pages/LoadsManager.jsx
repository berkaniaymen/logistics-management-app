import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function LoadsManager() {
  const [loads, setLoads] = useState([])
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ load_number: '', shipper_name: '', shipper_address: '', driver_id: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchLoads = async () => {
    try {
      const res = await api.get('/loads/')
      setLoads(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers/')
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLoads()
    fetchDrivers()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.load_number || !form.shipper_name || !form.shipper_address) {
      setError('Load number, shipper name and address are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/loads/', {
        ...form,
        driver_id: form.driver_id ? parseInt(form.driver_id) : null,
      })
      setForm({ load_number: '', shipper_name: '', shipper_address: '', driver_id: '' })
      setShowForm(false)
      fetchLoads()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete('/loads/' + id)
      fetchLoads()
    } catch (err) {
      console.error(err)
    }
  }

  const statusStyle = (status) => {
    const styles = {
      pending: { background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' },
      in_transit: { background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640' },
      completed: { background: '#10b98120', color: '#34d399', border: '1px solid #10b98140' },
    }
    return styles[status] || styles.pending
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Loads Manager</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Create and manage loads assigned to drivers.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#3b82f6' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Load
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-bold">Create New Load</h3>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Load Number</label>
                <input
                  type="text"
                  placeholder="LOAD-001"
                  value={form.load_number}
                  onChange={(e) => setForm({ ...form, load_number: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Shipper Name</label>
                <input
                  type="text"
                  placeholder="Amazon Fulfillment"
                  value={form.shipper_name}
                  onChange={(e) => setForm({ ...form, shipper_name: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Shipper Address</label>
                <input
                  type="text"
                  placeholder="1234 Warehouse Blvd, Chicago IL"
                  value={form.shipper_address}
                  onChange={(e) => setForm({ ...form, shipper_address: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Assign Driver</label>
                <select
                  value={form.driver_id}
                  onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ background: loading ? '#2a3147' : '#10b981' }}
              className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              {loading ? 'Creating...' : 'Create Load'}
            </button>
          </div>
        )}

        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#0f1420' }}>
              <tr>
                {['Load #', 'Shipper', 'Address', 'Driver', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ color: '#8892a4' }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ color: '#8892a4' }} className="text-center py-12 text-sm">No loads found</td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load.id} style={{ borderTop: '1px solid #2a3147' }}>
                    <td style={{ color: '#60a5fa' }} className="px-5 py-4 font-mono text-sm font-bold">{load.load_number}</td>
                    <td style={{ color: '#e2e8f0' }} className="px-5 py-4 font-medium text-sm">{load.shipper_name}</td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-sm">{load.shipper_address}</td>
                    <td style={{ color: '#e2e8f0' }} className="px-5 py-4 text-sm">
                      {drivers.find((d) => d.id === load.driver_id)?.name || 'Unassigned'}
                    </td>
                    <td className="px-5 py-4">
                      <span style={statusStyle(load.status)} className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                        {load.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(load.id)}
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
    </div>
  )
}