import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { listerCommandes } from '../api/commandes'
import { formaterFCFA, formaterDate } from '../utils/format'
import { STATUT_COMMANDE, CANAL_CONFIG } from '../utils/statusConfig'

const STATUTS = Object.keys(STATUT_COMMANDE)
const CANAUX = Object.keys(CANAL_CONFIG)
const PAR_PAGE = 20 // doit correspondre à la pagination DRF côté backend

export default function Commandes() {
  const [commandes, setCommandes] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState('')
  const [canal, setCanal] = useState('')
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    setChargement(true)
    const params = { page, ordering: '-created_at' }
    if (statut) params.statut = statut
    if (canal) params.canal = canal
    if (recherche) params.search = recherche

    listerCommandes(params)
      .then((res) => {
        const data = res.data
        setCommandes(data.results || data)
        setCount(data.count ?? (data.results || data).length)
      })
      .finally(() => setChargement(false))
  }, [page, statut, canal, recherche])

  const totalPages = Math.max(1, Math.ceil(count / PAR_PAGE))

  return (
    <div>
      <Topbar title="Toutes les commandes" sousTitre="Lomé, Togo" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={recherche}
          onChange={(e) => { setPage(1); setRecherche(e.target.value) }}
          placeholder="Nom, téléphone, numéro..."
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <select value={statut} onChange={(e) => { setPage(1); setStatut(e.target.value) }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{STATUT_COMMANDE[s].label}</option>)}
        </select>
        <select value={canal} onChange={(e) => { setPage(1); setCanal(e.target.value) }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
          <option value="">Tous les canaux</option>
          {CANAUX.map((c) => <option key={c} value={c}>{CANAL_CONFIG[c].label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {chargement ? (
          <div className="p-10 flex justify-center"><Spinner /></div>
        ) : commandes.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm">Aucune commande ne correspond à ces filtres.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="font-medium px-5 py-3">Numéro</th>
                <th className="font-medium px-5 py-3">Client</th>
                <th className="font-medium px-5 py-3">Canal</th>
                <th className="font-medium px-5 py-3">Montant</th>
                <th className="font-medium px-5 py-3">Statut</th>
                <th className="font-medium px-5 py-3">Date</th>
                <th className="font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{c.numero}</td>
                  <td className="px-5 py-3 text-slate-600">{c.client?.nom || c.client_nom}</td>
                  <td className="px-5 py-3"><Badge config={CANAL_CONFIG[c.canal]} /></td>
                  <td className="px-5 py-3 text-slate-800">{formaterFCFA(c.montant_total)}</td>
                  <td className="px-5 py-3"><Badge config={STATUT_COMMANDE[c.statut]} /></td>
                  <td className="px-5 py-3 text-slate-500">{formaterDate(c.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/dashboard/commandes/${c.id}`} className="text-brand-blue font-medium">Détails</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Précédent</button>
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">Suivant</button>
        </div>
      )}
    </div>
  )
}