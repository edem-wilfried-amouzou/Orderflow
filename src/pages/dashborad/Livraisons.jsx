// src/pages/dashboard/Livraisons.jsx
import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function Livraisons() {
  const [aAssigner, setAAssigner] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [selection, setSelection] = useState({}); // { commandeId: livreurId }
  const [busyId, setBusyId] = useState(null);

  function load() {
    api.get("/livraisons/a-assigner/").then((r) => setAAssigner(r.data.results || r.data));
    api.get("/livraisons/livreurs-disponibles/").then((r) => setLivreurs(r.data.results || r.data));
  }

  useEffect(load, []);

  async function assigner(commandeId) {
    const livreurId = selection[commandeId];
    if (!livreurId) return;
    setBusyId(commandeId);
    try {
      await api.post(`/livraisons/${commandeId}/assigner/`, { livreur_id: livreurId });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout title="Gestion des Livraisons" tag="Lomé, Togo">
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium">Commandes à assigner</p>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {aAssigner.length} en attente
            </span>
          </div>
          <div className="space-y-3">
            {aAssigner.length === 0 && <p className="text-sm text-gray-400">Aucune commande à assigner.</p>}
            {aAssigner.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between">
                  <p className="font-medium">{c.numero}</p>
                  <p className="text-sm text-gray-500">{Number(c.montant_total).toLocaleString()} FCFA</p>
                </div>
                <p className="text-sm text-gray-500">{c.client_nom} · {c.quartier}</p>
                <div className="flex gap-2 mt-3">
                  <select
                    className="input-field flex-1"
                    value={selection[c.id] || ""}
                    onChange={(e) => setSelection((s) => ({ ...s, [c.id]: e.target.value }))}
                  >
                    <option value="">Choisir un livreur</option>
                    {livreurs.map((l) => (
                      <option key={l.id} value={l.id}>{l.nom} — {l.zone}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assigner(c.id)}
                    disabled={!selection[c.id] || busyId === c.id}
                    className="btn-primary w-auto px-4"
                  >
                    Assigner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="font-medium mb-4">Livreurs disponibles à proximité</p>
          <div className="grid grid-cols-2 gap-3">
            {livreurs.map((l) => (
              <div key={l.id} className="border border-gray-100 rounded-xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple mx-auto mb-2 flex items-center justify-center text-white font-bold">
                  {l.nom?.[0] || "?"}
                </div>
                <p className="text-sm font-medium">{l.nom}</p>
                <p className="text-xs text-gray-400">{l.zone} · {l.moto_id}</p>
                <span className="inline-block mt-2 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}