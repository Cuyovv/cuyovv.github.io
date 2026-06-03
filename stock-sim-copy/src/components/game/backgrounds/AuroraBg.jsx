import { useEffect, useRef } from 'react';

export default function AuroraBg() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const animate = () => {
      t += 0.004;
      const s1 = 50 + Math.sin(t) * 20;
      const s2 = 30 + Math.cos(t * 0.7) * 15;
      const s3 = 40 + Math.sin(t * 1.3) * 18;
      el.style.background = [
        `radial-gradient(ellipse ${s1}% 30% at ${30 + Math.sin(t * 0.5) * 20}% 20%, rgba(20,184,166,0.20) 0%, transparent 70%)`,
        `radial-gradient(ellipse ${s2}% 25% at ${60 + Math.cos(t * 0.6) * 25}% 35%, rgba(99,102,241,0.16) 0%, transparent 70%)`,
        `radial-gradient(ellipse ${s3}% 20% at ${50 + Math.sin(t * 0.9) * 15}% 55%, rgba(244,63,94,0.10) 0%, transparent 70%)`,
      ].join(', ');
    };
    const id = setInterval(animate, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}