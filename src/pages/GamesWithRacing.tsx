import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Flag, Gauge, Sparkles } from 'lucide-react';
import GameZone from '@/pages/GameZone';
import RacingGameV2 from '@/components/RacingGameV2';
import ColorDrawSection from '@/components/ColorDrawSection';

type ColoringTemplate = 'fox' | 'dino' | 'bunny' | 'unicorn';

type Props = {
  onPlayGame: (gameId: string) => void;
  onOpenColoring: (templateId: ColoringTemplate) => void;
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
        <div className="pointer-events-none absolute inset-0 overflow-hidden"><motion.div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" animate={{ x: [0, 35, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} /><motion.div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-lavender-200/35 blur-3xl" animate={{ x: [0, -28, 0], scale: [1, 1.12, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} /></div>
        <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-br from-sky-100 via-lavender-100 to-mint-100 p-5 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/70 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500"><Sparkles size={14} /> Turbo Track</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400"><Gauge size={13} /> Action racing</span></div><h2 className="mt-4 font-display text-3xl font-bold leading-tight text-lavender-500 sm:text-4xl">Race with the Bots.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-lavender-400 sm:text-base">A fast, friendly arcade race with a big car, moving track, two AI racers and a turbo boost made for quick play.</p><div className="mt-5 flex flex-wrap gap-2"><BotDriver name="Bolt Bot" color="#dbeafe" /><BotDriver name="Sunny Bot" color="#fef3c7" /></div><motion.button type="button" onClick={() => setRacingOpen(true)} whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }} className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-lavender-400 to-lavender-500 px-5 py-3.5 font-display font-bold text-white shadow-soft-lg"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Flag size={17} /></span>Start Racing<span>→</span></motion.button></div>
            <div className="relative flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/30 p-3 shadow-soft backdrop-blur-xl sm:p-5"><div className="absolute inset-x-8 bottom-4 h-16 rounded-full bg-lavender-400/15 blur-3xl" /><HeroCar /><motion.div className="absolute right-3 top-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>🏁 225 m finish</motion.div></div>
          </div>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">{[{ icon: '🚗', title: 'Real racing car', text: 'Large illustrated car' }, { icon: '🤖', title: '2 AI racers', text: 'Bot opponents on track' }, { icon: '⚡', title: 'Turbo boost', text: 'Speed up your run' }].map((item, index) => <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md"><div className="flex items-center gap-3"><span className="text-2xl">{item.icon}</span><div><p className="text-[11px] font-display font-bold text-lavender-500">{item.title}</p><p className="text-xs text-lavender-300">{item.text}</p></div></div></motion.div>)}</div>
        </div>
      </section>
      <ColorDrawSection onOpenColoring={onOpenColoring} />
      <AnimatePresence>{racingOpen && <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-lavender-950/25 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} className="relative max-h-[94vh] w-full max-w-5xl overflow-auto rounded-[2rem] border border-white/90 bg-white/80 p-3 shadow-[0_35px_120px_rgba(54,45,110,0.26)] backdrop-blur-2xl sm:p-5"><RacingGameV2 soundOn onDone={() => setRacingOpen(false)} /></motion.div></motion.div>}</AnimatePresence>
    </div>
  );
}
