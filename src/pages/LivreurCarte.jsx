import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMesMissions } from '../api/livraisons'
import Spinner from '../components/Spinner'
import { MapPin } from 'lucide-react'

// Aucune maquette n'a été fournie pour cet onglet "Carte". Plutôt que d'inventer une
// vraie carte interactive (ce qui demanderait une lib comme Leaflet/Google Maps + une
// clé API), on affiche pour l'instant la liste des missions en cours avec leur quartier.
// À remplacer par une vraie carte quand la maquette/le besoin sera précisé.
export default function Carte() {
  const [missions, setMissions] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    getMesMissions().then((res) => {
      const liste = res.data.results || res.data
      setMissions(liste.filter((m) => !['LIVREE', 'ECHEC'].includes(m.statut)))
    }).finally(() => setChargement(false))
  }, [])

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Mes missions en cours</h1>
      <p className="text-sm text-slate-500 mb-4">Vue carte à venir — voici en attendant la liste par quartier.</p>

      {missions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">Aucune mission en cours.</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => (
            <Link key={m.id} to={`/livreur/missions/${m.id}`} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-violet-100 text-brand-purple flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{m.quartier}</p>
                <p className="text-xs text-slate-500">{m.numero} · {m.client_nom}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}