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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/shipments" element={<PrivateRoute><Shipments /></PrivateRoute>} />
        <Route path="/driver" element={<PrivateRoute><DriverView /></PrivateRoute>} />
        <Route path="/loads" element={<PrivateRoute><LoadsManager /></PrivateRoute>} />
        <Route path="/detention" element={<PrivateRoute><DetentionDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}