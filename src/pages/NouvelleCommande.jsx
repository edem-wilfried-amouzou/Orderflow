import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { creerCommande } from '../api/commandes'
import { listerProduits } from '../api/catalogue'
import { formaterFCFA } from '../utils/format'
import { Plus, Trash2 } from 'lucide-react'

const CANAUX = [
  { value: 'MANUEL', label: 'Manuel' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
]

const LIGNE_VIDE = { produit_ref: '', produit: '', quantite: 1, prix_unitaire: 0 }

export default function NouvelleCommande() {
  const navigate = useNavigate()
  const [produits, setProduits] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const [clientNom, setClientNom] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')
  const [canal, setCanal] = useState('MANUEL')
  const [modePaiement, setModePaiement] = useState('A_LA_LIVRAISON')
  const [fraisLivraison, setFraisLivraison] = useState(1000)
  
  const [lignes, setLignes] = useState([{ ...LIGNE_VIDE }])

  useEffect(() => {
    listerProduits({ actif: true }).then((res) => setProduits(res.data.results || res.data)).catch(() => {})
  }, [])

  function ajouterLigne() {
    setLignes([...lignes, { ...LIGNE_VIDE }])
  }

  function retirerLigne(i) {
    setLignes(lignes.filter((_, idx) => idx !== i))
  }

  function majLigne(i, champ, valeur) {
    const copie = [...lignes]
    copie[i] = { ...copie[i], [champ]: valeur }
    if (champ === 'produit_ref') {
      const p = produits.find((prod) => String(prod.id) === String(valeur))
      if (p) {
        copie[i].produit = p.nom
        copie[i].prix_unitaire = p.prix
      }
    }
    setLignes(copie)
  }

  const totalArticles = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prix_unitaire) || 0), 0)
  const totalGeneral = totalArticles + Number(fraisLivraison || 0)

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const payload = {
        client_nom: clientNom,
        client_telephone: clientTelephone,
        canal,
        mode_paiement: modePaiement,
        frais_livraison: fraisLivraison,
        adresse: { quartier: 'Non renseigné' },
        lignes: lignes
          .filter((l) => l.produit && l.quantite > 0)
          .map((l) => ({
            produit_ref: l.produit_ref || null,
            produit: l.produit,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
          })),
      }
      const res = await creerCommande(payload)
      navigate(`/dashboard/commandes/${res.data.id}`)
    } catch (err) {
      const data = err.response?.data
      setErreur(data ? Object.values(data).flat().join(' ') : 'Une erreur est survenue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div>
      <Topbar title="Nouvelle Commande" sousTitre="Lomé, Togo" />

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <p className="font-semibold text-slate-900">Informations Destinataire & Canal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Nom complet du client" value={clientNom} onChange={(e) => setClientNom(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input required placeholder="Téléphone (Togo)" value={clientTelephone} onChange={(e) => setClientTelephone(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Canal d'acquisition</p>
            <div className="flex gap-2 flex-wrap">
              {CANAUX.map((c) => (
                <button type="button" key={c.value} onClick={() => setCanal(c.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border ${canal === c.value ? 'gradient-brand text-white border-transparent' : 'border-slate-200 text-slate-600'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Paiement</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setModePaiement('A_LA_LIVRAISON')} className={`px-4 py-2 rounded-xl text-sm font-medium border ${modePaiement === 'A_LA_LIVRAISON' ? 'gradient-brand text-white border-transparent' : 'border-slate-200 text-slate-600'}`}>À la livraison</button>
              <button type="button" onClick={() => setModePaiement('IMMEDIAT')} className={`px-4 py-2 rounded-xl text-sm font-medium border ${modePaiement === 'IMMEDIAT' ? 'gradient-brand text-white border-transparent' : 'border-slate-200 text-slate-600'}`}>Payé immédiatement</button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-slate-900">Articles de la commande</p>
              <button type="button" onClick={ajouterLigne} className="text-sm text-brand-blue font-medium flex items-center gap-1"><Plus size={14} /> Ajouter un article</button>
            </div>
            <div className="space-y-2">
              {lignes.map((l, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 border border-slate-100 rounded-xl p-3 sm:border-0 sm:p-0">
                  <div className="flex items-center gap-2">
                    <select value={l.produit_ref} onChange={(e) => majLigne(i, 'produit_ref', e.target.value)} className="flex-1 sm:flex-none sm:w-40 px-3 py-2 rounded-xl border border-slate-200 text-sm">
                      <option value="">— Saisie libre —</option>
                      {produits.map((p) => <option key={p.id} value={p.id}>{p.nom} ({formaterFCFA(p.prix)})</option>)}
                    </select>
                    <button type="button" onClick={() => retirerLigne(i)} className="sm:hidden text-slate-400 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
                  </div>
                  {!l.produit_ref && (
                    <input placeholder="Nom du produit" value={l.produit} onChange={(e) => majLigne(i, 'produit', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                  )}
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={l.quantite} onChange={(e) => majLigne(i, 'quantite', Number(e.target.value))} className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-sm" title="Quantité" />
                    <input type="number" min={0} value={l.prix_unitaire} onChange={(e) => majLigne(i, 'prix_unitaire', Number(e.target.value))} className="w-24 flex-1 sm:flex-none px-2 py-2 rounded-xl border border-slate-200 text-sm" title="Prix unitaire" />
                    <button type="button" onClick={() => retirerLigne(i)} className="hidden sm:block text-slate-400 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600">Sous-total articles</p>
            <p className="font-semibold text-slate-900">{formaterFCFA(totalArticles)}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
            <p className="font-semibold text-slate-900">Frais additionnels</p>
            <div>
              <label className="text-sm text-slate-600">Frais de livraison (optionnel)</label>
              <input type="number" min={0} value={fraisLivraison} onChange={(e) => setFraisLivraison(e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">Total général</p>
              <p className="text-xl font-bold text-brand-blue">{formaterFCFA(totalGeneral)}</p>
            </div>
            {erreur && <p className="text-sm text-red-600 mb-3">{erreur}</p>}
            <button type="submit" disabled={chargement} className="gradient-brand w-full text-white font-medium py-2.5 rounded-xl shadow-md disabled:opacity-60">
              {chargement ? 'Enregistrement...' : 'Enregistrer & Valider'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}