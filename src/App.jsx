import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Commandes from './pages/Commandes'
import CommandeDetail from './pages/CommandeDetail'
import NouvelleCommande from './pages/NouvelleCommande'
import Catalogue from './pages/Catalogue'
import Notifications from './pages/Notifications'
import Parametres from './pages/Parametres'
import Suivi from './pages/Suivi'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/suivi/:numero" element={<Suivi />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roleAutorise="COMMERCANT">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="commandes" element={<Commandes />} />
          <Route path="commandes/nouvelle" element={<NouvelleCommande />} />
          <Route path="commandes/:id" element={<CommandeDetail />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>

        <Route path="*" element={<div className="p-10">Page introuvable</div>} />
      </Routes>
    </AuthProvider>
  )
}