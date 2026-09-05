import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const me = await login(email, password)
      navigate(me.role === 'LIVREUR' ? '/livreur' : '/dashboard')
    } catch (err) {
      setErreur(err.response?.data?.non_field_errors?.[0] || 'Email ou mot de passe incorrect.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="OrderFlow" className="h-14 w-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Connexion Marchand</h1>
          <p className="text-sm text-slate-500">Gérez vos commandes à Lomé</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Adresse Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="boutique@exemple.tg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="••••••••"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="gradient-brand w-full text-white font-medium py-2.5 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Nouveau commerçant ?{' '}
          <Link to="/register" className="text-brand-blue font-medium">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}