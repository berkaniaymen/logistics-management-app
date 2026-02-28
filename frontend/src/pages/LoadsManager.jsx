import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function LoadsManager() {
  const [loads, setLoads] = useState([])
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newLoad, setNewLoad] = useState({
    load_number: '',
    shipper_name: '',
    shipper_address: '',
    driver_id: '',
  })

  const fetchLoads = async () => {
    try {
      const res = await api.get('/loads/')
      setLoads(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers/')
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLoads()
    fetchDrivers()
  }, [])

  const handleCreate = async () => {
    try {
      await api.post('/loads/', {
        ...newLoad,
        driver_id: newLoad.driver_id ? parseInt(newLoad.driver_id) : null,
      })
      setNewLoad({ load_number: '', shipper_name: '', shipper_address: '', driver_id: '' })
      setShowForm(false)
      fetchLoads()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/loads/${id}/`)
      fetchLoads()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Loads Manager</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + New Load
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Load</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Load Number (e.g. LOAD-001)"
                value={newLoad.load_number}
                onChange={(e) => setNewLoad({ ...newLoad, load_number: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Shipper Name"
                value={newLoad.shipper_name}
                onChange={(e) => setNewLoad({ ...newLoad, shipper_name: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Shipper Address"
                value={newLoad.shipper_address}
                onChange={(e) => setNewLoad({ ...newLoad, shipper_address: e.target.value })}
              />
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={newLoad.driver_id}
                onChange={(e) => setNewLoad({ ...newLoad, driver_id: e.target.value })}
              >
                <option value="">-- Assign Driver --</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Create Load
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600">Load #</th>
                <th className="text-left px-6 py-3 text-gray-600">Shipper</th>
                <th className="text-left px-6 py-3 text-gray-600">Address</th>
                <th className="text-left px-6 py-3 text-gray-600">Driver</th>
                <th className="text-left px-6 py-3 text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No loads found
                  </td>
                </tr>
              ) : (
                loads.map((load) => (
                  <tr key={load.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700">{load.load_number}</td>
                    <td className="px-6 py-4 text-gray-700">{load.shipper_name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{load.shipper_address}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {drivers.find(d => d.id === load.driver_id)?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(load.status)}`}>
                        {load.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(load.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
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