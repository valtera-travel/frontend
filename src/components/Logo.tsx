export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-xl font-semibold ${className}`} style={{ fontFamily: 'var(--font-serif)' }}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-coral">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M21 3L3 10.5l7 3 3 7z" strokeLinejoin="round" /></svg>
      </span>
      ValteraTravel
    </span>
  )
}
