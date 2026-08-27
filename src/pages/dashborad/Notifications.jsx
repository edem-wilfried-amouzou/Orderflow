// src/pages/dashboard/Notifications.jsx
import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";

const FILTRES = [
  { key: "TOUTES", label: "Toutes" },
  { key: "NON_LUES", label: "Non lues" },
];

const ICONES = {
  NOUVELLE_COMMANDE: { icon: "➕", bg: "bg-purple-100" },
  LIVREUR_ASSIGNE: { icon: "🚚", bg: "bg-emerald-100" },
  COMMANDE_LIVREE: { icon: "✅", bg: "bg-emerald-100" },
  COMMANDE_ANNULEE: { icon: "⚠️", bg: "bg-red-100" },
  COMMANDE_VALIDEE: { icon: "✏️", bg: "bg-amber-100" },
  LIVRAISON_EN_COURS: { icon: "🛵", bg: "bg-blue-100" },
};

function relativeTime(dateStr) {
  const diffMin = Math.round((Date.now() - new Date(dateStr)) / 60000);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffMin < 1440) return `Il y a ${Math.round(diffMin / 60)} h`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [filtre, setFiltre] = useState("TOUTES");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/notifications/").then((r) => setNotifs(r.data.results || r.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function marquerLu(id) {
    await api.post(`/notifications/${id}/lu/`);
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  }

  const visibles = filtre === "NON_LUES" ? notifs.filter((n) => !n.lu) : notifs;

  return (
    <DashboardLayout title="Notifications" tag="Flux en direct">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {FILTRES.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                filtre === f.key ? "bg-brand-purple text-white border-brand-purple" : "border-gray-200 text-gray-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => Promise.all(notifs.filter((n) => !n.lu).map((n) => marquerLu(n.id)))}
          className="text-sm border border-gray-200 rounded-full px-4 py-1.5"
        >
          Marquer tout comme lu
        </button>
      </div>

      <div className="card divide-y divide-gray-50">
        {loading ? (
          <p className="p-6 text-gray-400">Chargement...</p>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-gray-400">Rien à afficher.</p>
        ) : (
          visibles.map((n) => {
            const meta = ICONES[n.type] || { icon: "🔔", bg: "bg-gray-100" };
            return (
              <div
                key={n.id}
                onClick={() => !n.lu && marquerLu(n.id)}
                className={`flex gap-3 p-4 cursor-pointer ${!n.lu ? "bg-purple-50/40" : ""}`}
              >
                <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {n.titre} {!n.lu && <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-purple ml-1" />}
                  </p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                </div>
                <span className="text-xs text-gray-300 whitespace-nowrap">{relativeTime(n.created_at)}</span>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}