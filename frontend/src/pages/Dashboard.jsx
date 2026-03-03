import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500 text-xl">Failed to load stats</div>
        </div>
      </div>
    )
  }

  const overviewCards = [
    { label: 'Total Shipments', value: stats.overview.total_shipments, color: 'bg-blue-500', icon: '📦' },
    { label: 'Total Drivers', value: stats.overview.total_drivers, color: 'bg-green-500', icon: '🚗' },
    { label: 'Total Customers', value: stats.overview.total_customers, color: 'bg-purple-500', icon: '👥' },
    { label: 'Total Warehouses', value: stats.overview.total_warehouses, color: 'bg-yellow-500', icon: '🏢' },
  ]

  const detentionCards = [
    { label: 'Total Detention Events', value: stats.detention.total_events, color: 'bg-gray-700', icon: '📋' },
    { label: 'Active Now', value: stats.detention.active_events, color: 'bg-blue-600', icon: '🔴' },
    { label: 'Total Owed', value: `$${stats.detention.total_amount}`, color: 'bg-red-600', icon: '💰' },
    { label: 'Avg Detention', value: `${stats.detention.avg_detention_minutes}m`, color: 'bg-orange-500', icon: '⏱️' },
  ]

  const loadsPieData = [
    { name: 'Pending', value: stats.loads.pending },
    { name: 'Completed', value: stats.loads.completed },
    { name: 'Other', value: Math.max(0, stats.loads.total - stats.loads.pending - stats.loads.completed) },
  ].filter(d => d.value > 0)

  const recentBarData = stats.recent_events
    .filter(e => e.status === 'completed')
    .slice(0, 7)
    .map(e => ({
      name: `#${e.id}`,
      minutes: e.detention_minutes,
      amount: e.detention_amount,
    }))

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewCards.map(card => (
            <div key={card.label} className={`${card.color} text-white rounded-lg p-5 shadow`}>
              <div className="text-3xl mb-1">{card.icon}</div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm mt-1 opacity-90">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Detention Cards */}
        <h3 className="text-xl font-bold text-gray-700 mb-4">Detention Analytics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {detentionCards.map(card => (
            <div key={card.label} className={`${card.color} text-white rounded-lg p-5 shadow`}>
              <div className="text-3xl mb-1">{card.icon}</div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm mt-1 opacity-90">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart — Recent Detention Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Recent Detention Times (minutes)
            </h3>
            {recentBarData.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No completed events yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={recentBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'minutes' ? `${value} min` : `$${value}`,
                      name === 'minutes' ? 'Detention Time' : 'Amount Owed'
                    ]}
                  />
                  <Bar dataKey="minutes" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart — Loads Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Loads Status</h3>
            {loadsPieData.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No loads yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={loadsPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {loadsPieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Shipper Stats Table */}
        {stats.shipper_stats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Worst Shippers by Detention Time
            </h3>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600">Shipper</th>
                  <th className="text-left px-4 py-3 text-gray-600">Events</th>
                  <th className="text-left px-4 py-3 text-gray-600">Total Detention</th>
                  <th className="text-left px-4 py-3 text-gray-600">Total Owed</th>
                </tr>
              </thead>
              <tbody>
                {stats.shipper_stats
                  .sort((a, b) => b.total_detention_minutes - a.total_detention_minutes)
                  .map((s, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{s.shipper}</td>
                      <td className="px-4 py-3 text-gray-600">{s.events}</td>
                      <td className="px-4 py-3 text-gray-600">{s.total_detention_minutes} min</td>
                      <td className="px-4 py-3 font-bold text-red-600">${s.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Events Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Detention Events</h3>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">Event ID</th>
                <th className="text-left px-4 py-3 text-gray-600">Load</th>
                <th className="text-left px-4 py-3 text-gray-600">Driver</th>
                <th className="text-left px-4 py-3 text-gray-600">Detention</th>
                <th className="text-left px-4 py-3 text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">No events yet</td>
                </tr>
              ) : (
                stats.recent_events.map(event => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">#{event.id}</td>
                    <td className="px-4 py-3 text-gray-700">Load #{event.load_id}</td>
                    <td className="px-4 py-3 text-gray-700">Driver #{event.driver_id}</td>
                    <td className="px-4 py-3 text-gray-700">{event.detention_minutes} min</td>
                    <td className="px-4 py-3 font-bold text-red-600">${event.detention_amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
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
    </div>
  )
}