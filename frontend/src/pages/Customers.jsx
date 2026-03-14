import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/')
      setCustomers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.full_name || !form.email) {
      setError('Name and email are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/customers/', form)
      setForm({ full_name: '', email: '', phone: '' })
      setShowForm(false)
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete('/customers/' + id)
      fetchCustomers()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Customers</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Manage your customer list.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#3b82f6' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Customer
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-bold">Add New Customer</h3>

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
                  placeholder="John Smith"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Email</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        )}

        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl overflow-hidden">
          <table className="w-full">
            <thead style={{ background: '#0f1420' }}>
              <tr>
                {['#', 'Name', 'Email', 'Phone', 'Actions'].map((h) => (
                  <th key={h} style={{ color: '#8892a4' }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ color: '#8892a4' }} className="text-center py-12 text-sm">No customers yet</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid #2a3147' }}>
                    <td style={{ color: '#60a5fa' }} className="px-5 py-4 font-mono text-sm font-bold">#{c.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div style={{ background: '#3b82f620', color: '#60a5fa', width: '36px', height: '36px', fontSize: '14px', fontWeight: '700' }} className="rounded-full flex items-center justify-center flex-shrink-0">
                          {c.full_name[0]}
                        </div>
                        <span style={{ color: '#e2e8f0' }} className="font-medium text-sm">{c.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-sm">{c.email}</td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-sm">{c.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(c.id)}
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