// src/pages/livreur/Missions.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LivreurLayout from "../../layouts/LivreurLayout";
import { StatusBadge } from "../../components/StatusBadge";

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreurBackend, setErreurBackend] = useState(false);

  useEffect(() => {
    // TODO backend : endpoint dédié type GET /api/v1/livraisons/mes-missions/
    // qui renvoie les commandes où livreur = utilisateur connecté (voir rapport, section 5.4).
    // L'endpoint /commandes/ actuel filtre sur request.user.commercant, ce qui échoue pour un rôle LIVREUR.
    api
      .get("/livraisons/mes-missions/")
      .then((r) => setMissions(r.data.results || r.data))
      .catch(() => setErreurBackend(true))
      .finally(() => setLoading(false));
  }, []);

  const enCours = missions.filter((m) => m.statut === "EN_LIVRAISON").length;
  const livrees = missions.filter((m) => m.statut === "LIVREE").length;

  return (
    <LivreurLayout>
      <p className="text-sm text-gray-400">Ravi de vous revoir,</p>
      <h1 className="text-xl font-bold mb-4">Bonjour {user?.username || "👋"} !</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold">{missions.length}</p>
          <p className="text-xs text-gray-400">Missions</p>
        </div>
        <div className="card p-3 text-center bg-blue-50 border-blue-100">
          <p className="text-xl font-bold text-blue-600">{enCours}</p>
          <p className="text-xs text-blue-400">En cours</p>
        </div>
        <div className="card p-3 text-center bg-emerald-50 border-emerald-100">
          <p className="text-xl font-bold text-emerald-600">{livrees}</p>
          <p className="text-xs text-emerald-500">Livrées</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold">Missions d'aujourd'hui</p>
        <button className="text-sm text-brand-purple">Filtrer</button>
      </div>

      {erreurBackend && (
        <div className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4 mb-4">
          L'endpoint backend pour lister tes missions n'est pas encore branché
          (voir section 5.4 du rapport : table Livraison + endpoints livreur à créer).
          Cet écran s'affichera automatiquement dès qu'il sera disponible.
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => (
            <Link
              key={m.id}
              to={`/livreur/missions/${m.id}`}
              className={`card block p-4 ${m.statut === "EN_LIVRAISON" ? "border-brand-cyan border-2" : ""}`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{m.numero}</p>
                <StatusBadge statut={m.statut} />
              </div>
              <p className="text-sm flex items-center gap-1">👤 {m.client_nom}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">📍 {m.quartier}</p>
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-xs text-gray-400">Montant à collecter</p>
                  <p className="font-semibold">{Number(m.montant_total).toLocaleString()} FCFA</p>
                </div>
                <span className="text-sm text-brand-purple font-medium">
                  {m.statut === "EN_LIVRAISON" ? "Traiter" : "Voir détails"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </LivreurLayout>
  );
}