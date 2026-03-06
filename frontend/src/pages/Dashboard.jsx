import { useEffect, useState } from 'react'
import api from '../api/axios'

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{ background: "#1a1f2e", border: "1px solid #2a3147" }} className="rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ color: "#8892a4" }} className="text-xs uppercase tracking-widest font-semibold">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div style={{ color: accent || "#e2e8f0" }} className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/detention/stats/summary')
        setStats(res.data)
      } catch (err) {
        console.error('Failed to fetch stats', err)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ background: "#0f1420", minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: "#8892a4" }} className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ background: "#0f1420", minHeight: "100vh" }} className="flex items-center justify-center">
        <div style={{ color: "#f87171" }} className="text-lg">Failed to load stats</div>
      </div>
    )
  }

  return (
    <div style={{ background: "#0f1420", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Topbar */}
      <div style={{ background: "#1a1f2e", borderBottom: "1px solid #2a3147" }} className="px-8 py-4 flex items-center justify-between">
        <div>
          <div style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: "700" }}>🚚 LogiTrack</div>
          <div style={{ color: "#8892a4", fontSize: "12px" }}>Dispatcher Portal</div>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Loads", href: "/loads" },
            { label: "Detention", href: "/detention" },
            { label: "Shipments", href: "/shipments" },
          ].map(item => (
            <a key={item.label} href={item.href}
              style={{ color: item.href === "/dashboard" ? "#60a5fa" : "#8892a4" }}
              className="text-sm font-medium hover:text-blue-400 transition">
              {item.label}
            </a>
          ))}
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/' }}
            style={{ background: "#ef444420", color: "#f87171", border: "1px solid #ef444440" }}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h2 style={{ color: "#e2e8f0", fontSize: "26px", fontWeight: "700" }}>Good day, Dispatcher 👋</h2>
          <p style={{ color: "#8892a4" }} className="text-sm mt-1">Here's what's happening across your fleet today.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Shipments" value={stats.overview.total_shipments} icon="📦" accent="#60a5fa" />
          <StatCard label="Drivers" value={stats.overview.total_drivers} icon="🚛" accent="#34d399" />
          <StatCard label="Customers" value={stats.overview.total_customers} icon="👥" accent="#a78bfa" />
          <StatCard label="Warehouses" value={stats.overview.total_warehouses} icon="🏢" accent="#fbbf24" />
        </div>

        {/* Detention Analytics */}
        <div>
          <h3 style={{ color: "#e2e8f0" }} className="text-lg font-bold mb-4">Detention Analytics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Events" value={stats.detention.total_events} icon="📋" accent="#e2e8f0" />
            <StatCard label="Active Now" value={stats.detention.active_events} icon="🔴" accent="#f87171" />
            <StatCard label="Total Owed" value={`$${stats.detention.total_amount}`} icon="💰" accent="#f87171" />
            <StatCard label="Avg Detention" value={`${stats.detention.avg_detention_minutes}m`} icon="⏱" accent="#fb923c" />
          </div>
        </div>

        {/* Recent Events Table */}
        <div>
          <h3 style={{ color: "#e2e8f0" }} className="text-lg font-bold mb-4">Recent Detention Events</h3>
          <div style={{ background: "#1a1f2e", border: "1px solid #2a3147" }} className="rounded-xl overflow-hidden">
            <table className="w-full">
              <thead style={{ background: "#0f1420" }}>
                <tr>
                  {["Event ID", "Load", "Driver", "Detention", "Amount", "Status"].map(h => (
                    <th key={h} style={{ color: "#8892a4" }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_events.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ color: "#8892a4" }} className="text-center py-10 text-sm">No events yet</td>
                  </tr>
                ) : (
                  stats.recent_events.map(event => (
                    <tr key={event.id} style={{ borderTop: "1px solid #2a3147" }}>
                      <td style={{ color: "#60a5fa" }} className="px-5 py-4 font-mono text-sm font-bold">#{event.id}</td>
                      <td style={{ color: "#e2e8f0" }} className="px-5 py-4 text-sm">Load #{event.load_id}</td>
                      <td style={{ color: "#e2e8f0" }} className="px-5 py-4 text-sm">Driver #{event.driver_id}</td>
                      <td style={{ color: "#e2e8f0" }} className="px-5 py-4 text-sm">{event.detention_minutes}m</td>
                      <td style={{ color: "#f87171" }} className="px-5 py-4 text-sm font-bold">${event.detention_amount}</td>
                      <td className="px-5 py-4">
                        <span style={{
                          background: event.status === 'active' ? "#3b82f620" : "#10b98120",
                          color: event.status === 'active' ? "#60a5fa" : "#34d399",
                          border: `1px solid ${event.status === 'active' ? "#3b82f640" : "#10b98140"}`
                        }} className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipper Stats */}
        {stats.shipper_stats.length > 0 && (
          <div>
            <h3 style={{ color: "#e2e8f0" }} className="text-lg font-bold mb-4">Worst Shippers by Detention</h3>
            <div style={{ background: "#1a1f2e", border: "1px solid #2a3147" }} className="rounded-xl overflow-hidden">
              <table className="w-full">
                <thead style={{ background: "#0f1420" }}>
                  <tr>
                    {["Shipper", "Events", "Total Detention", "Total Owed"].map(h => (
                      <th key={h} style={{ color: "#8892a4" }} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.shipper_stats.sort((a, b) => b.total_detention_minutes - a.total_detention_minutes).map((s, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #2a3147" }}>
                      <td style={{ color: "#e2e8f0" }} className="px-5 py-4 font-medium">{s.shipper}</td>
                      <td style={{ color: "#8892a4" }} className="px-5 py-4 text-sm">{s.events}</td>
                      <td style={{ color: "#fb923c" }} className="px-5 py-4 text-sm font-semibold">{s.total_detention_minutes}m</td>
                      <td style={{ color: "#f87171" }} className="px-5 py-4 font-bold">${s.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}