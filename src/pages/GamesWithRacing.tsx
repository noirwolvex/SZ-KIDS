import { AnimatePresence, motion } from 'framer-motion';
import { Flag, Gauge, Sparkles, Rocket, Zap, Star, ArrowRight } from 'lucide-react';
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

function SpaceRunnerPreview() {
  const lanes = [0, 1, 2];
  const streaks = Array.from({ length: 22 });

  return (
    <motion.div
      className="group relative h-[390px] w-full overflow-hidden rounded-[2.4rem] border border-white/15 bg-[#050b1a] shadow-[0_35px_100px_rgba(2,8,23,0.5)] sm:h-[500px]"
      whileHover={{ scale: 1.008 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.36),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(124,92,231,0.28),transparent_36%),linear-gradient(180deg,#061022_0%,#0b1732_45%,#111f46_100%)]" />
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />

      {Array.from({ length: 28 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(index * 29) % 98}%`,
            top: `${4 + ((index * 17) % 70)}%`,
            width: index % 5 === 0 ? 3 : 2,
            height: index % 5 === 0 ? 3 : 2,
          }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.65, 1.4, 0.65] }}
          transition={{ duration: 1.4 + (index % 5) * 0.5, repeat: Infinity, delay: index * 0.07 }}
        />
      ))}

      <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-2 sm:left-6 sm:right-6 sm:top-6">
        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-xl sm:px-4 sm:text-[11px]">LIVE PREVIEW • SPACE RUNNER</div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-display font-bold text-white/80 backdrop-blur-xl"><Zap size={13} className="text-yellow-300" /> 76 KM/H</div>
      </div>

      <div className="absolute inset-x-[12%] bottom-[12%] top-[23%] perspective-[900px]">
        <motion.div
          className="absolute inset-0 origin-bottom rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.03] via-sky-300/[0.04] to-sky-300/[0.12]"
          style={{ transform: 'perspective(900px) rotateX(16deg)' }}
        />
        <div className="absolute inset-x-[6%] bottom-0 top-0" style={{ transform: 'perspective(900px) rotateX(16deg)' }}>
          {lanes.map((lane) => (
            <div key={lane} className="absolute inset-y-0 w-px bg-gradient-to-b from-white/10 via-sky-200/25 to-sky-300/5" style={{ left: `${lane * 50}%` }} />
          ))}
          {streaks.map((_, index) => (
            <motion.span
              key={index}
              className="absolute h-16 w-px rounded-full bg-sky-200/30"
              style={{ left: `${(index % 11) * 10}%`, top: `${(index * 17) % 75}%` }}
              animate={{ y: [0, 130], opacity: [0, 0.75, 0] }}
              transition={{ duration: 1.3 + (index % 4) * 0.2, repeat: Infinity, delay: index * 0.06, ease: 'linear' }}
            />
          ))}
        </div>

        <motion.div className="absolute left-[9%] top-[36%] text-3xl sm:text-4xl" animate={{ y: [0, 7, 0], rotate: [-8, 6, -8] }} transition={{ duration: 2, repeat: Infinity }}>☄️</motion.div>
        <motion.div className="absolute right-[10%] top-[53%] text-3xl sm:text-4xl" animate={{ y: [0, -7, 0], rotate: [7, -6, 7] }} transition={{ duration: 1.8, repeat: Infinity }}>🛸</motion.div>
        <motion.div className="absolute left-[44%] top-[18%] text-3xl sm:text-4xl" animate={{ y: [0, 10, 0], scale: [0.94, 1.08, 0.94] }} transition={{ duration: 1.7, repeat: Infinity }}>⭐</motion.div>

        <motion.div
          className="absolute left-1/2 top-[49%] -translate-x-1/2"
          animate={{ y: [0, -16, 0], rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-cyan-200/30 bg-gradient-to-br from-sky-300/30 via-cyan-200/10 to-violet-400/25 shadow-[0_0_65px_rgba(56,189,248,0.4)] backdrop-blur-lg sm:h-36 sm:w-36">
            <div className="absolute -inset-5 rounded-[2.5rem] border border-sky-300/10" />
            <Rocket size={68} strokeWidth={1.4} className="text-sky-100 drop-shadow-[0_0_20px_rgba(125,211,252,0.7)] sm:h-[82px] sm:w-[82px]" />
            <span className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl shadow-lg backdrop-blur-md">🚀</span>
            <motion.div className="absolute -bottom-11 left-1/2 h-20 w-14 -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent via-cyan-300/25 to-white/50 blur-lg" animate={{ scaleY: [0.8, 1.2, 0.8], opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 0.55, repeat: Infinity }} />
          </div>
        </motion.div>

        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-display font-bold text-slate-300 backdrop-blur-md sm:px-5 sm:text-xs">
          <span>← / →</span><span className="text-slate-500">•</span><span>JUMP</span><span className="text-slate-500">•</span><span>SLIDE</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2 sm:bottom-6 sm:left-6 sm:right-6">
        {[
          { value: '720m', label: 'Target' },
          { value: 'x2.0', label: 'Boost' },
          { value: '∞', label: 'Endless Score' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
            <p className="font-display text-sm font-black text-white sm:text-base">{item.value}</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SpaceRunnerSection({ onPlayGame }: { onPlayGame: (gameId: string) => void }) {
  return (
    <section className="relative mx-2 mb-8 mt-3 overflow-hidden rounded-[3rem] border border-white/90 bg-white/50 p-3 shadow-[0_40px_120px_rgba(86,74,148,0.18)] backdrop-blur-2xl sm:mx-4 sm:p-5 lg:mx-auto lg:max-w-[1500px] lg:p-7">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute -left-32 -top-28 h-[30rem] w-[30rem] rounded-full bg-sky-300/30 blur-3xl" animate={{ x: [0, 50, 0], y: [0, 28, 0], scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-32 bottom-[-8rem] h-[34rem] w-[34rem] rounded-full bg-lavender-300/30 blur-3xl" animate={{ x: [0, -45, 0], y: [0, -20, 0], scale: [1, 1.14, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="relative overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-950 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-7 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.26),transparent_28%),radial-gradient(circle_at_8%_88%,rgba(167,139,250,0.22),transparent_30%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-white/10 px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-[0.18em] text-sky-100 backdrop-blur-md sm:text-[11px]"><Sparkles size={14} /> SPACE ZONE ORIGINAL</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-cyan-100"><Zap size={13} /> High-speed arcade</span>
            </div>
            <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mt-5 font-display text-5xl font-black leading-[0.88] tracking-[-0.04em] sm:text-6xl lg:text-7xl">SPACE RUNNER <span className="inline-block drop-shadow-[0_0_24px_rgba(125,211,252,0.55)]">🚀</span></motion.h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">Jump into a living cosmic highway, switch lanes at speed, dodge hazards, grab glowing rewards and build a score that keeps getting harder to beat.</p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {['3 Lanes', 'Jump & Dodge', 'Coins', 'Power-ups', 'Shield', 'High Score'].map((item, index) => (
                <motion.div key={item} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-bold text-slate-200 backdrop-blur-md sm:px-4 sm:py-3">
                  <span className="mr-1.5 text-sky-300">✦</span>{item}
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => onPlayGame('space-runner')} className="group inline-flex items-center gap-2.5 rounded-2xl bg-sky-400 px-6 py-3.5 text-sm font-display font-black text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.34)] transition-all hover:-translate-y-1 hover:bg-sky-300 hover:shadow-[0_22px_50px_rgba(56,189,248,0.42)] active:scale-[0.98] sm:px-7"><Rocket size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" /> Play SPACE RUNNER <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-xs font-bold text-slate-300 backdrop-blur-md"><Star size={16} className="text-yellow-300" /> New arcade adventure</div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2.5 max-w-md">
              {[
                { value: '72s', label: 'Run Time' },
                { value: '76', label: 'Max Speed' },
                { value: '3', label: 'Core Moves' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-3 backdrop-blur-md">
                  <p className="font-display text-lg font-black text-white">{item.value}</p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <SpaceRunnerPreview />
        </div>

        <div className="relative mt-8 flex flex-col gap-3 rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="font-display text-sm font-black text-white sm:text-base">Your next run starts here.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Original SPACE ZONE gameplay — switch lanes, jump, slide, collect and chase your record.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">⌨ Keyboard</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">👆 Touch</span></div>
        </div>
      </div>
    </section>
  );
}

export default function GamesWithRacing({ onPlayGame, onOpenColoring }: Props) {
  const [racingOpen, setRacingOpen] = useState(false);

  return (
    <div>
      <GameZone onPlayGame={onPlayGame} />
      <SpaceRunnerSection onPlayGame={onPlayGame} />
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
