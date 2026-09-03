import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Flag, Gauge, Sparkles, Trophy } from 'lucide-react';
import GameZone from '@/pages/GameZone';
import RacingGame from '@/components/RacingGame';

type Props = {
  onPlayGame: (gameId: string) => void;
};

export default function GamesWithRacing({ onPlayGame }: Props) {
  const [racingOpen, setRacingOpen] = useState(false);

  return (
    <div>
      <GameZone onPlayGame={onPlayGame} />

      <section className="relative mx-4 mb-24 mt-2 overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/45 p-4 shadow-[0_24px_75px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-7xl lg:p-7">
        <motion.div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" animate={{ x: [0, -20, 0], y: [0, 18, 0], scale: [1, 1.12, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div aria-hidden="true" className="absolute -bottom-28 left-[28%] h-64 w-64 rounded-full bg-lavender-200/35 blur-3xl" animate={{ x: [0, 28, 0], scale: [1, 1.14, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative overflow-hidden rounded-[1.9rem] bg-gradient-to-br from-sky-100 via-lavender-100 to-mint-100 p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500"><Sparkles size={14} /> Turbo Track</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400"><Gauge size={13} /> Action racing</span>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/75 text-3xl shadow-soft backdrop-blur-md" animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>🏎️</motion.div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">Turbo Kids Racing</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-lavender-400 sm:text-base">Dodge the road, collect speed and use your boost to race all the way to the finish!</p>
                </div>
              </div>
            </div>

            <motion.button type="button" onClick={() => setRacingOpen(true)} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.97 }} className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-lavender-400 to-lavender-500 px-5 py-3.5 font-display font-bold text-white shadow-soft-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Flag size={17} /></span>
              Start Racing
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </motion.button>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: '🚗', label: 'Dodge traffic', value: '3 lanes' },
              { icon: '⚡', label: 'Boost power', value: 'Fast mode' },
              { icon: '🏁', label: 'Finish line', value: '225 m' },
            ].map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3"><span className="text-2xl">{item.icon}</span><div><p className="text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">{item.label}</p><p className="text-sm font-display font-bold text-lavender-500">{item.value}</p></div></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {racingOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-lavender-950/25 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} className="relative max-h-[94vh] w-full max-w-4xl overflow-auto rounded-[2rem] border border-white/90 bg-white/80 p-3 shadow-[0_35px_120px_rgba(54,45,110,0.26)] backdrop-blur-2xl sm:p-5">
              <RacingGame onDone={() => setRacingOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
