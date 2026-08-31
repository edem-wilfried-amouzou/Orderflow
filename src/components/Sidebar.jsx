import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Truck, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const liens = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, fin: true },
  { to: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/dashboard/livraisons', label: 'Livraisons', icon: Truck },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-night-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full gradient-brand" />
        <span className="text-white font-bold tracking-wide">ORDERFLOW</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {liens.map(({ to, label, icon: Icon, fin }) => (
          <NavLink
            key={to}
            to={to}
            end={fin}
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
          <div className="w-9 h-9 rounded-full bg-night-700 flex items-center justify-center text-white text-sm font-semibold">
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
  )
}