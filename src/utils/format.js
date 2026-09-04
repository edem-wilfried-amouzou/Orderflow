export function formaterFCFA(montant) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(montant || 0)) + ' FCFA'
}

export function formaterDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}