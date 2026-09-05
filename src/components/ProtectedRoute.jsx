import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children, roleAutorise }) {
  const { user, chargement } = useAuth()

  if (chargement) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roleAutorise && user.role !== roleAutorise) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}