import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DriverView() {
  const [loads, setLoads] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState('')

  const driverId = parseInt(localStorage.getItem('driver_id'))

  const fetchLoads = async () => {
    try {
      const res = await api.get('/loads/')
      setLoads(res.data.filter((l) => l.status === 'pending'))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchActive = async () => {
    try {
      const res = await api.get('/detention/active')
      const mine = res.data.find((e) => e.driver_id === driverId)
      if (mine) {
        setActiveEvent(mine)
        setElapsed(mine.elapsed_minutes)
      } else {
        setActiveEvent(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLoads()
    fetchActive()
  }, [])

  useEffect(() => {
    if (!activeEvent) return
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [activeEvent])

  useEffect(() => {
    if (activeEvent) {
      const freeTimeRemaining = Math.max(0, activeEvent.free_time_minutes - elapsed)
      if (freeTimeRemaining === 0 && Notification.permission === 'granted') {
        new Notification('Detention Started!', {
          body: 'Free time has expired. Detention clock is now running.',
        })
      }
    }
  }, [elapsed])

  const handleCheckin = async () => {
    if (!selectedLoad) return alert('Please select a load first')
    setLoading(true)
    try {
      await Notification.requestPermission()
      const res = await api.post('/detention/checkin/', {
        load_id: parseInt(selectedLoad),
        driver_id: driverId,
        free_time_minutes: 120,
        detention_rate: 50.0,
      })
      setActiveEvent({ ...res.data, elapsed_minutes: 0, free_time_remaining: 120 })
      setElapsed(0)
      fetchLoads()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleCheckout = async () => {
    if (!activeEvent) return
    setLoading(true)
    try {
      await api.post('/detention/checkout/' + activeEvent.id + '/', {})
      setActiveEvent(null)
      setElapsed(0)
      fetchLoads()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h + 'h ' + m + 'm'
  }

  const freeTimeRemaining = activeEvent
    ? Math.max(0, activeEvent.free_time_minutes - elapsed)
    : 120

  const detentionMinutes = activeEvent
    ? Math.max(0, elapsed - activeEvent.free_time_minutes)
    : 0

  const detentionAmount = ((detentionMinutes / 60) * 50).toFixed(2)
  const isInDetention = freeTimeRemaining === 0

  return (
    <div style={{ background: '#0f1420', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <div className="p-8 max-w-xl mx-auto">

        <div className="mb-8">
          <h2 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '700' }}>
            Driver Portal
          </h2>
          <p style={{ color: '#8892a4' }} className="text-sm mt-1">
            Check in when you arrive at a shipper. Check out when you leave.
          </p>
        </div>

        {!activeEvent ? (
          <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-6 space-y-4">
            <h3 style={{ color: '#e2e8f0' }} className="font-semibold text-lg">
              Select a Load to Check In
            </h3>
            {loads.length === 0 ? (
              <div style={{ color: '#8892a4' }} className="text-sm py-4 text-center">
                No loads assigned to you yet.
              </div>
            ) : (
              <select
                value={selectedLoad}
                onChange={(e) => setSelectedLoad(e.target.value)}
                style={{ background: '#0f1420', border: '1px solid #2a3147', color: '#e2e8f0' }}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              >
                <option value="">-- Select Load --</option>
                {loads.map((load) => (
                  <option key={load.id} value={load.id}>
                    {load.load_number} — {load.shipper_name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleCheckin}
              disabled={loading}
              style={{ background: loading ? '#2a3147' : '#10b981' }}
              className="w-full text-white font-bold py-3 rounded-xl text-lg hover:opacity-90 transition"
            >
              {loading ? 'Checking In...' : '✅ CHECK IN — I Have Arrived'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              style={{ background: isInDetention ? '#ef444420' : '#3b82f620', border: '1px solid ' + (isInDetention ? '#ef444440' : '#3b82f640') }}
              className="rounded-xl p-6 text-center"
            >
              <div style={{ color: isInDetention ? '#f87171' : '#60a5fa' }} className="text-xs uppercase tracking-widest font-bold mb-2">
                {isInDetention ? '🔴 DETENTION RUNNING' : '🟡 FREE TIME REMAINING'}
              </div>
              <div style={{ color: isInDetention ? '#f87171' : '#60a5fa' }} className="text-7xl font-bold my-4">
                {isInDetention ? formatTime(detentionMinutes) : formatTime(freeTimeRemaining)}
              </div>
              <div style={{ color: '#8892a4' }} className="text-sm">
                {isInDetention ? 'Detention amount: $' + detentionAmount : 'Free time — no charges yet'}
              </div>
            </div>

            <div style={{ background: '#1a1f2e', border: '1px solid #2a3147' }} className="rounded-xl p-5 space-y-3">
              <h3 style={{ color: '#e2e8f0' }} className="font-semibold">Session Details</h3>
              {[
                { label: 'Total elapsed time', value: formatTime(elapsed) },
                { label: 'Free time allowed', value: '2 hours' },
                { label: 'Detention rate', value: '$50.00/hour' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm" style={{ borderBottom: '1px solid #2a3147', paddingBottom: '8px' }}>
                  <span style={{ color: '#8892a4' }}>{row.label}</span>
                  <span style={{ color: '#e2e8f0' }} className="font-medium">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-bold pt-1">
                <span style={{ color: '#8892a4' }}>Amount owed</span>
                <span style={{ color: '#f87171' }}>${detentionAmount}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ background: loading ? '#2a3147' : '#ef4444' }}
              className="w-full text-white font-bold py-3 rounded-xl text-lg hover:opacity-90 transition"
            >
              {loading ? 'Checking Out...' : '🚛 CHECK OUT — I Am Leaving'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}