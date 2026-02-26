export default function Navbar() {
    const handleLogout = () => {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
  
    return (
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🚚 Logistics Management</h1>
        <div className="flex gap-6">
          <a href="/dashboard" className="hover:text-blue-200 transition">Dashboard</a>
          <a href="/shipments" className="hover:text-blue-200 transition">Shipments</a>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>
    )
  }