export default function StatCard({ label, value, hint, hintColor = 'text-emerald-600' }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      {hint && <p className={`text-xs mt-2 ${hintColor}`}>{hint}</p>}
    </div>
  )
}