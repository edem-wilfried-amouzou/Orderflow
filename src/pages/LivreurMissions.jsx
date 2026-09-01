import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMesMissions } from '../api/livraisons'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import Badge from '../components/Badge'
import { formaterFCFA } from '../utils/format'
import { STATUT_LIVRAISON } from '../utils/statusConfig'
import { MapPin } from 'lucide-react'

export default function Missions() {
  const { user } = useAuth()
  const [missions, setMissions] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    getMesMissions().then((res) => setMissions(res.data.results || res.data)).finally(() => setChargement(false))
  }, [])

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>

  const enCours = missions.filter((m) => !['LIVREE', 'ECHEC'].includes(m.statut)).length
  const livrees = missions.filter((m) => m.statut === 'LIVREE').length

  return (
    <div className="px-4 pt-6">
      <p className="text-sm text-slate-500">Ravi de vous revoir,</p>
      <h1 className="text-xl font-bold text-slate-900 mb-4">Bonjour {user?.first_name || user?.username} 👋</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-100 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{missions.length}</p>
          <p className="text-xs text-slate-500">Missions</p>
        </div>
        <div className="bg-blue-100 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{enCours}</p>
          <p className="text-xs text-blue-600">En cours</p>
        </div>
        <div className="bg-emerald-100 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{livrees}</p>
          <p className="text-xs text-emerald-600">Livrées</p>
        </div>
      </div>

      <p className="font-semibold text-slate-900 mb-3">Missions d'aujourd'hui</p>

      {missions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">Aucune mission pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const enCoursActive = !['LIVREE', 'ECHEC'].includes(m.statut)
            return (
              <Link
                key={m.id}
                to={`/livreur/missions/${m.id}`}
                className={`block bg-white rounded-2xl p-4 border ${enCoursActive ? 'border-brand-blue shadow-sm' : 'border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{m.numero}</p>
                  <Badge config={STATUT_LIVRAISON[m.statut]} />
                </div>
                <p className="text-sm text-slate-700">{m.client_nom}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin size={13} /> {m.quartier}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Montant à collecter</p>
                    <p className="font-bold text-slate-900">{formaterFCFA(m.montant_total)}</p>
                  </div>
                  {enCoursActive ? (
                    <span className="gradient-brand text-white text-xs font-medium px-4 py-2 rounded-xl">Traiter</span>
                  ) : (
                    <span className="border border-slate-200 text-slate-500 text-xs font-medium px-4 py-2 rounded-xl">Voir détails</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}