// src/pages/dashboard/Commandes.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";
import { StatusBadge, CanalBadge } from "../../components/StatusBadge";

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [canal, setCanal] = useState("");

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statut) params.statut = statut;
    if (canal) params.canal = canal;

    setLoading(true);
    api
      .get("/commandes/", { params })
      .then((r) => setCommandes(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, statut, canal]);

  return (
    <DashboardLayout title="Toutes les commandes" tag="Lomé, Togo">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <input
            placeholder="Nom, téléphone, numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-64"
          />
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="input-field w-40">
            <option value="">Tous statuts</option>
            <option value="NOUVELLE">Nouvelle</option>
            <option value="VALIDEE">Validée</option>
            <option value="ASSIGNEE">Assignée</option>
            <option value="EN_LIVRAISON">En livraison</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
          <select value={canal} onChange={(e) => setCanal(e.target.value)} className="input-field w-40">
            <option value="">Tous canaux</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="MANUEL">Manuel</option>
          </select>
        </div>
        <Link to="/commandes/nouvelle" className="btn-primary w-auto px-5">
          + Nouvelle Commande
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-400">
            <tr>
              <th className="p-4">Numéro</th>
              <th>Client</th>
              <th>Canal</th>
              <th>Produits</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Chargement...</td></tr>
            ) : commandes.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Aucune commande trouvée.</td></tr>
            ) : (
              commandes.map((c) => (
                <tr key={c.id} className="border-t border-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{c.numero}</p>
                    <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                  </td>
                  <td>
                    <p>{c.client_nom}</p>
                    <p className="text-xs text-gray-400">{c.client_telephone}</p>
                  </td>
                  <td><CanalBadge canal={c.canal} /></td>
                  <td className="text-gray-400 text-xs">—</td>
                  <td className="font-medium">{Number(c.montant_total).toLocaleString()} FCFA</td>
                  <td><StatusBadge statut={c.statut} /></td>
                  <td>
                    <Link to={`/commandes/${c.id}`} className="text-brand-purple text-sm font-medium">
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}