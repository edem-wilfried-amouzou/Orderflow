import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateMe } from '../api/auth'

export default function Profil() {
  const { user, logout } = useAuth()
  const livreur = user?.livreur
  const [disponible, setDisponible] = useState(livreur?.disponible ?? true)
  const [enregistrement, setEnregistrement] = useState(false)

  async function basculerDisponibilite() {
    const nouvelleValeur = !disponible
    setDisponible(nouvelleValeur) // optimiste : on met à jour l'UI tout de suite
    setEnregistrement(true)
    try {
      // ⚠️ à vérifier côté backend : PATCH /auth/me/ doit accepter la mise à jour
      // imbriquée du sous-objet livreur, comme supposé pour le commerçant dans Parametres.jsx.
      await updateMe({ livreur: { disponible: nouvelleValeur } })
    } catch {
      setDisponible(!nouvelleValeur) // on annule si ça échoue côté serveur
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-6 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
          {(user?.first_name || user?.username || '?')[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900">{user?.first_name || user?.username}</p>
          <p className="text-sm text-slate-500">Livreur partenaire OrderFlow</p>
          {livreur?.vehicule && (
            <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {livreur.vehicule}
            </span>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-6">
          <div>
            <p className="font-semibold text-slate-900">Disponibilité</p>
            <p className="text-xs text-slate-500">Disponible pour de nouvelles livraisons</p>
          </div>
          <button
            onClick={basculerDisponibilite}
            disabled={enregistrement}
            className={`w-12 h-7 rounded-full transition relative shrink-0 ${disponible ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${disponible ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Informations personnelles</p>
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 mb-6">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-slate-500">Téléphone</p>
            <p className="text-sm font-medium text-slate-900">{user?.telephone || '—'}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-slate-500">Zone assignée</p>
            <p className="text-sm font-medium text-slate-900">{livreur?.zone || '—'}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{user?.email}</p>
          </div>
        </div>

        <button onClick={logout} className="w-full border border-red-200 text-red-600 font-medium py-3 rounded-xl">
          Déconnexion
        </button>
      </div>
    </div>
  )
}