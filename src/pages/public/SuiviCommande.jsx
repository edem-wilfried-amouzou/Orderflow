// src/pages/public/SuiviCommande.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";

const ETAPES = [
  { key: "NOUVELLE", label: "Commande reçue" },
  { key: "VALIDEE", label: "Validée" },
  { key: "ASSIGNEE", label: "Livreur assigné" },
  { key: "EN_LIVRAISON", label: "En livraison" },
  { key: "LIVREE", label: "Livrée" },
];

export default function SuiviCommande() {
  const { numero } = useParams();
  const [commande, setCommande] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    // TODO backend : endpoint public (sans authentification) type
    // GET /api/v1/suivi/{numero}/ renvoyant un sous-ensemble non sensible de la commande.
    api.get(`/suivi/${numero}/`).then((r) => setCommande(r.data)).catch(() => setErreur(true));
  }, [numero]);

  const indexActuel = commande ? ETAPES.findIndex((e) => e.key === commande.statut) : -1;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto px-6 py-8">
      <div className="flex justify-center mb-4">
        <span className="text-xl font-bold">
          <span className="text-brand-cyan">Order</span>
          <span className="text-brand-purple">Flow</span>
        </span>
      </div>
      <h1 className="text-xl font-bold text-center">Suivi de Commande</h1>
      <p className="text-center mt-2 mb-6">
        <span className="bg-purple-100 text-brand-purple text-sm font-medium px-3 py-1 rounded-full">
          {numero}
        </span>
      </p>

      {erreur && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4">
          Le suivi public n'est pas encore branché côté backend — cet écran affichera
          automatiquement les données dès que l'endpoint sera créé.
        </p>
      )}

      {commande && (
        <>
          <div className="card p-4 mb-4">
            <p className="text-sm text-gray-400">Arrivée estimée</p>
            <p className="font-semibold text-emerald-600">{commande.eta || "En cours d'estimation"}</p>
            <p className="text-sm text-gray-500 mt-1">📍 {commande.adresse?.quartier}</p>
          </div>

          <div className="card p-4 mb-4">
            <p className="font-semibold mb-4">Étapes de livraison</p>
            {ETAPES.map((e, i) => (
              <div key={e.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-3 h-3 rounded-full ${i <= indexActuel ? "bg-emerald-500" : "bg-gray-200"} ${i === indexActuel ? "ring-4 ring-brand-purple/20 bg-brand-purple" : ""}`} />
                  {i < ETAPES.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                </div>
                <div className="pb-5">
                  <p className={`text-sm font-medium ${i <= indexActuel ? "text-gray-800" : "text-gray-400"}`}>{e.label}</p>
                </div>
              </div>
            ))}
          </div>

          {commande.livreur_nom && (
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Votre livreur OrderFlow</p>
                <p className="font-medium">{commande.livreur_nom}</p>
              </div>
              <a href={`tel:${commande.livreur_telephone}`} className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">📞</a>
            </div>
          )}
        </>
      )}

      <p className="text-center text-sm text-brand-purple mt-6">Besoin d'aide ? Contacter le support</p>
    </div>
  );
}