// src/pages/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatusBadge, CanalBadge } from "../../components/StatusBadge";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activite, setActivite] = useState([]);
  const [finances, setFinances] = useState(null);
  const [dernieres, setDernieres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, f, c] = await Promise.all([
          api.get("/dashboard/stats/"),
          api.get("/dashboard/activite-7j/"),
          api.get("/dashboard/finances/"),
          api.get("/commandes/?ordering=-created_at"),
        ]);
        setStats(s.data);
        setActivite(a.data);
        setFinances(f.data);
        setDernieres((c.data.results || c.data).slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxNombre = Math.max(1, ...activite.map((a) => a.nombre));

  return (
    <DashboardLayout title="Tableau de bord" tag="Lomé, Togo">
      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Link to="/commandes/nouvelle" className="btn-primary w-auto px-5">
              + Nouvelle Commande
            </Link>
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Commandes du jour" value={stats.commandes_du_jour} sub="+12% aujourd'hui" color="text-blue-600" />
            <StatCard label="En attente" value={stats.en_attente_traitement} sub="À traiter" color="text-amber-600" />
            <StatCard label="En cours de livraison" value={stats.en_cours_livraison} sub="En déplacement" color="text-purple-600" />
            <StatCard label="Livrées avec succès" value={stats.livrees_avec_succes} sub="98% satisfaction" color="text-emerald-600" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Graphique activité 7j */}
            <div className="card p-5 col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-4">Activité (derniers 7 jours)</p>
              <div className="flex items-end justify-between gap-2 h-40">
                {activite.map((a) => (
                  <div key={a.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-purple to-brand-cyan"
                      style={{ height: `${(a.nombre / maxNombre) * 100}%`, minHeight: 4 }}
                    />
                    <span className="text-xs text-gray-400">{a.jour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Finances */}
            <div className="card p-5 bg-gradient-to-br from-brand-purple to-indigo-700 text-white">
              <p className="text-sm text-white/80">Performances Financières</p>
              <p className="text-xs text-white/60 mb-4">Total collecté aujourd'hui</p>
              <p className="text-3xl font-bold mb-1">
                {finances.total_collecte_aujourdhui.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-white/80">Taux de livraison {finances.taux_livraison}%</p>
            </div>
          </div>

          {/* Dernières commandes */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-700">Dernières commandes enregistrées</p>
              <Link to="/commandes" className="text-sm text-brand-purple">Voir tout</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Numéro</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Canal</th>
                  <th className="pb-2">Montant</th>
                  <th className="pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {dernieres.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <Link to={`/commandes/${c.id}`} className="text-brand-purple font-medium">
                        {c.numero}
                      </Link>
                    </td>
                    <td>{c.client_nom}</td>
                    <td><CanalBadge canal={c.canal} /></td>
                    <td>{Number(c.montant_total).toLocaleString()} FCFA</td>
                    <td><StatusBadge statut={c.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold my-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}