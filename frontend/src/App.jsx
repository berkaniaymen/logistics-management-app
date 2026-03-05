import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import DriverView from './pages/DriverView'
import LoadsManager from './pages/LoadsManager'
import DetentionDashboard from './pages/DetentionDashboard'

function getRole() {
  try { return localStorage.getItem('role') } catch { return null }
}

function getToken() {
  try { return localStorage.getItem('token') } catch { return null }
}

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/" />
}

function DispatcherRoute({ children }) {
  if (!getToken()) return <Navigate to="/" />
  if (getRole() !== 'dispatcher') return <Navigate to="/driver" />
  return children
}

function DriverRoute({ children }) {
  if (!getToken()) return <Navigate to="/" />
  if (getRole() !== 'driver') return <Navigate to="/dashboard" />
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