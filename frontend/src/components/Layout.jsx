import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1420' }}>
      <Navbar />
      <div style={{ flex: 1, minWidth: 0, marginLeft: '60px', transition: 'margin-left 0.2s ease' }}>
        {children}
      </div>
    </div>
  )
}