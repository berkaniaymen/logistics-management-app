export default function Navbar() {
    const role = localStorage.getItem("role")
    const path = window.location.pathname
  
    const handleLogout = () => {
      localStorage.clear()
      window.location.href = "/"
    }
  
    const dispatcherLinks = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Loads", href: "/loads" },
      { label: "Detention", href: "/detention" },
      { label: "Shipments", href: "/shipments" },
    ]
  
    const driverLinks = [{ label: "My View", href: "/driver" }]
  
    const links = role === "driver" ? driverLinks : dispatcherLinks
  
    return (
      <div
        style={{ background: "#1a1f2e", borderBottom: "1px solid #2a3147" }}
        className="px-8 py-4 flex items-center justify-between"
      >
        <div>
          <div style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: "700" }}>
            🚚 LogiTrack
          </div>
          <div style={{ color: "#8892a4", fontSize: "11px" }}>
            {role === "driver" ? "Driver Portal" : "Dispatcher Portal"}
          </div>
        </div>
  
        <div className="flex items-center gap-6">
          {links.map((item) => {
            const isActive = path === item.href
            return (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium hover:text-blue-400 transition"
                style={{
                  color: isActive ? "#60a5fa" : "#8892a4",
                  borderBottom: isActive
                    ? "2px solid #60a5fa"
                    : "2px solid transparent",
                  paddingBottom: "2px",
                }}
              >
                {item.label}
              </a>
            )
          })}
  
          <button
            onClick={handleLogout}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition"
            style={{
              background: "#ef444420",
              color: "#f87171",
              border: "1px solid #ef444440",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    )
  }