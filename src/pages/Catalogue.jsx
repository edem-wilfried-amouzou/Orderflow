import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import Spinner from '../components/Spinner'
import { listerProduits, creerProduit, modifierProduit, supprimerProduit } from '../api/catalogue'
import { formaterFCFA } from '../utils/format'
import { Plus, Trash2, Pencil } from 'lucide-react'

const VIDE = { nom: '', description: '', prix: '', actif: true }

export default function Catalogue() {
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)
  const [form, setForm] = useState(null)
  const [erreur, setErreur] = useState('')

  function charger() {
    setChargement(true)
    listerProduits().then((res) => setProduits(res.data.results || res.data)).finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function enregistrer(e) {
    e.preventDefault()
    setErreur('')
    try {
      if (form.id) await modifierProduit(form.id, form)
      else await creerProduit(form)
      setForm(null)
      charger()
    } catch {
      setErreur("Impossible d'enregistrer ce produit.")
    }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await supprimerProduit(id)
    charger()
  }

  return (
    <div>
      <Topbar title="Catalogue produits" sousTitre="Lomé, Togo" />

      <button onClick={() => setForm({ ...VIDE })} className="gradient-brand text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 mb-4 shadow-md">
        <Plus size={16} /> Ajouter un produit
      </button>

      {form && (
        <form onSubmit={enregistrer} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="Nom du produit" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input required type="number" min={0} placeholder="Prix (FCFA)" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <textarea placeholder="Description (optionnel)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" rows={2} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} /> Produit actif (visible dans le bot et la création de commande)
          </label>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <div className="flex gap-2">
            <button type="submit" className="gradient-brand text-white text-sm font-medium px-4 py-2 rounded-xl">Enregistrer</button>
            <button type="button" onClick={() => setForm(null)} className="text-sm text-slate-500 px-4 py-2">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {chargement ? (
          <div className="p-10 flex justify-center"><Spinner /></div>
        ) : produits.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm">Aucun produit pour l'instant.</p>
        ) : (
          <>
            {/* Cartes empilées, mobile uniquement */}
            <div className="sm:hidden divide-y divide-slate-50">
              {produits.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.nom}</p>
                    <p className="text-sm text-slate-600">{formaterFCFA(p.prix)}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${p.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setForm(p)} className="text-slate-400 hover:text-brand-blue p-1"><Pencil size={18} /></button>
                    <button onClick={() => supprimer(p.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tableau, à partir de sm */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="font-medium px-5 py-3">Produit</th>
                    <th className="font-medium px-5 py-3">Prix</th>
                    <th className="font-medium px-5 py-3">Statut</th>
                    <th className="font-medium px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p) => (
                    <tr key={p.id} className="border-t border-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{p.nom}</td>
                      <td className="px-5 py-3 text-slate-600">{formaterFCFA(p.prix)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
                        <button onClick={() => setForm(p)} className="text-slate-400 hover:text-brand-blue"><Pencil size={16} /></button>
                        <button onClick={() => supprimer(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}