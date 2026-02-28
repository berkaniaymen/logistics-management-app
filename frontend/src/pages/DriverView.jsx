import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DriverView() {
  const [loads, setLoads] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState('')
  const [driverId, setDriverId] = useState(1)

  const fetchLoads = async () => {
    try {
      const res = await api.get('/loads/')
      setLoads(res.data.filter(l => l.status === 'pending'))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchActive = async () => {
    try {
      const res = await api.get('/detention/active')
      if (res.data.length > 0) {
        setActiveEvent(res.data[0])
        setElapsed(res.data[0].elapsed_minutes)
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
      setElapsed(prev => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [activeEvent])

  useEffect(() => {
    if (activeEvent) {
      const freeTime = activeEvent.free_time_remaining
      if (freeTime === 0) {
        if (Notification.permission === 'granted') {
          new Notification('Detention Started!', {
            body: 'Free time has expired. Detention clock is now running.',
          })
        }
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
      await api.post(`/detention/checkout/${activeEvent.id}/`, {})
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
    return `${h}h ${m}m`
  }

  const freeTimeRemaining = activeEvent
    ? Math.max(0, activeEvent.free_time_remaining - (elapsed - activeEvent.elapsed_minutes))
    : 120

  const detentionMinutes = activeEvent
    ? Math.max(0, elapsed - activeEvent.free_time_remaining)
    : 0

  const detentionAmount = activeEvent
    ? ((detentionMinutes / 60) * 50).toFixed(2)
    : '0.00'

  const isInDetention = freeTimeRemaining === 0

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Driver View</h2>

        {!activeEvent ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Select a Load to Check In</h3>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={selectedLoad}
              onChange={(e) => setSelectedLoad(e.target.value)}
            >
              <option value="">-- Select Load --</option>
              {loads.map(load => (
                <option key={load.id} value={load.id}>
                  {load.load_number} — {load.shipper_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCheckin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-green-700 transition"
            >
              {loading ? 'Checking In...' : '✅ CHECK IN — I Have Arrived'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-lg shadow p-6 text-white ${isInDetention ? 'bg-red-600' : 'bg-blue-600'}`}>
              <div className="text-center">
                <div className="text-sm uppercase tracking-wide mb-1">
                  {isInDetention ? '🔴 DETENTION RUNNING' : '🟡 FREE TIME REMAINING'}
                </div>
                <div className="text-6xl font-bold my-4">
                  {isInDetention ? formatTime(detentionMinutes) : formatTime(freeTimeRemaining)}
                </div>
                <div className="text-sm opacity-80">
                  {isInDetention
                    ? `Detention amount: $${detentionAmount}`
                    : 'Free time — no charges yet'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Session Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total elapsed time:</span>
                  <span className="font-medium">{formatTime(elapsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free time allowed:</span>
                  <span className="font-medium">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Detention rate:</span>
                  <span className="font-medium">$50.00/hour</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t">
                  <span>Amount owed:</span>
                  <span>${detentionAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700 transition"
            >
              {loading ? 'Checking Out...' : '🚛 CHECK OUT — I Am Leaving'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}