import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalDrivers: 0,
    totalWarehouses: 0,
    totalCustomers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [shipments, drivers, warehouses, customers] = await Promise.all([
          api.get('/shipments'),
          api.get('/drivers'),
          api.get('/warehouses'),
          api.get('/customers'),
        ])
        setStats({
          totalShipments: shipments.data.length,
          totalDrivers: drivers.data.length,
          totalWarehouses: warehouses.data.length,
          totalCustomers: customers.data.length,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Shipments', value: stats.totalShipments, color: 'bg-blue-500', icon: '📦' },
    { label: 'Total Drivers', value: stats.totalDrivers, color: 'bg-green-500', icon: '🚗' },
    { label: 'Total Warehouses', value: stats.totalWarehouses, color: 'bg-yellow-500', icon: '🏢' },
    { label: 'Total Customers', value: stats.totalCustomers, color: 'bg-purple-500', icon: '👥' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.label} className={`${card.color} text-white rounded-lg p-6 shadow`}>
              <div className="text-4xl mb-2">{card.icon}</div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm mt-1 opacity-90">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}