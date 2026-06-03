export default function NebulaBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(139,92,246,0.18) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 75% 70%, rgba(6,182,212,0.14) 0%, transparent 55%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(244,63,94,0.08) 0%, transparent 60%)',
      }} />
      {/* Stars */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 55% 25%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 85% 35%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 20% 75%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 45% 85%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.6) 0%, transparent 100%)',
      }} />
    </div>
  );
}