import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Payments() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const res = await api.get('/detention/payment-requests')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleMarkPaid = async (eventId) => {
    try {
      await api.post('/detention/' + eventId + '/mark-paid')
      fetchRequests()
    } catch (err) {
      alert(err.response?.data?.detail || 'Something went wrong')
    }
  }

  const handleDownloadReport = async (eventId) => {
    try {
      const res = await api.get('/detention/' + eventId + '/report', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'detention-report-' + eventId + '.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString()
  }

  const totalRequested = requests.reduce((sum, r) => sum + r.detention_amount, 0)

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Payment Requests</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">Drivers requesting detention payment.</p>
          </div>
          <button
            onClick={fetchRequests}
            style={{ background: '#1a1f2e', border: '1px solid #2a3147', color: '#8892a4' }}
            className="text-sm font-semibold px-4 py-2 rounded-lg hover:text-blue-400 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Pending Requests</div>
            <div style={{ color: '#fbbf24' }} className="text-3xl font-bold">{requests.length}</div>
          </div>
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Total Amount</div>
            <div style={{ color: '#f87171' }} className="text-3xl font-bold">${totalRequested.toFixed(2)}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#8892a4' }} className="text-center py-16 text-sm">Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div style={{ color: '#34d399' }} className="font-bold text-lg">No pending payment requests</div>
            <div style={{ color: '#8892a4' }} className="text-sm mt-1">All payments are up to date.</div>
          </div>
        ) : (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl overflow-hidden">
            <table className="w-full">
              <thead style={{ background: '#0f1420' }}>
                <tr>
                  {['Event', 'Driver', 'Load', 'Check In', 'Check Out', 'Detention', 'Amount', 'Actions'].map((h) => (
                    <th key={h} style={{ color: '#8892a4' }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #2a3147' }}>
                    <td style={{ color: '#60a5fa' }} className="px-5 py-4 font-mono text-sm font-bold">#{r.id}</td>
                    <td style={{ color: '#e2e8f0' }} className="px-5 py-4 text-sm font-medium">{r.driver_name}</td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-sm">{r.load_number}</td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-xs">{formatDate(r.checkin_time)}</td>
                    <td style={{ color: '#8892a4' }} className="px-5 py-4 text-xs">{formatDate(r.checkout_time)}</td>
                    <td style={{ color: '#fb923c' }} className="px-5 py-4 text-sm font-semibold">{r.detention_minutes}m</td>
                    <td style={{ color: '#f87171' }} className="px-5 py-4 text-sm font-bold">${r.detention_amount.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMarkPaid(r.id)}
                          style={{ background: '#10b98120', color: '#34d399', border: '1px solid #10b98140' }}
                          className="text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                        >
                          ✅ Mark Paid
                        </button>
                        <button
                          onClick={() => handleDownloadReport(r.id)}
                          style={{ color: '#60a5fa' }}
                          className="text-xs hover:opacity-70 transition"
                        >
                          📄 Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}