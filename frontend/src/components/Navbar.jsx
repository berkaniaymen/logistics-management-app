import { useEffect, useState } from "react"
import api from "../api/axios"

export default function Navbar() {
  const role = localStorage.getItem("role")
  const path = window.location.pathname
  const [paymentCount, setPaymentCount] = useState(0)

  useEffect(() => {
    if (role !== "dispatcher") return

    const fetchCount = async () => {
      try {
        const res = await api.get("/detention/payment-requests")
        setPaymentCount(res.data.length)
      } catch (err) {
        console.error(err)
      }
    }

    fetchCount()
  }, [role])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  const dispatcherLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Loads", href: "/loads" },
    { label: "Detention", href: "/detention" },
    { label: "Shipments", href: "/shipments" },
    { label: "Drivers", href: "/drivers" },
    { label: "Add Driver", href: "/create-driver" },
    { label: "Payments", href: "/payments", badge: paymentCount },
    { label: 'Customers', href: '/customers' },
  ]

  const driverLinks = [
    { label: "My View", href: "/driver" },
    { label: "History", href: "/history" },
    { label: "Profile", href: "/profile" },
  ]

  const links = role === "driver" ? driverLinks : dispatcherLinks

  return (
    <div
      className="px-8 py-4 flex items-center justify-between"
      style={{ background: "#1a1f2e", borderBottom: "1px solid #2a3147" }}
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
              className="text-sm font-medium transition flex items-center gap-1"
              style={{
                color: isActive ? "#60a5fa" : "#8892a4",
                borderBottom: isActive
                  ? "2px solid #60a5fa"
                  : "2px solid transparent",
                paddingBottom: "2px",
              }}
            >
              {item.label}

              {item.badge && item.badge > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "1px 6px",
                    borderRadius: "999px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          )
        })}

        <button
          onClick={handleLogout}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg transition"
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