import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Pages à venir dans le prochain paquet — placeholder temporaire pour ne rien casser
function EnConstruction({ nom }) {
  return <div className="p-10 text-slate-400">Page "{nom}" — à venir dans la prochaine étape 🚧</div>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roleAutorise="COMMERCANT">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="commandes" element={<EnConstruction nom="Commandes" />} />
          <Route path="commandes/nouvelle" element={<EnConstruction nom="Nouvelle commande" />} />
          <Route path="commandes/:id" element={<EnConstruction nom="Détail commande" />} />
          <Route path="livraisons" element={<EnConstruction nom="Livraisons" />} />
          <Route path="notifications" element={<EnConstruction nom="Notifications" />} />
          <Route path="parametres" element={<EnConstruction nom="Paramètres" />} />
        </Route>

        <Route path="*" element={<div className="p-10">Page introuvable</div>} />
      </Routes>
    </AuthProvider>
  )
}