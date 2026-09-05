import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, RotateCcw, Heart, Clock, Trophy, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import Mascot from '@/components/Mascot';
import { Button } from '@/components/ui';

export type GameProps = {
  onClose: () => void;
  onWin: (stars: number) => void;
};

export type GameStat = {
  icon: 'clock' | 'star' | 'heart' | 'score';
  value: string;
  color: string;
};

export type GameShellProps = {
  title: string;
  gradient: string;
  emoji?: string;
  onClose: () => void;
  onRestart: () => void;
  stats: GameStat[];
  children: ReactNode;
  status: 'playing' | 'won' | 'lost';
  stars: number;
  winMessage?: string;
  loseMessage?: string;
  winDetail?: string;
  difficultySelector?: ReactNode;
  wide?: boolean;
};

export default function GameShell({
  title, gradient, emoji, onClose, onRestart, stats, children, status, stars,
  winMessage = 'You did it!', loseMessage = 'Good try!', winDetail,
  difficultySelector, wide = false,
}: GameShellProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-lavender-500/30 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`w-full ${wide ? 'max-w-6xl' : 'max-w-2xl'} bg-cream rounded-3xl sm:rounded-5xl shadow-soft-lg overflow-hidden relative max-h-[94vh] flex flex-col`}
      >
        {/* Decorative top glow */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-80`} />

        {/* Header */}
        <div className={`relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${gradient} shrink-0 overflow-hidden`}>
          <motion.div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-8 left-12 w-16 h-16 rounded-full bg-white/10"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />

          <div className="relative flex items-center gap-2 sm:gap-3 min-w-0">
            {emoji && (
              <motion.div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-soft shrink-0"
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
              >
                {emoji}
              </motion.div>
            )}
            <h2 className="font-display text-lg sm:text-2xl font-bold text-lavender-500 drop-shadow-sm truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="relative p-2.5 rounded-full hover:bg-white/40 text-lavender-500 transition-colors active:scale-90 touch-target-sm shrink-0"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border-b border-lavender-50 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {stats.map((s, i) => (
              <StatPill key={i} {...s} />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRestart}
            className="p-2.5 rounded-2xl bg-lavender-100 hover:bg-lavender-200 text-lavender-500 transition-colors touch-target-sm shrink-0"
            aria-label="Restart"
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>

        {difficultySelector && (
          <div className="flex justify-center gap-2 px-4 sm:px-6 pt-3 sm:pt-4 shrink-0">{difficultySelector}</div>
        )}

        {emoji && (
          <div className="relative flex justify-center pt-2 sm:pt-3 px-4 shrink-0">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft border border-white/80 backdrop-blur-sm"
            >
              <span className="text-3xl sm:text-4xl drop-shadow-sm">{emoji}</span>
            </motion.div>
          </div>
        )}

        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar ${wide ? 'sm:p-7 lg:p-9' : ''}`}>{children}</div>

        <AnimatePresence>
          {status === 'won' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-cream/95 backdrop-blur-md z-10 overflow-y-auto py-8"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-lemon-300"
                  style={{ top: `${15 + Math.random() * 70}%`, left: `${10 + Math.random() * 80}%` }}
                  animate={{ scale: [0, 1, 0], rotate: [0, 180, 360], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Sparkles size={20 + Math.random() * 16} />
                </motion.div>
              ))}
              <motion.div
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="text-center relative z-10 flex flex-col items-center gap-6 sm:gap-8 p-8 sm:p-10"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Mascot size={130} expression="excited" className="mx-auto w-[100px] h-[100px] sm:w-[130px] sm:h-[130px]" />
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-2xl sm:text-3xl font-bold text-lavender-500"
                  >
                    {winMessage}
                  </motion.h3>
                  <div className="flex justify-center gap-2 sm:gap-3 my-4 sm:my-5">
                    {[1, 2, 3].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0, rotate: -30, y: -40 }}
                        animate={{ scale: 1, rotate: 0, y: 0 }}
                        transition={{ delay: 0.4 + s * 0.18, type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <Star
                          size={40}
                          className={s <= stars ? 'text-lemon-400 drop-shadow-md' : 'text-lavender-200'}
                          fill={s <= stars ? 'currentColor' : 'none'}
                          strokeWidth={s <= stars ? 0 : 2}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {winDetail && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-lavender-400 font-semibold">
                      {winDetail}
                    </motion.p>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex gap-3 justify-center flex-wrap"
                >
                  <Button onClick={onRestart} icon>Play Again</Button>
                  <Button variant="secondary" onClick={onClose}>Done</Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          {status === 'lost' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-cream/95 backdrop-blur-md z-10 overflow-y-auto py-8"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="text-center relative z-10 flex flex-col items-center gap-5 sm:gap-6 p-8 sm:p-10"
              >
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl sm:text-7xl">🦉</motion.div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-lavender-500">{loseMessage}</h3>
                  <p className="text-lavender-400 mt-2 text-sm sm:text-base">Don't worry — you're learning! Want to give it another go?</p>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={onRestart} icon>Try Again</Button>
                  <Button variant="secondary" onClick={onClose}>Done</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StatPill({ icon, value, color }: GameStat) {
  const Icon = icon === 'clock' ? Clock : icon === 'star' ? Star : icon === 'heart' ? Heart : Trophy;
  return (
    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white shadow-soft border border-lavender-50">
      <span className={color}><Icon size={15} /></span>
      <span className="font-display font-bold text-sm text-lavender-500">{value}</span>
    </div>
  );
}

export function computeStars(lives: number, maxLives: number): number {
  const ratio = lives / maxLives;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
