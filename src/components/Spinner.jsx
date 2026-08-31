export default function Spinner({ className = '' }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-brand-purple h-6 w-6 ${className}`} />
  )
}