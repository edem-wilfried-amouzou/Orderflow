import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar ouvert={menuOuvert} onFermer={() => setMenuOuvert(false)} />

      <div className="flex-1 min-w-0">
        {/* Barre visible uniquement sur mobile/tablette (lg:hidden) : logo + bouton menu.
            Sur desktop, la Sidebar fixe suffit, donc cette barre disparaît. */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OrderFlow" className="h-6 w-auto" />
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
