// src/pages/livreur/MissionDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import LivreurLayout from "../../layouts/LivreurLayout";

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);

  useEffect(() => {
    // Réutilise le détail commande existant (GET /commandes/{id}/) — fonctionne pour un commerçant,
    // à adapter au rôle LIVREUR une fois les permissions par rôle en place (section 4, rapport).
    api.get(`/commandes/${id}/`).then((r) => setMission(r.data)).catch(() => setMission(null));
  }, [id]);

  if (!mission) {
    return (
      <LivreurLayout title="Détails de la mission" back>
        <p className="text-gray-400 text-sm">Chargement ou mission indisponible...</p>
      </LivreurLayout>
    );
  }

  return (
    <LivreurLayout title="Détails de la mission" back>
      <div className="card p-4 mb-4">
        <p className="text-xs text-gray-400">Commande</p>
        <p className="font-bold">{mission.numero}</p>
      </div>

      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">DESTINATAIRE & ADRESSE</p>
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-semibold">{mission.client.nom}</p>
            <p className="text-sm text-gray-500">{mission.client.telephone}</p>
          </div>
          <a href={`tel:${mission.client.telephone}`} className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            📞
          </a>
        </div>
        <hr className="my-3 border-gray-50" />
        <p className="text-xs font-medium text-gray-400 mb-1">ADRESSE DIGITALE & REPÈRE</p>
        <p className="font-medium text-brand-purple">📍 {mission.adresse?.quartier}</p>
        <p className="text-sm text-gray-500 mt-1">{mission.adresse?.indications_reperes}</p>
      </div>

      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">ARTICLES & PAIEMENT</p>
        {mission.lignes.map((l) => (
          <div key={l.id} className="flex justify-between text-sm py-1">
            <span>{l.quantite}x {l.produit}</span>
            <span>{Number(l.total).toLocaleString()} FCFA</span>
          </div>
        ))}
        <div className="flex justify-between text-sm py-1 text-gray-400">
          <span>Frais de livraison</span>
          <span>{Number(mission.frais_livraison).toLocaleString()} FCFA</span>
        </div>
        <hr className="my-2 border-gray-50" />
        <div className="flex justify-between font-semibold">
          <span>Total à collecter</span>
          <span className="text-brand-purple">{Number(mission.montant_total).toLocaleString()} FCFA</span>
        </div>
      </div>

      <div className="flex gap-3">
        <a>
          href={mission.adresse?.latitude ? `https://www.google.com/maps?q=${mission.adresse.latitude},${mission.adresse.longitude}` : "#"}
          target="_blank" rel="noreferrer"
          className="flex-1 text-center py-3 rounded-xl border-2 border-brand-purple text-brand-purple font-medium"
        
          🧭 Naviguer
        </a>
        <button
          onClick={() => navigate(`/livreur/missions/${id}/confirmer`)}
          className="flex-1 btn-primary"
        >
          ✓ Mettre à jour
        </button>
        </div>
    </LivreurLayout>
  );
}