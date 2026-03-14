import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Navbar() {
  const role = localStorage.getItem('role')
  const path = window.location.pathname
  const [paymentCount, setPaymentCount] = useState(0)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (role !== 'dispatcher') return

    const fetchCount = async () => {
      try {
        const res = await api.get('/detention/payment-requests')
        setPaymentCount(res.data.length)
      } catch (err) {
        console.error(err)
      }
    }

    fetchCount()
  }, [role])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  const dispatcherLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Loads', href: '/loads', icon: '📦' },
    { label: 'Detention', href: '/detention', icon: '⏱' },
    { label: 'Shipments', href: '/shipments', icon: '🚢' },
    { label: 'Drivers', href: '/drivers', icon: '🚛' },
    { label: 'Customers', href: '/customers', icon: '👥' },
    { label: 'Warehouses', href: '/warehouses', icon: '🏢' },
    { label: 'Add Driver', href: '/create-driver', icon: '➕' },
    { label: 'Payments', href: '/payments', icon: '💰', badge: paymentCount },
  ]

  const driverLinks = [
    { label: 'My View', href: '/driver', icon: '🚛' },
    { label: 'History', href: '/history', icon: '📋' },
    { label: 'Profile', href: '/profile', icon: '👤' },
  ]

  const links = role === 'driver' ? driverLinks : dispatcherLinks

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: open ? '220px' : '60px',
          background: '#1a1f2e',
          borderRight: '1px solid #2a3147',
          transition: 'width 0.2s ease',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Logo + Toggle */}
        <div
          style={{
            padding: '16px 12px',
            borderBottom: '1px solid #2a3147',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
          }}
        >
          {open && (
            <div>
              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: '16px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                }}
              >
                🚚 LogiTrack
              </div>
              <div
                style={{
                  color: '#8892a4',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {role === 'driver' ? 'Driver Portal' : 'Dispatcher Portal'}
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8892a4',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              marginLeft: open ? '0' : 'auto',
              marginRight: open ? '0' : 'auto',
            }}
          >
            ☰
          </button>
        </div>

        {/* Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {links.map((item) => {
            const isActive = path === item.href

            return (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  color: isActive ? '#60a5fa' : '#8892a4',
                  background: isActive ? '#3b82f620' : 'transparent',
                  borderLeft: isActive
                    ? '3px solid #60a5fa'
                    : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {item.icon}
                </span>

                {open && <span style={{ flex: 1 }}>{item.label}</span>}

                {open && item.badge && item.badge > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            )
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #2a3147' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#ef444420',
              color: '#f87171',
              border: '1px solid #ef444440',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {open ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Page offset */}
      <div
        style={{
          marginLeft: open ? '220px' : '60px',
          transition: 'margin-left 0.2s ease',
        }}
        id="sidebar-offset"
      />
    </>
  )
}