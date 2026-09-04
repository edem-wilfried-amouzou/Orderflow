import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { getCommande, getHistoriqueCommande, validerCommande, annulerCommande } from '../api/commandes'
import { demanderLivreur } from '../api/livraisons'
import { formaterFCFA, formaterDate } from '../utils/format'
import { STATUT_COMMANDE, CANAL_CONFIG } from '../utils/statusConfig'
import { ArrowLeft, MapPin } from 'lucide-react'

const STATUTS_TERMINAUX = ['LIVREE', 'ANNULEE', 'ECHEC']

export default function CommandeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [commande, setCommande] = useState(null)
  const [historique, setHistorique] = useState([])
  const [chargement, setChargement] = useState(true)
  const [actionEnCours, setActionEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  function charger() {
    setChargement(true)
    Promise.all([getCommande(id), getHistoriqueCommande(id)])
      .then(([c, h]) => {
        setCommande(c.data)
        setHistorique(h.data.results || h.data)
      })
      .finally(() => setChargement(false))
  }

  useEffect(charger, [id])

  async function lancerAction(fn) {
    setErreur('')
    setActionEnCours(true)
    try {
      await fn()
      charger()
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Une erreur est survenue.')
    } finally {
      setActionEnCours(false)
    }
  }

  if (chargement) return <div className="h-96 flex items-center justify-center"><Spinner /></div>
  if (!commande) return <p className="text-slate-500">Commande introuvable.</p>

  const lignes = commande.lignes || []

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 mb-4 hover:text-slate-800">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-slate-900">Commande {commande.numero}</h1>
        <Badge config={CANAL_CONFIG[commande.canal]} />
        <Badge config={STATUT_COMMANDE[commande.statut]} />
      </div>
      <p className="text-sm text-slate-500 mb-6">Créée le {formaterDate(commande.created_at)}</p>

      {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="font-semibold text-slate-900 mb-3">Destinataire & Adresse</p>
            <p className="text-sm text-slate-800 font-medium">{commande.client?.nom}</p>
            <p className="text-sm text-slate-500">{commande.client?.telephone}</p>
            <div className="flex items-start gap-2 mt-3 text-sm text-slate-600">
              <MapPin size={16} className="text-brand-purple mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">{commande.adresse?.quartier}</p>
                {commande.adresse?.indications_reperes && <p>{commande.adresse.indications_reperes}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="font-semibold text-slate-900 mb-3">Articles commandés</p>
            <table className="w-full text-sm">
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id} className="border-t border-slate-50">
                    <td className="py-2 text-slate-700">{l.quantite}x {l.produit}</td>
                    <td className="py-2 text-right text-slate-800">{formaterFCFA(l.quantite * l.prix_unitaire)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-100">
                  <td className="py-2 text-slate-500">Frais de livraison</td>
                  <td className="py-2 text-right text-slate-500">{formaterFCFA(commande.frais_livraison)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <p className="font-semibold text-slate-900">Montant total</p>
              <p className="text-xl font-bold text-brand-blue">{formaterFCFA(commande.montant_total)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {commande.statut === 'NOUVELLE' && (
              <button disabled={actionEnCours} onClick={() => lancerAction(() => validerCommande(id))} className="gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md disabled:opacity-60">
                Valider la commande
              </button>
            )}
            {commande.statut === 'VALIDEE' && (
              <button disabled={actionEnCours} onClick={() => lancerAction(() => demanderLivreur(id))} className="gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md disabled:opacity-60">
                Demander un livreur
              </button>
            )}
            {!STATUTS_TERMINAUX.includes(commande.statut) && (
              <button disabled={actionEnCours} onClick={() => lancerAction(() => annulerCommande(id))} className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60">
                Annuler la commande
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-fit">
          <p className="font-semibold text-slate-900 mb-4">Historique</p>
          <div className="space-y-4">
            {historique.map((h, i) => (
              <div key={h.id || i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full gradient-brand mt-1.5" />
                  {i < historique.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-slate-800">{STATUT_COMMANDE[h.statut]?.label || h.statut}</p>
                  {h.commentaire && <p className="text-xs text-slate-500">{h.commentaire}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{formaterDate(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}