import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newShipment, setNewShipment] = useState({ origin: '', destination: '', status: 'pending' })

  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments')
      setShipments(response.data)
    } catch (err) {
      console.error('Failed to fetch shipments', err)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  const handleCreate = async () => {
    try {
      await api.post('/shipments', newShipment)
      setNewShipment({ origin: '', destination: '', status: 'pending' })
      setShowForm(false)
      fetchShipments()
    } catch (err) {
      console.error('Failed to create shipment', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/shipments/${id}`)
      fetchShipments()
    } catch (err) {
      console.error('Failed to delete shipment', err)
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shipments</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + New Shipment
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Shipment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Origin"
                value={newShipment.origin}
                onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="Destination"
                value={newShipment.destination}
                onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
              />
              <select
                className="border border-gray-300 rounded px-3 py-2"
                value={newShipment.status}
                onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Create Shipment
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600">ID</th>
                <th className="text-left px-6 py-3 text-gray-600">Origin</th>
                <th className="text-left px-6 py-3 text-gray-600">Destination</th>
                <th className="text-left px-6 py-3 text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">No shipments found</td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">#{shipment.id}</td>
                    <td className="px-6 py-4 text-gray-700">{shipment.origin}</td>
                    <td className="px-6 py-4 text-gray-700">{shipment.destination}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(shipment.id)}
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