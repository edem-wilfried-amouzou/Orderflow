import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { registerCommercant } = useAuth()
  const navigate = useNavigate()
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [form, setForm] = useState({
    username: '', email: '', telephone: '', password: '',
    nom_boutique: '', secteur_activite: '', ville: 'Lomé', adresse_boutique: '',
  })

  function champ(nom) {
    return { value: form[nom], onChange: (e) => setForm({ ...form, [nom]: e.target.value }) }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const me = await registerCommercant(form)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      setErreur(`${data ? Object.values(data).flat().join(' ') : err.message || 'Une erreur est survenue.'}`)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="OrderFlow" className="h-8 w-auto" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Créer un compte commerçant</h1>
        <p className="text-sm text-slate-500 text-center mb-6">Rejoignez OrderFlow à Lomé</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input required placeholder="Nom d'utilisateur" {...champ('username')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input required type="email" placeholder="Email" {...champ('email')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input placeholder="Téléphone" {...champ('telephone')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input required type="password" minLength={8} placeholder="Mot de passe (8 caractères min.)" {...champ('password')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input required placeholder="Nom de la boutique" {...champ('nom_boutique')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input placeholder="Secteur d'activité" {...champ('secteur_activite')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <input placeholder="Adresse de la boutique" {...champ('adresse_boutique')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue" />

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button type="submit" disabled={chargement} className="gradient-brand w-full text-white font-medium py-2.5 rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-60">
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Déjà un compte ? <Link to="/login" className="text-brand-blue font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}