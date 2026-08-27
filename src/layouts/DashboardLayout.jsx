// src/layouts/DashboardLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { to: "/commandes", label: "Commandes", icon: "📋" },
  { to: "/livraisons", label: "Livraisons", icon: "🚚" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function DashboardLayout({ children, title, tag }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-navy-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-5 bg-white">
          <span className="text-xl font-bold">
            <span className="text-brand-cyan">Order</span>
            <span className="text-brand-purple">Flow</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-brand-purple/20 text-white font-medium"
                    : "hover:bg-white/5"
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-xs font-bold text-white">
            {(user?.nom_boutique || user?.email || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{user?.email}</p>
            <p className="text-xs text-gray-400">Marchand · Lomé</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            title="Déconnexion"
            className="text-gray-400 hover:text-white text-sm"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{title}</h1>
            {tag && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              placeholder="Rechercher..."
              className="input-field w-64"
            />
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              🔔
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}