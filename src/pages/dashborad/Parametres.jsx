// src/pages/dashboard/Parametres.jsx
import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Parametres() {
  const [me, setMe] = useState(null);
  const [canaux, setCanaux] = useState({ WHATSAPP: true, FACEBOOK: false, INSTAGRAM: false });
  const [livreurs, setLivreurs] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/auth/me/").then((r) => setMe(r.data));
    // TODO backend : remplacer par GET /api/v1/livraisons/flotte/ une fois dispo pour tous les livreurs (pas que ceux "en livraison")
    api.get("/livraisons/livreurs-disponibles/").then((r) => setLivreurs(r.data.results || r.data)).catch(() => {});
  }, []);

  async function enregistrer(e) {
    e.preventDefault();
    await api.patch("/auth/me/", { username: me.username, telephone: me.telephone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!me) return <DashboardLayout title="Paramètres"><p className="text-gray-400">Chargement...</p></DashboardLayout>;

  return (
    <DashboardLayout title="Paramètres" tag="Gestion boutique">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <form onSubmit={enregistrer} className="card p-5 space-y-4">
            <p className="font-medium">Profil Boutique</p>
            <div>
              <label className="text-sm text-gray-500">Nom d'utilisateur</label>
              <input className="input-field mt-1" value={me.username} onChange={(e) => setMe({ ...me, username: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500">Téléphone</label>
              <input className="input-field mt-1" value={me.telephone} onChange={(e) => setMe({ ...me, telephone: e.target.value })} />
            </div>
            <button className="btn-primary">Enregistrer les modifications</button>
            {saved && <p className="text-sm text-emerald-600">✓ Enregistré</p>}
          </form>

          <div className="card p-5">
            <p className="font-medium mb-3">Canaux connectés</p>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              Module "canaux" en cours de développement côté backend — les bascules ci-dessous sont visuelles pour l'instant.
            </p>
            {Object.entries(canaux).map(([canal, actif]) => (
              <div key={canal} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm">{canal[0] + canal.slice(1).toLowerCase()}</span>
                <button
                  onClick={() => setCanaux((c) => ({ ...c, [canal]: !c[canal] }))}
                  className={`w-11 h-6 rounded-full transition ${actif ? "bg-emerald-400" : "bg-gray-200"} relative`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${actif ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="font-medium mb-3">Livreurs associés</p>
          <div className="space-y-2">
            {livreurs.length === 0 && <p className="text-sm text-gray-400">Aucun livreur pour le moment.</p>}
            {livreurs.map((l) => (
              <div key={l.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{l.nom}</p>
                  <p className="text-xs text-gray-400">{l.zone} · {l.moto_id}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${l.disponible ? "bg-emerald-400" : "bg-gray-300"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}