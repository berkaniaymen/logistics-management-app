import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DriverProfile() {
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)

  const driverId = parseInt(localStorage.getItem('driver_id'))

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await api.get('/drivers/' + driverId)
        setDriver(res.data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchDriver()
  }, [])

  if (loading) {
    return (
      <div style={{ background: '#0f1420', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ color: '#8892a4' }} className="text-center py-16 text-sm">Loading...</div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div style={{ background: '#0f1420', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ color: '#f87171' }} className="text-center py-16 text-sm">Failed to load profile.</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8 max-w-xl mx-auto">

        <div className="mb-8">
          <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>My Profile</h2>
          <p style={{ color: '#8892a4' }} className="text-sm mt-1">Your driver information on file.</p>
        </div>

        {/* Avatar + Name */}
        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 mb-4 flex items-center gap-5">
          <div style={{ background: '#3b82f620', color: '#60a5fa', width: '72px', height: '72px', fontSize: '28px', fontWeight: '700' }} className="rounded-full flex items-center justify-center flex-shrink-0">
            {driver.name[0]}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '700' }}>{driver.name}</div>
            <div style={{ color: '#8892a4' }} className="text-sm mt-1">Driver ID #{driver.id}</div>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 space-y-4">
          {[
            { label: 'Phone', value: driver.phone, icon: '📞' },
            { label: 'License Number', value: driver.license_number, icon: '🪪' },
            { label: 'Total Loads', value: driver.loads?.length || 0, icon: '📦' },
          ].map((item) => (
            <div key={item.label} style={{ borderBottom: '1px solid #2a3147', paddingBottom: '16px' }} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span style={{ color: '#8892a4' }} className="text-sm">{item.label}</span>
              </div>
              <span style={{ color: '#e2e8f0' }} className="font-semibold text-sm">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔑</span>
              <span style={{ color: '#8892a4' }} className="text-sm">Role</span>
            </div>
            <span style={{ background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640' }} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Driver
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}