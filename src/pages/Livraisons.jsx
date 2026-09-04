import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Spinner from '../components/Spinner'
import { listerCommandes } from '../api/commandes'
import { demanderLivreur, getFlotte } from '../api/livraisons'
import { formaterFCFA } from '../utils/format'
import { Truck } from 'lucide-react'

export default function Livraisons() {
  const [aAssigner, setAAssigner] = useState([])
  const [flotte, setFlotte] = useState([])
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState('')

  function charger() {
    setChargement(true)
    Promise.all([
      listerCommandes({ statut: 'VALIDEE', ordering: 'created_at' }),
      getFlotte(),
    ])
      .then(([c, f]) => {
        setAAssigner(c.data.results || c.data)
        setFlotte(f.data.results || f.data)
      })
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function assigner(commandeId) {
    setErreur('')
    setEnCours(commandeId)
    try {
      await demanderLivreur(commandeId)
      charger()
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Aucun livreur disponible actuellement.')
    } finally {
      setEnCours(null)
    }
  }

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>

  return (
    <div>
      <Topbar title="Gestion des livraisons" sousTitre="Attribution automatique par proximité" />

      {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="font-semibold text-slate-900 mb-1">Commandes à assigner</p>
          <p className="text-xs text-slate-500 mb-4">Commandes validées, en attente d'un livreur</p>

          {aAssigner.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune commande en attente d'attribution.</p>
          ) : (
            <div className="space-y-3">
              {aAssigner.map((c) => (
                <div key={c.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{c.numero}</p>
                    <p className="text-sm text-slate-500">{formaterFCFA(c.montant_total)}</p>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{c.client?.nom || c.client_nom} · {c.adresse?.quartier}</p>
                  <button
                    disabled={enCours === c.id}
                    onClick={() => assigner(c.id)}
                    className="gradient-brand text-white text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-60"
                  >
                    {enCours === c.id ? 'Attribution...' : 'Assigner un livreur'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="font-semibold text-slate-900 mb-1">Flotte en mission</p>
          <p className="text-xs text-slate-500 mb-4">Livreurs actuellement en livraison pour vos commandes</p>

          {flotte.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun livreur en mission pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {flotte.map((l) => (
                <div key={l.id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{l.nom}</p>
                    <p className="text-xs text-slate-500">{l.zone || 'Zone non renseignée'} · {l.vehicule || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}