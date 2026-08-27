// src/pages/livreur/LivreurLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LivreurLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      if (role !== "LIVREUR") {
        setError("Ce compte n'est pas un compte livreur.");
        return;
      }
      navigate("/livreur/missions");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto px-6 py-10 flex flex-col justify-center">
      <div className="flex justify-center mb-6">
        <span className="text-2xl font-bold">
          <span className="text-brand-cyan">Order</span>
          <span className="text-brand-purple">Flow</span>
        </span>
      </div>
      <h1 className="text-xl font-bold text-center">OrderFlow Driver</h1>
      <p className="text-sm text-gray-400 text-center mb-8">Livraison dernier kilomètre à Lomé</p>

      <h2 className="font-semibold mb-4">Connexion Livreur</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Adresse Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1"
            placeholder="kofi@orderflow.tg"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Mot de passe</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {showPassword ? "Masquer" : "Voir"}
            </button>
          </div>
        </div>

        <button disabled={loading} className="btn-primary">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-8 bg-blue-50 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
        <span>ℹ️</span>
        <div>
          <p className="font-medium">Nouveau livreur ?</p>
          <p className="text-blue-500">Contactez votre commerçant pour la création de votre compte.</p>
        </div>
      </div>
    </div>
  );
}