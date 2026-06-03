import { useEffect, useRef } from 'react';

export default function CircuitBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawCircuit();
    };

    function drawCircuit() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grid = 40;
      ctx.strokeStyle = 'rgba(99,102,241,0.25)';
      ctx.lineWidth = 1;

      const nodes = [];
      for (let x = grid; x < canvas.width; x += grid) {
        for (let y = grid; y < canvas.height; y += grid) {
          if (Math.random() > 0.65) nodes.push({ x, y });
        }
      }

      // Draw lines between nearby nodes
      nodes.forEach(a => {
        nodes.forEach(b => {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < grid * 2.5 && dist > 0 && Math.random() > 0.5) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            // L-shaped circuit traces
            if (Math.random() > 0.5) {
              ctx.lineTo(b.x, a.y);
              ctx.lineTo(b.x, b.y);
            } else {
              ctx.lineTo(a.x, b.y);
              ctx.lineTo(b.x, b.y);
            }
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.5)';
        ctx.fill();
      });
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}