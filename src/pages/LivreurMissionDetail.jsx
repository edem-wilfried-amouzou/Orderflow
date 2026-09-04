import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMesMissions, majStatutMission } from '../api/livraisons'
import Spinner from '../components/Spinner'
import { formaterFCFA } from '../utils/format'
import { ArrowLeft, Phone, MapPin, Navigation2, CheckCircle2 } from 'lucide-react'

// Ordre de progression d'une mission — détermine quelle action proposer selon le statut actuel.
const PROCHAIN_STATUT = {
  ASSIGNEE: 'ACCEPTEE',
  ACCEPTEE: 'EN_COURS',
  EN_COURS: 'LIVREE',
}
const LABEL_ACTION = {
  ASSIGNEE: 'Accepter la mission',
  ACCEPTEE: 'Démarrer la livraison',
  EN_COURS: 'Marquer comme livrée',
}

export default function MissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mission, setMission] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [actionEnCours, setActionEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  function charger() {
    setChargement(true)
    // Pas d'endpoint GET /livraisons/{id}/ dédié côté livreur dans la fiche backend —
    // on récupère la mission depuis la liste de ses missions. À remplacer par un
    // GET direct si un endpoint /livraisons/mes-missions/{id}/ est ajouté côté API.
    getMesMissions()
      .then((res) => {
        const liste = res.data.results || res.data
        setMission(liste.find((m) => String(m.id) === String(id)) || null)
      })
      .finally(() => setChargement(false))
  }

  useEffect(charger, [id])

  async function avancerStatut() {
    if (!mission) return
    const prochain = PROCHAIN_STATUT[mission.statut]
    if (!prochain) return
    setErreur('')
    setActionEnCours(true)
    try {
      await majStatutMission(mission.id, { statut: prochain })
      charger()
    } catch {
      setErreur("Impossible de mettre à jour le statut. Vérifie ta connexion.")
    } finally {
      setActionEnCours(false)
    }
  }

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>
  if (!mission) return <p className="p-6 text-center text-slate-400">Mission introuvable.</p>

  const lienNavigation = mission.latitude && mission.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${mission.latitude},${mission.longitude}`
    : null

  const action = PROCHAIN_STATUT[mission.statut]
  const terminee = ['LIVREE', 'ECHEC'].includes(mission.statut)

  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 px-4 py-4 sticky top-0 bg-slate-50 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-600"><ArrowLeft size={20} /></button>
        <h1 className="font-semibold text-slate-900">Détails de la mission</h1>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-xs text-slate-400">Commande</p>
          <p className="font-bold text-slate-900">{mission.numero}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="font-semibold text-slate-900 mb-2">Destinataire & Adresse</p>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-slate-800">{mission.client_nom}</p>
            {mission.client_telephone && (
              <a href={`tel:${mission.client_telephone}`} className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Phone size={16} />
              </a>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-3">{mission.client_telephone}</p>

          <div className="flex items-start gap-2 text-sm text-slate-700 border-t border-slate-100 pt-3">
            <MapPin size={16} className="text-brand-purple mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{mission.quartier}</p>
              {mission.indications_reperes && <p className="text-slate-500">{mission.indications_reperes}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="font-semibold text-slate-900 mb-2">Paiement</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {mission.mode_paiement === 'IMMEDIAT' ? 'Déjà payé en ligne' : 'À collecter à la livraison'}
            </p>
            <p className="text-xl font-bold text-brand-purple">{formaterFCFA(mission.montant_total)}</p>
          </div>
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <div className="flex gap-3">
          {lienNavigation && (
            
            <a  href={lienNavigation}
              target="_blank"
              rel="noreferrer"
              className="flex-1 border border-brand-purple text-brand-purple font-medium py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Navigation2 size={16} /> Naviguer
            </a>
            
          )}
          {!terminee && action && (
            <button
              onClick={avancerStatut}
              disabled={actionEnCours}
              className="flex-1 gradient-brand text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 size={16} /> {actionEnCours ? '...' : LABEL_ACTION[mission.statut]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}