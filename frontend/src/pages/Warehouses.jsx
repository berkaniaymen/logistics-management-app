import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ warehouse_name: '', city: '', country: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses/')
      setWarehouses(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const handleCreate = async () => {
    setError('')
    if (!form.warehouse_name || !form.city || !form.country) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await api.post('/warehouses/', form)
      setForm({ warehouse_name: '', city: '', country: '' })
      setShowForm(false)
      fetchWarehouses()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete('/warehouses/' + id)
      fetchWarehouses()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Warehouses</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Manage your warehouse locations.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#3b82f6' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Warehouse
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-bold">Add New Warehouse</h3>

            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#f87171' }} className="rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Warehouse Name</label>
                <input
                  type="text"
                  placeholder="Chicago Central"
                  value={form.warehouse_name}
                  onChange={(e) => setForm({ ...form, warehouse_name: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">City</label>
                <input
                  type="text"
                  placeholder="Chicago"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold block mb-2">Country</label>
                <input
                  type="text"
                  placeholder="United States"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
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
              {loading ? 'Adding...' : 'Add Warehouse'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.length === 0 ? (
            <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-16 text-center col-span-3">
              <div className="text-4xl mb-3">🏢</div>
              <div style={{ color: '#e2e8f0' }} className="font-bold text-lg">No warehouses yet</div>
              <div style={{ color: '#8892a4' }} className="text-sm mt-1">Add your first warehouse location.</div>
            </div>
          ) : (
            warehouses.map((w) => (
              <div key={w.warehouse_id} style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div style={{ background: '#fbbf2420', color: '#fbbf24', width: '48px', height: '48px', fontSize: '22px' }} className="rounded-xl flex items-center justify-center flex-shrink-0">
                    🏢
                  </div>
                  <button
                    onClick={() => handleDelete(w.warehouse_id)}
                    style={{ color: '#f87171' }}
                    className="text-xs hover:opacity-70 transition"
                  >
                    Delete
                  </button>
                </div>
                <div style={{ color: '#e2e8f0' }} className="font-bold text-lg mb-1">{w.warehouse_name}</div>
                <div style={{ color: '#8892a4' }} className="text-sm flex items-center gap-1">
                  📍 {w.city}, {w.country}
                </div>
                <div style={{ color: '#60a5fa', borderTop: '1px solid #2a3147' }} className="text-xs font-mono mt-3 pt-3">
                  ID #{w.warehouse_id}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  )
}