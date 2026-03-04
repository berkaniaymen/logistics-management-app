import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import DriverView from './pages/DriverView'
import LoadsManager from './pages/LoadsManager'
import DetentionDashboard from './pages/DetentionDashboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

function DispatcherRoute({ children }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token) return <Navigate to="/" />
  if (role !== 'dispatcher') return <Navigate to="/driver" />
  return children
}

function DriverRoute({ children }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token) return <Navigate to="/" />
  if (role !== 'driver') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DispatcherRoute><Dashboard /></DispatcherRoute>} />
        <Route path="/shipments" element={<DispatcherRoute><Shipments /></DispatcherRoute>} />
        <Route path="/loads" element={<DispatcherRoute><LoadsManager /></DispatcherRoute>} />
        <Route path="/detention" element={<DispatcherRoute><DetentionDashboard /></DispatcherRoute>} />
        <Route path="/driver" element={<DriverRoute><DriverView /></DriverRoute>} />
      </Routes>
    </BrowserRouter>
  )
}