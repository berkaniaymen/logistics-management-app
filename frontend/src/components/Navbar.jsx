export default function Navbar() {
    const role = localStorage.getItem('role')
  
    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('driver_id')
      window.location.href = '/'
    }
  
    return (
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🚚 Logistics Management</h1>
        <div className="flex gap-6 items-center">
          {role === 'dispatcher' && (
            <>
              <a href="/dashboard" className="hover:text-blue-200 transition">Dashboard</a>
              <a href="/shipments" className="hover:text-blue-200 transition">Shipments</a>
              <a href="/loads" className="hover:text-blue-200 transition">Loads</a>
              <a href="/detention" className="hover:text-blue-200 transition">Detention</a>
            </>
          )}
          {role === 'driver' && (
            <a href="/driver" className="hover:text-blue-200 transition">My View</a>
          )}
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