import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function MandatoryResetOverlay({ onAccept }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-4 rounded-2xl border border-red-500/40 bg-card p-8 text-center shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(239,68,68,0.15)' }}
      >
        <div className="text-5xl mb-4">⚖️</div>
        <h2 className="text-2xl font-black text-red-400 mb-2 tracking-tight">BALANCE PATCH</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Yeah, we noticed. Making money was <span className="text-red-300 font-semibold">way</span> too easy.
          <br /><br />
          The devs sat down, looked at the numbers, and decided this simply cannot stand. Your gains have been audited. The verdict? <span className="text-red-300 font-semibold">Wiped.</span>
          <br /><br />
          You're being reset to <span className="text-white font-mono font-bold">$10,000</span>. The market gods demand sacrifice. This is non-negotiable.
        </p>
        <Button
          className="w-full gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm"
          onClick={onAccept}
        >
          <RotateCcw className="w-4 h-4" />
          Accept the Reset & Continue
        </Button>
        <p className="text-[10px] text-muted-foreground mt-3">You cannot proceed without accepting. There is no escape.</p>
      </motion.div>
    </div>
  );
}