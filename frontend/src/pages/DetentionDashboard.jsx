import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function DetentionDashboard() {
  const [activeEvents, setActiveEvents] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loads, setLoads] = useState([])

  const fetchData = async () => {
    try {
      const [eventsRes, driversRes, loadsRes] = await Promise.all([
        api.get('/detention/active'),
        api.get('/drivers/'),
        api.get('/loads/'),
      ])
      setActiveEvents(eventsRes.data)
      setDrivers(driversRes.data)
      setLoads(loadsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getDriver = (id) => drivers.find(d => d.id === id)
  const getLoad = (id) => loads.find(l => l.id === id)

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  const getAlertLevel = (event) => {
    if (event.detention_minutes > 120) return 'bg-red-50 border-red-400'
    if (event.detention_minutes > 0) return 'bg-orange-50 border-orange-400'
    return 'bg-blue-50 border-blue-400'
  }

  const handleDownloadReport = async (eventId) => {
    try {
      const res = await api.get(`/detention/${eventId}/report`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `detention-report-${eventId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Detention Dashboard
          </h2>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {activeEvents.length}
            </div>
            <div className="text-gray-500 mt-1">Active Detentions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">
              {activeEvents.filter(e => e.detention_minutes > 0).length}
            </div>
            <div className="text-gray-500 mt-1">In Detention Now</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              ${activeEvents.reduce((sum, e) => sum + e.detention_amount, 0).toFixed(2)}
            </div>
            <div className="text-gray-500 mt-1">Total Detention Owed</div>
          </div>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">🚛</div>
            <div className="text-xl">No active detentions right now</div>
            <div className="text-sm mt-2">All drivers are moving freely</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEvents.map((event) => {
              const driver = getDriver(event.driver_id)
              const load = getLoad(event.load_id)
              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg shadow border-l-4 p-6 ${getAlertLevel(event)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-800 text-lg">
                        {driver?.name || `Driver #${event.driver_id}`}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {load?.shipper_name || `Load #${event.load_id}`} —{' '}
                        {load?.shipper_address || ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${event.detention_minutes > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {event.detention_minutes > 0
                          ? `$${event.detention_amount.toFixed(2)}`
                          : 'Free Time'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.detention_minutes > 0 ? 'detention owed' : 'no charges yet'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-gray-500">Total Elapsed</div>
                      <div className="font-bold text-gray-800">
                        {formatTime(event.elapsed_minutes)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-gray-500">Free Time Left</div>
                      <div className={`font-bold ${event.free_time_remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {event.free_time_remaining === 0
                          ? 'EXPIRED'
                          : formatTime(event.free_time_remaining)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-gray-500">Detention Time</div>
                      <div className="font-bold text-red-600">
                        {formatTime(event.detention_minutes)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDownloadReport(event.id)}
                      className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900 transition"
                    >
                      Download Report PDF
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}