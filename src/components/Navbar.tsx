import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Home, Gamepad2, Trophy, User, Settings, Menu, X, Shield, GraduationCap, ShoppingBag, MessageCircle, Music, Rocket } from 'lucide-react';
import type { Profile } from '@/lib/db';
import { useMusicContext } from './BackgroundMusic';

type NavProps = {
  current: string;
  onNavigate: (page: string) => void;
  profile: Profile | null;
  onOpenAssistant?: () => void;
  onOpenHub?: () => void;
};

const links = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'achievements', label: 'Awards', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'parent', label: 'Parents', icon: Shield },
];

export default function Navbar({ current, onNavigate, profile, onOpenAssistant, onOpenHub }: NavProps) {
  const [open, setOpen] = useState(false);
  const { isMusicOn, toggleMusic } = useMusicContext();
  const streak = profile?.day_streak ?? 0;
  const coins = profile?.coins ?? 0;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 pt-2 sm:pt-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)' }}
      >
        <nav className="mx-auto w-full max-w-[1600px] glass-strong rounded-2xl sm:rounded-3xl shadow-soft px-3 sm:px-4 lg:px-5 py-2.5 flex items-center gap-3 lg:gap-5 min-w-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-fit"
            aria-label="Wonder Kids home"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-sky-300 to-lavender-400 flex items-center justify-center shadow-soft"
            >
              <span className="text-lg sm:text-xl">🦉</span>
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-lavender-300/40 blur-md -z-10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <span className="font-display text-lg sm:text-xl font-semibold text-lavender-500 hidden sm:block whitespace-nowrap">
              Wonder<span className="text-blush-400">Kids</span>
            </span>
          </button>

          <div
            className="hidden md:flex flex-1 min-w-0 overflow-x-auto items-center justify-start gap-2 lg:gap-3 px-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {links.map((l) => {
              const Icon = l.icon;
              const active = current === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => onNavigate(l.id)}
                  className={`relative shrink-0 px-3 lg:px-4 py-2.5 rounded-2xl font-display font-medium text-sm transition-colors touch-target ${
                    active ? 'text-white' : 'text-lavender-500 hover:text-lavender-400'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 shadow-soft"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2 whitespace-nowrap">
                    <Icon size={16} />
                    {l.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:gap-2.5 shrink-0">
            {onOpenHub && (
              <motion.button
                onClick={onOpenHub}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-1.5 rounded-2xl border border-white/80 bg-gradient-to-r from-sky-100/90 via-white/70 to-lavender-100/90 px-2.5 py-2 text-lavender-500 shadow-soft backdrop-blur-md sm:px-3"
                aria-label="Return to SPACE ZONE HUB"
                title="Return to SPACE ZONE HUB"
              >
                <motion.span
                  animate={{ y: [0, -2, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-base"
                >
                  <Rocket size={17} />
                </motion.span>
                <span className="hidden lg:inline font-display text-xs font-bold uppercase tracking-[0.08em] whitespace-nowrap">
                  SPACE ZONE HUB
                </span>
              </motion.button>
            )}
            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-lemon-100 border border-lemon-200 shrink-0"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-base"
                  >
                    🔥
                  </motion.span>
                  <span className="font-display font-semibold text-sm text-lemon-500">{streak}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => onNavigate('shop')}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-lemon-100 to-peach-100 border border-lemon-200 overflow-hidden group shrink-0"
              aria-label="Coins"
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-base relative z-10"
              >
                🪙
              </motion.span>
              <span className="font-display font-semibold text-sm text-lemon-500 relative z-10">{coins.toLocaleString()}</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
            {onOpenAssistant && (
              <motion.button
                onClick={onOpenAssistant}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-sky-100 to-lavender-100 text-lavender-500 font-display font-semibold text-sm hover:from-sky-200 hover:to-lavender-200 transition-colors touch-target-sm shrink-0"
                aria-label="Open Ask Owly AI assistant"
              >
                <MessageCircle size={17} />
                Ask Owly
              </motion.button>
            )}
            <button
              onClick={toggleMusic}
              className={`p-2.5 rounded-2xl transition-colors touch-target-sm group shrink-0 ${
                isMusicOn ? 'bg-lavender-100 text-lavender-600' : 'text-lavender-500 hover:bg-lavender-100 hover:text-lavender-600'
              }`}
              aria-label={isMusicOn ? 'Turn music off' : 'Turn music on'}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="group-hover:drop-shadow-md"
              >
                <Music size={20} />
              </motion.div>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`p-2.5 rounded-2xl transition-colors touch-target-sm shrink-0 ${
                current === 'settings' ? 'bg-lavender-200 text-lavender-500' : 'text-lavender-400 hover:bg-lavender-100'
              }`}
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2.5 rounded-2xl text-lavender-500 hover:bg-lavender-100 touch-target-sm shrink-0"
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="md:hidden fixed inset-0 top-0 bg-lavender-500/20 backdrop-blur-sm z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="md:hidden mx-auto w-full max-w-[1600px] mt-2 glass-strong rounded-3xl shadow-soft-lg p-3 flex flex-col gap-2"
              >
                {onOpenHub && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      onOpenHub();
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-sky-100 to-lavender-100 text-lavender-500 font-display font-bold text-base touch-target"
                  >
                    <Rocket size={20} />
                    SPACE ZONE HUB
                  </motion.button>
                )}
                {onOpenAssistant && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: links.length * 0.05 }}
                    onClick={() => {
                      onOpenAssistant();
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-sky-100 to-lavender-100 text-lavender-500 font-display font-semibold text-base touch-target"
                  >
                    <MessageCircle size={20} />
                    Ask Owly
                  </motion.button>
                )}
                {links.map((l, i) => {
                  const Icon = l.icon;
                  const active = current === l.id;
                  return (
                    <motion.button
                      key={l.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        onNavigate(l.id);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-display font-medium text-base touch-target transition-colors ${
                        active ? 'bg-gradient-to-r from-sky-300 to-lavender-400 text-white' : 'text-lavender-500 hover:bg-lavender-100'
                      }`}
                    >
                      <Icon size={20} />
                      {l.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl shadow-soft-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {links.slice(0, 6).map((l) => {
            const Icon = l.icon;
            const active = current === l.id;
            return (
              <button
                key={l.id}
                onClick={() => onNavigate(l.id)}
                className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-colors touch-target-sm relative"
                aria-label={l.label}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  animate={active ? { y: -2 } : { y: 0 }}
                  className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-lavender-100' : ''}`}
                >
                  <Icon
                    size={22}
                    className={active ? 'text-lavender-500' : 'text-lavender-300'}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-display font-semibold transition-colors ${
                    active ? 'text-lavender-500' : 'text-lavender-300'
                  }`}
                >
                  {l.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-lavender-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
