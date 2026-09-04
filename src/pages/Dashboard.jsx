import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { getStats, getActivite7j, getFinances } from '../api/dashboard'
import { listerCommandes } from '../api/commandes'
import { formaterFCFA, formaterDate } from '../utils/format'
import { STATUT_COMMANDE, CANAL_CONFIG } from '../utils/statusConfig'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [activite, setActivite] = useState([])
  const [finances, setFinances] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getActivite7j(), getFinances(), listerCommandes({ ordering: '-created_at' })])
      .then(([s, a, f, c]) => {
        setStats(s.data)
        setActivite(a.data)
        setFinances(f.data)
        setCommandes((c.data.results || c.data).slice(0, 5))
      })
      .finally(() => setChargement(false))
  }, [])

  if (chargement) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <Topbar title="Tableau de bord" sousTitre="Lomé, Togo" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Commandes du jour" value={stats?.commandes_du_jour ?? 0} />
        <StatCard label="En attente traitement" value={stats?.en_attente_traitement ?? 0} hintColor="text-amber-600" hint="À traiter" />
        <StatCard label="En cours de livraison" value={stats?.en_cours_livraison ?? 0} hintColor="text-purple-600" hint="En dispatch" />
        <StatCard label="Livrées avec succès" value={stats?.livrees_avec_succes ?? 0} hintColor="text-emerald-600" hint="100% satisfaction" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="font-semibold text-slate-900 mb-4">Activité (derniers 7 jours)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activite}>
              <XAxis dataKey="jour" axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="nombre" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="gradient-brand rounded-2xl p-5 text-white flex flex-col justify-between">
          <div>
            <p className="text-sm text-white/80">Performances financières</p>
            <p className="text-xs text-white/60 mt-1">Total collecté aujourd'hui</p>
          </div>
          <div>
            <p className="text-3xl font-bold mt-4">{formaterFCFA(finances?.total_collecte_aujourdhui)}</p>
            <p className="text-xs text-white/80 mt-1">Taux de livraison : {finances?.taux_livraison ?? 0}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <p className="font-semibold text-slate-900">Dernières commandes enregistrées</p>
          <Link to="/dashboard/commandes" className="text-sm text-brand-blue font-medium">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-slate-400 border-t border-slate-100">
              <th className="font-medium px-5 py-2">Numéro</th>
              <th className="font-medium px-5 py-2">Client</th>
              <th className="font-medium px-5 py-2">Canal</th>
              <th className="font-medium px-5 py-2">Montant</th>
              <th className="font-medium px-5 py-2">Statut</th>
              <th className="font-medium px-5 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((c) => (
              <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">
                  <Link to={`/dashboard/commandes/${c.id}`}>{c.numero}</Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{c.client_nom || c.client?.nom}</td>
                <td className="px-5 py-3"><Badge config={CANAL_CONFIG[c.canal]} /></td>
                <td className="px-5 py-3 text-slate-800">{formaterFCFA(c.montant_total)}</td>
                <td className="px-5 py-3"><Badge config={STATUT_COMMANDE[c.statut]} /></td>
                <td className="px-5 py-3 text-slate-500">{formaterDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}