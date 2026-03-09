import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DetentionDashboard() {
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActive = async () => {
    try {
      const res = await api.get('/detention/active')
      setActive(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActive()
    const interval = setInterval(fetchActive, 60000)
    return () => clearInterval(interval)
  }, [])

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

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h + 'h ' + m + 'm'
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>Detention Dashboard</h2>
            <p style={{ color: '#8892a4' }} className="text-sm mt-1">
              Live view of all active detentions across your fleet.
            </p>
          </div>
          <button
            onClick={fetchActive}
            style={{ background: '#1a1f2e', border: '1px solid #2a3147', color: '#8892a4' }}
            className="text-sm font-semibold px-4 py-2 rounded-lg hover:text-blue-400 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Active Now</div>
            <div style={{ color: '#f87171' }} className="text-3xl font-bold">{active.length}</div>
          </div>
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">In Detention</div>
            <div style={{ color: '#fb923c' }} className="text-3xl font-bold">
              {active.filter((e) => e.detention_minutes > 0).length}
            </div>
          </div>
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5">
            <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-widest font-semibold mb-2">Total Owed</div>
            <div style={{ color: '#f87171' }} className="text-3xl font-bold">
              ${active.reduce((sum, e) => sum + e.detention_amount, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#8892a4' }} className="text-center py-16 text-sm">Loading...</div>
        ) : active.length === 0 ? (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div style={{ color: '#34d399' }} className="font-bold text-lg">No active detentions</div>
            <div style={{ color: '#8892a4' }} className="text-sm mt-1">All drivers are within free time.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((event) => {
              const isDetention = event.detention_minutes > 0
              return (
                <div
                  key={event.id}
                  style={{
                    background: '#1a1f2e',
                    border: '1px solid ' + (isDetention ? '#ef444440' : '#2a3147'),
                  }}
                  className="rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        style={{
                          background: isDetention ? '#ef444420' : '#3b82f620',
                          color: isDetention ? '#f87171' : '#60a5fa',
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      >
                        {event.driver_id}
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0' }} className="font-bold">
                          Driver #{event.driver_id}
                        </div>
                        <div style={{ color: '#8892a4' }} className="text-xs">
                          Load #{event.load_id} · Event #{event.id}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: isDetention ? '#ef444420' : '#10b98120',
                        color: isDetention ? '#f87171' : '#34d399',
                        border: '1px solid ' + (isDetention ? '#ef444440' : '#10b98140'),
                      }}
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                    >
                      {isDetention ? '🔴 In Detention' : '🟡 Free Time'}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Elapsed', value: formatTime(event.elapsed_minutes) },
                      { label: 'Free Time Left', value: formatTime(event.free_time_remaining) },
                      { label: 'Detention Time', value: formatTime(event.detention_minutes), accent: isDetention ? '#f87171' : '#34d399' },
                      { label: 'Amount Owed', value: '$' + event.detention_amount.toFixed(2), accent: isDetention ? '#f87171' : '#34d399' },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: '#0f1420' }} className="rounded-lg p-3 text-center">
                        <div style={{ color: '#8892a4' }} className="text-xs uppercase tracking-wide mb-1">{stat.label}</div>
                        <div style={{ color: stat.accent || '#e2e8f0' }} className="font-bold text-sm">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDownloadReport(event.id)}
                    style={{ color: '#60a5fa' }}
                    className="text-sm hover:opacity-70 transition"
                  >
                    📄 Download Report
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}