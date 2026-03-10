import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DriverHistory() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const driverId = parseInt(localStorage.getItem('driver_id'))

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/detention/driver/' + driverId)
        setEvents(res.data.reverse())
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString()
  }

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h + 'h ' + m + 'm'
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

  const totalEarned = events
    .filter((e) => e.status === 'completed')
    .reduce((sum, e) => sum + e.detention_amount, 0)

  const totalDetentionMinutes = events
    .filter((e) => e.status === 'completed')
    .reduce((sum, e) => sum + e.detention_minutes, 0)

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8 max-w-3xl mx-auto">

        <div className="mb-8">
          <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Detention History</h2>
          <p style={{ color: '#8892a4' }} className="text-sm mt-1">All your past detention events and amounts owed.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Total Events</div>
            <div style={{ color: '#e2e8f0' }} className="text-3xl font-bold">{events.length}</div>
          </div>
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Total Detention</div>
            <div style={{ color: '#fb923c' }} className="text-3xl font-bold">{formatDuration(totalDetentionMinutes)}</div>
          </div>
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Total Owed</div>
            <div style={{ color: '#f87171' }} className="text-3xl font-bold">${totalEarned.toFixed(2)}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#8892a4' }} className="text-center py-16 text-sm">Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div style={{ color: '#e2e8f0' }} className="font-bold text-lg">No detention events yet</div>
            <div style={{ color: '#8892a4' }} className="text-sm mt-1">Your detention history will appear here.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isActive = event.status === 'active'
              return (
                <div
                  key={event.id}
                  style={{
                    background: '#1a1f2e',
                    border: '1px solid ' + (isActive ? '#3b82f640' : '#2a3147'),
                  }}
                  className="rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div style={{ color: '#60a5fa' }} className="font-mono text-sm font-bold">
                        Event #{event.id}
                      </div>
                      <div style={{ color: '#8892a4' }} className="text-xs mt-0.5">
                        Load #{event.load_id}
                      </div>
                    </div>
                    <div
                      style={{
                        background: isActive ? '#3b82f620' : '#10b98120',
                        color: isActive ? '#60a5fa' : '#34d399',
                        border: '1px solid ' + (isActive ? '#3b82f640' : '#10b98140'),
                      }}
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      {isActive ? '🔵 Active' : '✅ Completed'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Check In', value: formatDate(event.checkin_time) },
                      { label: 'Check Out', value: formatDate(event.checkout_time) },
                      { label: 'Detention Time', value: formatDuration(event.detention_minutes), accent: event.detention_minutes > 0 ? '#f87171' : '#34d399' },
                      { label: 'Amount Owed', value: '$' + event.detention_amount.toFixed(2), accent: event.detention_amount > 0 ? '#f87171' : '#34d399' },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: '#0f1420' }} className="rounded-lg p-3">
                        <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-wide mb-1">{stat.label}</div>
                        <div style={{ color: stat.accent || '#e2e8f0' }} className="font-semibold text-sm">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {event.notes && (
                    <div style={{ color: '#8892a4', borderTop: '1px solid #2a3147' }} className="pt-3 text-xs mb-3">
                      Notes: {event.notes}
                    </div>
                  )}

                  {!isActive && (
                    <button
                      onClick={() => handleDownloadReport(event.id)}
                      style={{ color: '#60a5fa' }}
                      className="text-sm hover:opacity-70 transition"
                    >
                      📄 Download PDF Report
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}