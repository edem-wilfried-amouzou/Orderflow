// src/pages/livreur/Profil.jsx
import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LivreurLayout from "../../layouts/LivreurLayout";

export default function Profil() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    api.get("/auth/me/").then((r) => setMe(r.data));
  }, []);

  return (
    <LivreurLayout>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-white text-xl font-bold">
          {(me?.username || "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg">{me?.username}</p>
          <p className="text-sm text-gray-400">Livreur Partenaire OrderFlow</p>
        </div>
      </div>

      <div className="card p-4 flex justify-between items-center mb-4">
        <div>
          <p className="text-sm font-medium">Disponibilité</p>
          <p className="text-xs text-gray-400">Disponible pour de nouvelles livraisons</p>
        </div>
        <button
          onClick={() => setDisponible((d) => !d)}
          className={`w-11 h-6 rounded-full transition relative ${disponible ? "bg-emerald-400" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${disponible ? "left-5" : "left-0.5"}`} />
        </button>
      </div>

      <p className="text-xs font-medium text-gray-400 mb-2">INFORMATIONS PERSONNELLES</p>
      <div className="card divide-y divide-gray-50 mb-6">
        <div className="flex justify-between p-3 text-sm">
          <span className="text-gray-400">Téléphone</span>
          <span className="font-medium">{me?.telephone || "—"}</span>
        </div>
        <div className="flex justify-between p-3 text-sm">
          <span className="text-gray-400">Email</span>
          <span className="font-medium">{me?.email}</span>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-medium"
      >
        Se déconnecter
      </button>
    </LivreurLayout>
  );
}