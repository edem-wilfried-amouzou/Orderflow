// src/pages/dashboard/CommandeDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatusBadge, CanalBadge } from "../../components/StatusBadge";

export default function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.get(`/commandes/${id}/`).then((r) => setCommande(r.data));
  }

  useEffect(load, [id]);

  async function valider() {
    setBusy(true);
    try {
      await api.post(`/commandes/${id}/valider/`);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function annuler() {
    if (!confirm("Confirmer l'annulation de cette commande ?")) return;
    setBusy(true);
    try {
      await api.post(`/commandes/${id}/annuler/`);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!commande) {
    return (
      <DashboardLayout title="Détail commande">
        <p className="text-gray-400">Chargement...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Commande #${commande.numero}`} tag="Lomé, Togo">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 mb-4">← Retour</button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-lg">{commande.client.nom}</p>
                <p className="text-sm text-gray-400">{commande.client.telephone}</p>
              </div>
              <div className="text-right">
                <CanalBadge canal={commande.canal} />
                <div className="mt-1"><StatusBadge statut={commande.statut} /></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-1">Adresse digitale & repère</p>
              <p className="font-medium">📍 {commande.adresse?.quartier}</p>
              <p className="text-sm text-gray-500">{commande.adresse?.indications_reperes}</p>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-2">Articles commandés</p>
            <table className="w-full text-sm mb-4">
              <tbody>
                {commande.lignes.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50">
                    <td className="py-2">{l.produit}</td>
                    <td className="py-2 text-gray-400">x{l.quantite}</td>
                    <td className="py-2 text-right">{Number(l.total).toLocaleString()} FCFA</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-gray-400" colSpan={2}>Frais de livraison</td>
                  <td className="py-2 text-right text-gray-400">
                    {Number(commande.frais_livraison).toLocaleString()} FCFA
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm font-medium">Montant total à collecter</span>
              <span className="text-xl font-bold text-brand-purple">
                {Number(commande.montant_total).toLocaleString()} FCFA
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {commande.statut === "NOUVELLE" && (
              <button onClick={valider} disabled={busy} className="btn-primary w-auto px-6">
                Valider la commande
              </button>
            )}
            {!["LIVREE", "ANNULEE"].includes(commande.statut) && (
              <button
                onClick={annuler}
                disabled={busy}
                className="px-6 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
              >
                Annuler la commande
              </button>
            )}
            {commande.statut === "VALIDEE" && (
              <button
                onClick={() => navigate("/livraisons")}
                className="px-6 py-3 rounded-xl border border-brand-purple text-brand-purple text-sm font-medium"
              >
                Attribuer un livreur
              </button>
            )}
          </div>
        </div>

        {/* Historique */}
        <div className="card p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">Historique de la commande</p>
          <div className="space-y-4">
            {commande.historique.map((h, i) => (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-brand-purple" : "bg-gray-300"}`} />
                  {i < commande.historique.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium"><StatusBadge statut={h.statut} /></p>
                  <p className="text-xs text-gray-400 mt-1">{h.commentaire}</p>
                  <p className="text-xs text-gray-300">{new Date(h.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}