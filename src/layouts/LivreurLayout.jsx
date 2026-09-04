import { NavLink, Outlet } from 'react-router-dom'
import { ListChecks, Map, User } from 'lucide-react'

const onglets = [
  { to: '/livreur', label: 'Missions', icon: ListChecks, fin: true },
  { to: '/livreur/carte', label: 'Carte', icon: Map },
  { to: '/livreur/profil', label: 'Profil', icon: User },
]

export default function LivreurLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto pb-20">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 z-30">
        <div className="max-w-md mx-auto grid grid-cols-3">
          {onglets.map(({ to, label, icon: Icon, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? 'text-brand-purple' : 'text-slate-400'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}