// src/pages/livreur/Confirmation.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import LivreurLayout from "../../layouts/LivreurLayout";

export default function Confirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statut, setStatut] = useState("LIVREE");
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [paiementRecu, setPaiementRecu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmer() {
    setLoading(true);
    setError("");
    try {
      // TODO backend : PATCH /api/v1/livraisons/{id}/statut/ (section 5.4 du rapport, pas encore créé).
      // On appelle ici l'endpoint le plus proche existant, à adapter une fois la route livrée.
      const form = new FormData();
      form.append("statut", statut);
      form.append("notes", notes);
      form.append("paiement_recu", paiementRecu);
      if (photo) form.append("preuve_livraison", photo);

      await api.patch(`/livraisons/${id}/statut/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/livreur/missions");
    } catch {
      setError("Cette action n'est pas encore disponible côté backend — l'écran est prêt, en attente de l'endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LivreurLayout title="Confirmer la livraison" back>
      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">STATUT DE LA LIVRAISON</p>
        <div className="flex gap-3">
          <button
            onClick={() => setStatut("LIVREE")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium ${
              statut === "LIVREE" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-400"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${statut === "LIVREE" ? "bg-emerald-500" : "bg-gray-300"}`} />
            Livrée
          </button>
          <button
            onClick={() => setStatut("ECHEC")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium ${
              statut === "ECHEC" ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 text-gray-400"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${statut === "ECHEC" ? "bg-red-500" : "bg-gray-300"}`} />
            Échec
          </button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">PREUVE DE LIVRAISON (PHOTO)</p>
        <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
          <span className="text-2xl mb-2">📷</span>
          <span className="text-sm font-medium">{photo ? photo.name : "Prendre une photo de preuve"}</span>
          <span className="text-xs text-gray-400">Colis remis au client ou devant le repère</span>
        </label>
      </div>

      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2">NOTES / OBSERVATIONS</p>
        <textarea
          className="input-field"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Remis en mains propres à..."
        />
      </div>

      <label className="card p-4 mb-4 flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={paiementRecu} onChange={(e) => setPaiementRecu(e.target.checked)} className="w-5 h-5 accent-brand-purple" />
        <div>
          <p className="text-sm font-medium">Paiement reçu</p>
          <p className="text-xs text-gray-400">J'ai collecté le montant en espèces.</p>
        </div>
      </label>

      {error && <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">{error}</p>}

      <button onClick={confirmer} disabled={loading} className="btn-primary">
        {loading ? "Envoi..." : "Confirmer la livraison"}
      </button>
    </LivreurLayout>
  );
}