import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Spinner from '../components/Spinner'
import { listerNotifications, marquerCommeLue } from '../api/notifications'
import { formaterDate } from '../utils/format'
import { PlusCircle, Truck, CheckCircle2, AlertTriangle, Pencil, Bell } from 'lucide-react'

const ICONES = {
  NOUVELLE_COMMANDE: { icon: PlusCircle, color: 'bg-violet-100 text-violet-600' },
  LIVREUR_ASSIGNE: { icon: Truck, color: 'bg-emerald-100 text-emerald-600' },
  COMMANDE_LIVREE: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
  COMMANDE_ANNULEE: { icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  COMMANDE_VALIDEE: { icon: Pencil, color: 'bg-amber-100 text-amber-600' },
  LIVRAISON_EN_COURS: { icon: Truck, color: 'bg-blue-100 text-blue-600' },
}

const ONGLETS = [
  { id: 'TOUTES', label: 'Toutes' },
  { id: 'NON_LUES', label: 'Non lues' },
  { id: 'COMMANDES', label: 'Commandes' },
  { id: 'LIVRAISONS', label: 'Livraisons' },
]

const estCommande = (type) => ['NOUVELLE_COMMANDE', 'COMMANDE_VALIDEE', 'COMMANDE_ANNULEE'].includes(type)
const estLivraison = (type) => ['LIVREUR_ASSIGNE', 'LIVRAISON_EN_COURS', 'COMMANDE_LIVREE'].includes(type)

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [onglet, setOnglet] = useState('TOUTES')

  function charger() {
    setChargement(true)
    listerNotifications().then((res) => setNotifs(res.data.results || res.data)).finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function lire(id) {
    await marquerCommeLue(id)
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
  }

  async function toutMarquerLu() {
    const nonLues = notifs.filter((n) => !n.lu)
    await Promise.all(nonLues.map((n) => marquerCommeLue(n.id)))
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })))
  }

  const filtrees = notifs.filter((n) => {
    if (onglet === 'NON_LUES') return !n.lu
    if (onglet === 'COMMANDES') return estCommande(n.type)
    if (onglet === 'LIVRAISONS') return estLivraison(n.type)
    return true
  })

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>

  return (
    <div>
      <Topbar title="Notifications" sousTitre="Flux en direct" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-slate-100 rounded-xl p-1">
          {ONGLETS.map((o) => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${onglet === o.id ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={toutMarquerLu} className="text-sm font-medium text-slate-600 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50">
          Marquer tout comme lu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
        {filtrees.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm">Rien à afficher ici.</p>
        ) : (
          filtrees.map((n) => {
            const conf = ICONES[n.type] || { icon: Bell, color: 'bg-slate-100 text-slate-600' }
            const Icon = conf.icon
            return (
              <button
                key={n.id}
                onClick={() => !n.lu && lire(n.id)}
                className={`w-full text-left flex items-start gap-4 p-5 hover:bg-slate-50 ${!n.lu ? 'bg-violet-50/40' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${conf.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{n.titre}</p>
                    {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                </div>
                <p className="text-xs text-slate-400 shrink-0">{formaterDate(n.created_at)}</p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}