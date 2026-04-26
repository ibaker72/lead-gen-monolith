const CREDENTIALS = [
  { acronym: 'BBB', label: 'BBB Accredited', sub: 'A+ Rating', color: 'text-blue-700' },
  { acronym: 'GG', label: 'Google Guaranteed', sub: 'Verified Business', color: 'text-blue-500' },
  { acronym: 'NJ', label: 'Licensed in NJ', sub: 'State Certified', color: 'text-slate-700' },
  { acronym: 'AI', label: 'Angi Approved', sub: 'Top Pro Network', color: 'text-orange-600' },
  { acronym: '★', label: 'Satisfaction', sub: 'Guarantee', color: 'text-emerald-600' },
]

export function CredentialBar() {
  return (
    <section className="bg-slate-50 border-y border-slate-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 text-center mb-6">
          Trusted &amp; Accredited By
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {CREDENTIALS.map(({ acronym, label, sub, color }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-300 bg-white px-6 py-4 flex flex-col items-center gap-1 min-w-[120px]"
            >
              <span className={`text-2xl font-extrabold ${color}`}>{acronym}</span>
              <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
              <span className="text-xs text-slate-400 text-center">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
