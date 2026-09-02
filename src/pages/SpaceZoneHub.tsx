import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Sparkles, Layers3, ShieldCheck, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { games } from '@/data/content';

type SpaceZoneHubProps = {
  onOpenPlatform: () => void;
};

export default function SpaceZoneHub({ onOpenPlatform }: SpaceZoneHubProps) {
  const gameCount = games.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream">
      <AnimatedBackground density="high" />

      <motion.div
        className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-lavender-200/35 blur-3xl"
        animate={{ scale: [1, 1.18, 1], x: [0, -25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <header className="flex items-center justify-between">
          <motion.button
            type="button"
            onClick={onOpenPlatform}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3 rounded-3xl px-2 py-1.5"
            aria-label="Enter SPACE ZONE"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], y: [0, -2, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-lavender-400 text-xl shadow-soft"
            >
              🚀
            </motion.div>
            <div className="text-left">
              <div className="font-display text-lg font-bold tracking-tight text-lavender-500">SPACE ZONE</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender-300">Play · Learn · Explore</div>
            </div>
          </motion.button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-bold text-lavender-400 shadow-soft backdrop-blur-md">
              {gameCount} experiences ready
            </span>
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-14 lg:py-16">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lavender-400 shadow-soft backdrop-blur-md">
                <Sparkles size={14} />
                Your world starts here
              </div>

              <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-lavender-500 sm:text-6xl lg:text-7xl">
                One space.
                <br />
                <span className="bg-gradient-to-r from-sky-400 via-lavender-400 to-blush-400 bg-clip-text text-transparent">
                  Many worlds.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-lavender-400 sm:text-lg">
                SPACE ZONE is the home for games, learning experiences and future interactive apps — each one can grow as its own world inside one platform.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-3.5 py-2.5 text-sm font-semibold text-lavender-400 shadow-soft backdrop-blur-md">
                  <Layers3 size={17} />
                  Independent worlds
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-3.5 py-2.5 text-sm font-semibold text-lavender-400 shadow-soft backdrop-blur-md">
                  <ShieldCheck size={17} />
                  One safe platform
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12, type: 'spring', stiffness: 120, damping: 18 }}
              className="relative mx-auto w-full max-w-2xl"
            >
              <motion.div
                className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-sky-200/40 via-lavender-200/30 to-blush-200/30 blur-2xl"
                animate={{ scale: [1, 1.035, 1], opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <button
                type="button"
                onClick={onOpenPlatform}
                className="group relative block w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/52 p-3 text-left shadow-[0_30px_90px_rgba(86,77,140,0.18)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-lavender-200/70"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/65 via-white/15 to-sky-100/25" />
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-200/45 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-lavender-200/35 blur-3xl transition-transform duration-700 group-hover:scale-125" />

                <div className="relative overflow-hidden rounded-[1.55rem] bg-gradient-to-br from-lavender-400 via-sky-400 to-blush-300 p-6 text-white sm:p-8">
                  <motion.div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -bottom-12 left-1/3 h-28 w-28 rounded-full border border-white/15"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  />

                  <div className="relative flex items-start justify-between gap-6">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                        <Gamepad2 size={13} />
                        Existing SPACE ZONE experience
                      </div>
                      <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">SPACE ZONE KIDS</h2>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
                        Enter the complete experience already built in this project — with its pages, learning area, games, profile, rewards and more.
                      </p>
                    </div>
                    <motion.div
                      animate={{ y: [0, -7, 0], rotate: [0, 4, -4, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[1.7rem] bg-white/18 text-4xl shadow-soft backdrop-blur-md sm:flex"
                    >
                      🦉
                    </motion.div>
                  </div>

                  <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15"><Zap size={15} /></span>
                      Ready to launch
                    </div>
                    <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-display text-sm font-bold text-lavender-500 shadow-soft transition-all duration-300 group-hover:gap-3">
                      Enter this world
                      <ArrowRight size={17} />
                    </div>
                  </div>
                </div>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-lavender-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                This card opens the existing full project — not a separate copy.
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/55 pt-5 text-xs font-semibold text-lavender-300 sm:flex-row sm:items-center sm:justify-between">
          <span>SPACE ZONE · A growing platform for interactive worlds</span>
          <span>{gameCount} games already connected inside the current experience</span>
        </footer>
      </div>
    </main>
  );
}
