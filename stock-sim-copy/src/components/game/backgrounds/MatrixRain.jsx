import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF$%@#';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cols = Math.floor(canvas.width / fontSize);
      while (drops.length < cols) drops.push(Math.random() * -100);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        // Bright head
        if (drops[i] * fontSize < canvas.height && Math.random() > 0.95) {
          ctx.fillStyle = '#ffffff';
        } else {
          // Gradient from bright green to dark green
          const alpha = Math.random() * 0.5 + 0.5;
          ctx.fillStyle = `rgba(0, ${Math.floor(180 + Math.random() * 75)}, 70, ${alpha})`;
        }

        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    };

    const interval = setInterval(draw, 40);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.18 }}
    />
  );
}