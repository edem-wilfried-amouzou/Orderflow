import { Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, sousTitre }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
        {sousTitre && <p className="text-sm text-slate-500 mt-0.5">{sousTitre}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <button
          onClick={() => navigate('/dashboard/commandes/nouvelle')}
          className="gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:opacity-90 transition shrink-0"
        >
          <Plus size={16} /> <span className="hidden xs:inline sm:inline">Nouvelle commande</span><span className="xs:hidden sm:hidden">Nouveau</span>
        </button>
      </div>
    </div>
  )
}