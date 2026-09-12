import { AnimatePresence, motion } from 'framer-motion';
import { Flag, Gauge } from 'lucide-react';
import { useState } from 'react';
import GameZone from '@/pages/GameZone';
import RacingGameV2 from '@/components/RacingGameV2';
import ColorDrawSection from '@/components/ColorDrawSection';

type ColoringTemplate = 'fox' | 'dino' | 'bunny' | 'unicorn';

type Props = {
  onPlayGame: (gameId: string) => void;
  onOpenColoring: (templateId: any) => void;
};

function HeroCar() {
  return (
    <motion.div className="relative mx-auto w-full max-w-[420px]" animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>
      <motion.div className="absolute inset-x-8 bottom-3 h-9 rounded-full bg-lavender-500/15 blur-2xl" animate={{ scaleX: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }} transition={{ duration: 2.8, repeat: Infinity }} />
      <svg viewBox="0 0 520 270" className="relative h-auto w-full drop-shadow-[0_28px_35px_rgba(52,49,120,0.2)]" role="img" aria-label="Turbo Kids Racing car">
        <defs>
          <linearGradient id="heroCar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.2" stopColor="#67e8f9" /><stop offset="0.55" stopColor="#38bdf8" /><stop offset="1" stopColor="#7c5ce7" /></linearGradient>
          <linearGradient id="heroGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ecfeff" /><stop offset="1" stopColor="#64748b" /></linearGradient>
          <linearGradient id="heroRoad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#dbeafe" /><stop offset="0.5" stopColor="#ffffff" /><stop offset="1" stopColor="#d1fae5" /></linearGradient>
        </defs>
        <path d="M12 218 Q110 183 180 194 L224 153 Q250 124 298 124 L355 124 Q397 129 438 168 L492 188 Q508 194 508 210 L500 229 Q390 248 130 242 Z" fill="url(#heroRoad)" opacity="0.85" />
        <ellipse cx="260" cy="227" rx="190" ry="24" fill="#111827" opacity="0.18" />
        <rect x="65" y="170" width="62" height="62" rx="24" fill="#0f172a" /><rect x="390" y="170" width="62" height="62" rx="24" fill="#0f172a" />
        <rect x="81" y="181" width="30" height="42" rx="12" fill="#475569" /><rect x="406" y="181" width="30" height="42" rx="12" fill="#475569" />
        <path d="M92 176 Q112 117 165 101 L219 85 Q260 76 303 84 L358 98 Q410 111 432 176 L405 204 Q260 230 116 204 Z" fill="url(#heroCar)" stroke="#fff" strokeWidth="4" strokeOpacity="0.75" />
        <path d="M181 104 Q203 58 256 50 Q312 54 339 105 L326 138 L194 138 Z" fill="#0f172a" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" />
        <path d="M194 108 L326 108 L316 130 L205 130 Z" fill="url(#heroGlass)" />
        <path d="M120 155 L181 155" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.82" /><path d="M337 155 L398 155" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.62" />
        <circle cx="141" cy="157" r="11" fill="#f8fafc" /><circle cx="377" cy="157" r="11" fill="#f8fafc" /><circle cx="141" cy="157" r="5" fill="#fde68a" /><circle cx="377" cy="157" r="5" fill="#fde68a" />
        <path d="M171 188 Q260 164 349 188" stroke="#0f172a" strokeOpacity="0.16" strokeWidth="9" fill="none" /><rect x="212" y="180" width="96" height="22" rx="11" fill="#fff" opacity="0.25" />
        <path d="M66 165 L28 153 L36 136 L83 144 Z" fill="#7c5ce7" opacity="0.85" /><path d="M438 165 L484 153 L476 136 L425 144 Z" fill="#7c5ce7" opacity="0.85" />
        <g transform="translate(232 22)"><rect width="56" height="38" rx="14" fill="#fff" opacity="0.94" /><circle cx="17" cy="18" r="4" fill="#6366f1" /><circle cx="39" cy="18" r="4" fill="#6366f1" /><path d="M17 27 Q28 34 39 27" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" /></g>
      </svg>
    </motion.div>
  );
}

function BotDriver({ color, name }: { color: string; name: string }) {
  return <motion.div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md" whileHover={{ y: -3, scale: 1.02 }}><span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: color }}>🤖</span><div><p className="text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">AI Racer</p><p className="text-xs font-display font-bold text-lavender-500">{name}</p></div></motion.div>;
}

export default function GamesWithRacing({ onPlayGame, onOpenColoring }: Props) {
  const [racingOpen, setRacingOpen] = useState(false);

  return (
    <div>
      <GameZone onPlayGame={onPlayGame} />
      <section className="relative mx-4 mb-24 mt-2 overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/45 p-4 shadow-[0_30px_90px_rgba(86,74,148,0.14)] backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-7xl lg:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden"><motion.div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" animate={{ x: [0, 35, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} /><motion.div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-lavender-200/35 blur-3xl" animate={{ x: [0, -28, 0], scale: [1, 1.12, 1] }} transition={{ duration: 9, repeat: Infinity }} /></div>
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-2 text-lavender-300 font-display font-bold text-sm uppercase tracking-[0.16em]"><Flag size={18} className="text-sky-400" /> Turbo Track</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-black text-lavender-500">Ready, set, race!</h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-lavender-400 leading-relaxed">Race against AI drivers, collect boost energy and finish first in this colorful family-friendly track.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3"><BotDriver color="#e0f2fe" name="Nova" /><BotDriver color="#ede9fe" name="Pixel" /><BotDriver color="#dcfce7" name="Comet" /></div>
            <button onClick={() => setRacingOpen(true)} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-lavender-500 px-5 py-3 text-sm font-display font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-lavender-400 active:scale-[0.98]"><Gauge size={18} /> Launch Turbo Track</button>
          </div>
          <HeroCar />
        </div>
      </section>

      <div className="mb-24"><ColorDrawSection onOpenColoring={onOpenColoring} /></div>

      <AnimatePresence>
        {racingOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-lavender-500/30 backdrop-blur-md p-3 sm:p-6">
            <motion.div initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 24, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-[2rem] bg-cream shadow-soft-lg">
              <button onClick={() => setRacingOpen(false)} className="absolute right-3 top-3 z-20 rounded-full bg-white/70 p-2.5 text-lavender-500 backdrop-blur-sm hover:bg-white" aria-label="Close racing game">×</button>
              <RacingGameV2 onClose={() => setRacingOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
