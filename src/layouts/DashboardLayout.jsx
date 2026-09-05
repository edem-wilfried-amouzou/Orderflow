import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar ouvert={menuOuvert} onFermer={() => setMenuOuvert(false)} />

      <div className="flex-1 min-w-0 w-full">
        {/* Barre mobile/tablette : logo + bouton menu. Disparaît à partir de lg (sidebar fixe visible). */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMenuOuvert(true)}
            className="text-slate-600 p-1 -ml-1 active:bg-slate-100 rounded-lg"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
          <img src="/logo.png" alt="OrderFlow" className="h-8 w-auto" />
        </div>

        <main className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1800px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}