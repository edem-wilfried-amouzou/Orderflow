// src/components/StatusBadge.jsx
const STATUTS = {
  NOUVELLE: { label: "Nouvelle", classes: "bg-amber-100 text-amber-700" },
  VALIDEE: { label: "Validée", classes: "bg-blue-100 text-blue-700" },
  ASSIGNEE: { label: "Assignée", classes: "bg-indigo-100 text-indigo-700" },
  EN_LIVRAISON: { label: "En livraison", classes: "bg-purple-100 text-purple-700" },
  LIVREE: { label: "Livrée", classes: "bg-emerald-100 text-emerald-700" },
  ANNULEE: { label: "Annulée", classes: "bg-red-100 text-red-700" },
  ECHEC: { label: "Échec", classes: "bg-red-100 text-red-700" },
};

const CANAUX = {
  WHATSAPP: "🟢 WhatsApp",
  FACEBOOK: "🔵 Facebook",
  TIKTOK: "⚫ TikTok",
  INSTAGRAM: "🟣 Instagram",
  MANUEL: "✋ Manuel",
};

export function StatusBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut, classes: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  );
}

export function CanalBadge({ canal }) {
  return <span className="text-sm text-gray-600">{CANAUX[canal] || canal}</span>;
}