// src/layouts/LivreurLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/livreur/missions", label: "Missions", icon: "📋" },
  { to: "/livreur/carte", label: "Carte", icon: "🗺️" },
  { to: "/livreur/profil", label: "Profil", icon: "👤" },
];

export default function LivreurLayout({ children, title, back }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
      {title && (
        <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          {back && (
            <button onClick={() => navigate(-1)} className="text-xl text-gray-600">‹</button>
          )}
          <h1 className="font-semibold">{title}</h1>
        </header>
      )}

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs px-4 py-1 ${
                isActive ? "text-brand-purple font-medium" : "text-gray-400"
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}