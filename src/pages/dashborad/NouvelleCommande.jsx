// src/pages/dashboard/NouvelleCommande.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import DashboardLayout from "../../layouts/DashboardLayout";

const ligneVide = { produit: "", quantite: 1, prix_unitaire: "" };

export default function NouvelleCommande() {
  const navigate = useNavigate();
  const [canal, setCanal] = useState("MANUEL");
  const [clientNom, setClientNom] = useState("");
  const [clientTel, setClientTel] = useState("");
  const [quartier, setQuartier] = useState("");
  const [reperes, setReperes] = useState("");
  const [fraisLivraison, setFraisLivraison] = useState(0);
  const [lignes, setLignes] = useState([{ ...ligneVide }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = lignes.reduce((acc, l) => acc + (Number(l.quantite) * Number(l.prix_unitaire) || 0), 0) + Number(fraisLivraison || 0);

  function updateLigne(i, field, value) {
    setLignes((ls) => ls.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/commandes/", {
        client_nom: clientNom,
        client_telephone: clientTel,
        canal,
        frais_livraison: fraisLivraison || 0,
        adresse: { quartier, indications_reperes: reperes },
        lignes: lignes.map((l) => ({
          produit: l.produit,
          quantite: Number(l.quantite),
          prix_unitaire: Number(l.prix_unitaire),
        })),
      });
      navigate(`/commandes/${data.id}`);
    } catch (err) {
      setError("Vérifie les champs du formulaire.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Nouvelle Commande" tag="Lomé, Togo">
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-5 space-y-4">
          <p className="font-medium">Informations Destinataire</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500">Nom complet du client</label>
              <input required className="input-field mt-1" value={clientNom} onChange={(e) => setClientNom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-500">Téléphone</label>
              <input required className="input-field mt-1" value={clientTel} onChange={(e) => setClientTel(e.target.value)} placeholder="+228 90 00 00 00" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Canal d'acquisition</label>
            <div className="flex gap-2 mt-1">
              {["WHATSAPP", "FACEBOOK", "INSTAGRAM", "MANUEL"].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCanal(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    canal === c ? "bg-brand-purple text-white border-brand-purple" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {c[0] + c.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-500">Articles de la commande</label>
              <button
                type="button"
                onClick={() => setLignes((ls) => [...ls, { ...ligneVide }])}
                className="text-sm text-brand-purple font-medium"
              >
                + Ajouter un article
              </button>
            </div>
            <div className="space-y-2">
              {lignes.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="Nom du produit"
                    className="input-field col-span-6"
                    value={l.produit}
                    onChange={(e) => updateLigne(i, "produit", e.target.value)}
                    required
                  />
                  <input
                    type="number" min="1"
                    placeholder="Qté"
                    className="input-field col-span-2"
                    value={l.quantite}
                    onChange={(e) => updateLigne(i, "quantite", e.target.value)}
                    required
                  />
                  <input
                    type="number" min="0"
                    placeholder="Prix unitaire"
                    className="input-field col-span-3"
                    value={l.prix_unitaire}
                    onChange={(e) => updateLigne(i, "prix_unitaire", e.target.value)}
                    required
                  />
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLignes((ls) => ls.filter((_, idx) => idx !== i))}
                      className="col-span-1 text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4 h-fit">
          <p className="font-medium">Adresse & Livraison à Lomé</p>
          <div>
            <label className="text-sm text-gray-500">Quartier de livraison</label>
            <input required className="input-field mt-1" value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ex: Bè Kpota" />
          </div>
          <div>
            <label className="text-sm text-gray-500">Indications / repères</label>
            <textarea className="input-field mt-1" rows={3} value={reperes} onChange={(e) => setReperes(e.target.value)} placeholder="Maison derrière la pharmacie..." />
          </div>
          <div>
            <label className="text-sm text-gray-500">Frais de livraison (FCFA)</label>
            <input type="number" min="0" className="input-field mt-1" value={fraisLivraison} onChange={(e) => setFraisLivraison(e.target.value)} />
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold">{total.toLocaleString()} FCFA</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enregistrement..." : "Enregistrer & Valider"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}