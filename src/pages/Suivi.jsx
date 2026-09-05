import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { suivreCommande } from '../api/public'
import Spinner from '../components/Spinner'
import { Phone, MapPin } from 'lucide-react'

// Ordre fixe des étapes affichées, indépendant de l'historique brut renvoyé par l'API.
const ETAPES = [
  { statut: 'NOUVELLE', label: 'Commande reçue', desc: (s) => 'Traitement en cours' },
  { statut: 'VALIDEE', label: 'Validée', desc: () => 'Prête pour expédition' },
  
  { statut: 'LIVREE', label: 'Livrée', desc: () => 'Confirmation à l’arrivée' },
]

const ORDRE = ETAPES.map((e) => e.statut)

export default function Suivi() {
  const { numero } = useParams()
  const [suivi, setSuivi] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    suivreCommande(numero)
      .then((res) => setSuivi(res.data))
      .catch(() => setErreur("Commande introuvable. Vérifie le numéro de commande."))
      .finally(() => setChargement(false))
  }, [numero])

  if (chargement) return <div className="h-screen flex items-center justify-center"><Spinner /></div>

  if (erreur || !suivi) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-500">{erreur || 'Commande introuvable.'}</p>
      </div>
    )
  }

  const enEchec = ['ANNULEE', 'ECHEC'].includes(suivi.statut)
  const indexActuel = ORDRE.indexOf(suivi.statut)

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="flex justify-center mb-5">
          <img src="/logo.png" alt="OrderFlow" className="h-11 w-auto" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Suivi de Commande</h1>
        <span className="mt-2 bg-violet-100 text-brand-purple text-xs font-semibold px-3 py-1 rounded-full">
          {suivi.numero}
        </span>
      </div>

      {enEchec ? (
        <div className="bg-white rounded-2xl p-5 border border-red-100 text-center mb-6">
          <p className="font-semibold text-red-600">
            {suivi.statut === 'ANNULEE' ? 'Commande annulée' : 'Échec de livraison'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Contacte le vendeur pour plus d'informations.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-brand-purple mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-slate-800">{suivi.quartier}, Lomé</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
            <p className="font-semibold text-slate-900 mb-4">Étapes de livraison</p>
            <div className="space-y-0">
              {ETAPES.map((etape, i) => {
                const atteinte = i <= indexActuel
                const active = i === indexActuel
                return (
                  <div key={etape.statut} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${atteinte ? (active ? 'bg-brand-purple' : 'bg-emerald-500') : 'bg-slate-200'}`} />
                      {i < ETAPES.length - 1 && <div className={`w-px flex-1 min-h-[28px] ${i < indexActuel ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${atteinte ? 'text-slate-900' : 'text-slate-400'}`}>{etape.label}</p>
                      <p className="text-xs text-slate-500">{etape.desc(suivi)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {suivi.livreur_nom && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400">Votre livreur OrderFlow :</p>
                <p className="text-sm font-semibold text-slate-900">{suivi.livreur_nom}</p>
              </div>
              {suivi.livreur_telephone && (
                <a href={`tel:${suivi.livreur_telephone}`} className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </a>
              )}
            </div>
          )}
        </>
      )}

      <p className="text-center text-sm text-brand-purple font-medium mt-4">Besoin d'aide ? Contacter le support</p>
    </div>
  )
}