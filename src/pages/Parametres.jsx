import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import { updateMe } from '../api/auth'
import { listerCanaux, demarrerConnexion, deconnecterCanal } from '../api/canaux'
import { MessageCircle, MessageSquare, Camera } from 'lucide-react'

const TYPES_CANAUX = [
  { type: 'WHATSAPP', label: 'WhatsApp', desc: 'Prise de commande par chat', icon: MessageCircle },
  // { type: 'FACEBOOK', label: 'Facebook Messenger', desc: 'Réponses automatiques sur votre Page', icon: MessageSquare },
  // { type: 'INSTAGRAM', label: 'Instagram', desc: 'Réponses automatiques sur votre compte pro', icon: Camera },
]

export default function Parametres() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [canaux, setCanaux] = useState([])
  const [enregistrement, setEnregistrement] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.commercant) {
      setForm({
        nom_boutique: user.commercant.nom_boutique || '',
        secteur_activite: user.commercant.secteur_activite || '',
        telephone: user.telephone || '',
      })
    }
    listerCanaux().then((res) => setCanaux(res.data.results || res.data)).catch(() => {})
  }, [user])

  async function enregistrer(e) {
    e.preventDefault()
    setEnregistrement(true)
    setMessage('')
    try {
      // ⚠️ à vérifier : le serializer /auth/me/ doit accepter la mise à jour imbriquée
      // du commerçant. Si ce n'est pas le cas côté backend, il faudra un endpoint dédié.
      await updateMe({
        telephone: form.telephone,
        commercant: { nom_boutique: form.nom_boutique, secteur_activite: form.secteur_activite },
      })
      setMessage('Modifications enregistrées.')
    } catch {
      setMessage("Impossible d'enregistrer les modifications.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function connecter(type) {
    const res = await demarrerConnexion(type.toLowerCase())
    if (res.data?.url) window.location.href = res.data.url
  }

  async function deconnecter(id) {
    await deconnecterCanal(id)
    setCanaux((prev) => prev.filter((c) => c.id !== id))
  }

  if (!form) return null

  return (
    <div>
      <Topbar title="Paramètres" sousTitre="Gestion boutique" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
        <form onSubmit={enregistrer} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 h-fit">
          <p className="font-semibold text-slate-900">Profil boutique</p>
          <div>
            <label className="text-sm text-slate-600">Nom de la boutique</label>
            <input value={form.nom_boutique} onChange={(e) => setForm({ ...form, nom_boutique: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Secteur d'activité</label>
            <input value={form.secteur_activite} onChange={(e) => setForm({ ...form, secteur_activite: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Téléphone</label>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          {message && <p className="text-sm text-slate-500">{message}</p>}
          <button disabled={enregistrement} className="gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl w-full disabled:opacity-60">
            {enregistrement ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-fit">
          <p className="font-semibold text-slate-900 mb-1">Canaux connectés</p>
          <p className="text-xs text-slate-500 mb-4">Un seul bot pour WhatsApp, Facebook et Instagram — connectez chaque compte séparément.</p>
          <div className="space-y-3">
            {TYPES_CANAUX.map(({ type, label, desc, icon: Icon }) => {
              const canal = canaux.find((c) => c.type === type)
              const connecte = canal?.statut_connexion === 'CONNECTE'
              return (
                <div key={type} className="flex items-center justify-between border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500">{connecte ? 'Connecté' : desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => (connecte ? deconnecter(canal.id) : connecter(type))}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg ${connecte ? 'border border-red-200 text-red-600' : 'gradient-brand text-white'}`}
                    disabled
                  >
                    {connecte ? 'Déconnecter' : 'Connecter'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}