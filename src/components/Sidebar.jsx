import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, ShoppingBag, Package, Bell, Settings, LogOut, X } from 'lucide-react'

const liens = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, fin: true },
  { to: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/dashboard/catalogue', label: 'Catalogue', icon: Package },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
]

export default function Sidebar({ ouvert, onFermer }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Fond sombre derrière le panneau, mobile uniquement, ferme le menu au clic */}
      {ouvert && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onFermer} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 bg-night-900 text-slate-300 flex flex-col h-screen
          transition-transform duration-200 ease-in-out
          ${ouvert ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-6 py-6 flex items-center justify-between">
          <img src="/logo.png" alt="OrderFlow" className="h-7 w-auto" />
          <button onClick={onFermer} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {liens.map(({ to, label, icon: Icon, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              onClick={onFermer}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'gradient-brand text-white shadow-lg' : 'hover:bg-night-800 text-slate-300'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-night-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-night-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.commercant?.nom_boutique?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.commercant?.nom_boutique || user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition w-full px-3 py-2"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}