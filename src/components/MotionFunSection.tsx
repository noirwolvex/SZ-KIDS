import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Flame,
  Music2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { addActivityLog, recordGamePlay } from '@/lib/db';

type MotionGame = 'star-catcher' | 'balloon-pop' | 'freeze-dance';

type MotionFunSectionProps = {
  onPlayGame?: (gameId: MotionGame) => void;
};

type Balloon = {
  id: number;
  x: number;
  y: number;
  hue: 'pink' | 'yellow' | 'blue' | 'mint';
  icon: string;
  size: 'sm' | 'md' | 'lg';
  drift: number;
};

const motionGames: Array<{
  id: MotionGame;
  title: string;
  description: string;
  emoji: string;
  badge: string;
  skill: string;
  gradient: string;
}> = [
  {
    id: 'star-catcher',
    title: 'Star Catcher',
    description: 'Track the glowing star, tap it, and keep your streak alive!',
    emoji: '⭐',
    badge: 'Reflex',
    skill: 'Hand-eye coordination',
    gradient: 'from-sky-200 via-lavender-200 to-white',
  },
  {
    id: 'balloon-pop',
    title: 'Balloon Pop',
    description: 'Pop quick balloons, chain combos, and chase a bigger score!',
    emoji: '🎈',
    badge: 'Combo',
    skill: 'Focus & timing',
    gradient: 'from-blush-200 via-peach-200 to-white',
  },
  {
    id: 'freeze-dance',
    title: 'Freeze Dance',
    description: 'Dance while the beat is on, then freeze at exactly the right moment!',
    emoji: '🪩',
    badge: 'Move',
    skill: 'Listening & reaction',
    gradient: 'from-mint-200 via-sky-200 to-white',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

async function persistMotionResult(gameId: MotionGame, title: string, score: number, stars: number) {
  try {
    await recordGamePlay(gameId, stars, score);
    await addActivityLog(
      gameId,
      title,
      motionGames.find((game) => game.id === gameId)?.emoji ?? '🎮',
      `Earned ${stars} star${stars !== 1 ? 's' : ''} & ${stars * 10} coins`,
    );
  } catch (error) {
    console.error(`[MotionFunSection] failed to save ${gameId} result:`, error);
  }
}

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextImpl =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return null;
  audioContext ??= new AudioContextImpl();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playTone(enabled: boolean, frequency: number, duration = 0.12, type: OscillatorType = 'sine', volume = 0.07) {
  if (!enabled) return;
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playSuccess(enabled: boolean) {
  if (!enabled) return;
  playTone(true, 523.25, 0.1, 'triangle', 0.06);
  window.setTimeout(() => playTone(true, 659.25, 0.1, 'triangle', 0.06), 70);
  window.setTimeout(() => playTone(true, 783.99, 0.16, 'triangle', 0.065), 140);
}

function makeBalloon(id: number): Balloon {
  const hues: Balloon['hue'][] = ['pink', 'yellow', 'blue', 'mint'];
  const icons = ['🎈', '🎀', '🟡', '💙'];
  const sizePool: Balloon['size'][] = ['sm', 'md', 'md', 'lg'];
  return {
    id,
    x: randomBetween(5, 88),
    y: randomBetween(10, 78),
    hue: hues[id % hues.length],
    icon: icons[id % icons.length],
    size: sizePool[id % sizePool.length],
    drift: randomBetween(9, 20),
  };
}

export default function MotionFunSection({ onPlayGame }: MotionFunSectionProps) {
  const [activeGame, setActiveGame] = useState<MotionGame | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const openGame = useCallback((gameId: MotionGame) => {
    setActiveGame(gameId);
    onPlayGame?.(gameId);
  }, [onPlayGame]);

  return (
    <>
      <section
        aria-labelledby="motion-fun-heading"
        className="mt-10 overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/45 p-3 shadow-[0_24px_75px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6 lg:p-7"
      >
        <div className="relative overflow-hidden rounded-[1.95rem] bg-gradient-to-br from-sky-100 via-lavender-100 to-blush-100 p-5 sm:p-7">
          <motion.div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/55 blur-3xl"
            animate={{ x: [0, -28, 0], y: [0, 22, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-28 left-[12%] h-64 w-64 rounded-full bg-sky-200/35 blur-3xl"
            animate={{ x: [0, 38, 0], scale: [1, 1.16, 1] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/70 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm backdrop-blur-md">
                  <Zap size={14} /> Move &amp; Play
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400 backdrop-blur-md">
                  <Music2 size={13} /> Kid-friendly sounds
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400 backdrop-blur-md">
                  <ShieldCheck size={13} /> Safe mini-games
                </span>
              </div>

              <div className="mt-4 flex items-start gap-3.5">
                <motion.div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/80 bg-white/75 text-3xl shadow-soft backdrop-blur-md"
                  animate={{ y: [0, -7, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🪩
                </motion.div>
                <div>
                  <h2 id="motion-fun-heading" className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">
                    Move, tap, listen &amp; play!
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lavender-400 sm:text-base">
                    Three tiny arcade challenges built for quick play: better feedback, more satisfying motion, and simple goals kids can understand instantly.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundOn((value) => !value)}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl border border-white/85 bg-white/70 px-3.5 py-2.5 text-sm font-display font-bold text-lavender-500 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5 active:scale-95"
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Turn game sounds off' : 'Turn game sounds on'}
            >
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
              {soundOn ? 'Sound on' : 'Sound off'}
            </button>
          </div>

          <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-3">
            {motionGames.map((game, index) => (
              <motion.button
                key={game.id}
                type="button"
                onClick={() => openGame(game.id)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08, duration: 0.42 }}
                whileHover={{ y: -10, rotate: index === 1 ? 0 : index === 0 ? -1 : 1, scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                className={`group relative overflow-hidden rounded-[1.7rem] border border-white/90 bg-gradient-to-br ${game.gradient} p-4 text-left shadow-soft-lg outline-none focus-visible:ring-4 focus-visible:ring-lavender-300/50`}
              >
                <motion.div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/45 blur-xl"
                  animate={{ scale: [1, 1.18, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 6 + index, repeat: Infinity }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/85 bg-white/72 text-4xl shadow-soft backdrop-blur-md"
                    animate={{ y: [0, -6, 0], rotate: [0, index % 2 === 0 ? 5 : -5, 0] }}
                    transition={{ duration: 2.8 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {game.emoji}
                  </motion.div>
                  <span className="rounded-full bg-white/68 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500 backdrop-blur-md">
                    {game.badge}
                  </span>
                </div>

                <div className="relative mt-5">
                  <h3 className="font-display text-xl font-bold text-lavender-500">{game.title}</h3>
                  <p className="mt-1.5 min-h-[3.1rem] text-xs leading-relaxed text-lavender-400">{game.description}</p>
                </div>

                <div className="relative mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/55 px-3 py-2.5 backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">Practice</p>
                    <p className="truncate text-xs font-display font-bold text-lavender-500">{game.skill}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lavender-400 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-3">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeGame && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-lavender-950/25 p-3 backdrop-blur-md sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Motion and fun game"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/78 p-3 shadow-[0_35px_120px_rgba(54,45,110,0.24)] backdrop-blur-2xl sm:p-5"
            >
              <button
                type="button"
                onClick={() => setActiveGame(null)}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/85 bg-white/78 text-lavender-500 shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-lavender-300/50"
                aria-label="Close game"
              >
                <X size={18} />
              </button>

              {activeGame === 'star-catcher' && <StarCatcher soundOn={soundOn} onDone={() => setActiveGame(null)} />}
              {activeGame === 'balloon-pop' && <BalloonPop soundOn={soundOn} onDone={() => setActiveGame(null)} />}
              {activeGame === 'freeze-dance' && <FreezeDance soundOn={soundOn} onDone={() => setActiveGame(null)} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MiniHeader({ emoji, title, subtitle, accent }: { emoji: string; title: string; subtitle: string; accent: string }) {
  return (
    <div className="px-1 pb-3 pt-1 sm:px-3 sm:pt-2">
      <div className="flex items-center gap-3">
        <motion.div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-sm`}
          animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-lavender-500">{title}</h3>
          <p className="text-sm leading-relaxed text-lavender-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ score, label = 'Score' }: { score: number; label?: string }) {
  return (
    <motion.div
      key={score}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/78 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm"
    >
      <Star size={14} fill="currentColor" />
      <span>{label}</span>
      <span>{score}</span>
    </motion.div>
  );
}

function GameResult({ emoji, title, text, score, stars, onRestart, onDone }: { emoji: string; title: string; text: string; score: number; stars: number; onRestart: () => void; onDone: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[22rem] flex-col items-center justify-center px-4 py-8 text-center">
      <motion.div className="text-6xl" animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        {emoji}
      </motion.div>
      <h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">{title}</h4>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-lavender-400">{text}</p>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/65 px-4 py-2.5 shadow-sm">
        <span className="text-lg">⭐</span>
        <span className="font-display font-bold text-lavender-500">{score}</span>
        <span className="text-lavender-300">•</span>
        <span className="font-display font-bold text-lavender-500">{stars}/3 stars</span>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/75 px-4 py-2.5 font-display font-bold text-lavender-500 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95">
          <RotateCcw size={16} /> Play again
        </button>
        <button type="button" onClick={onDone} className="rounded-2xl bg-lavender-400 px-5 py-2.5 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95">
          Back to games
        </button>
      </div>
    </motion.div>
  );
}

function StarCatcher({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [position, setPosition] = useState({ left: 50, top: 50 });
  const [pulse, setPulse] = useState(false);

  const moveTarget = useCallback(() => {
    setPosition({ left: randomBetween(12, 84), top: randomBetween(18, 78) });
  }, []);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setTimeLeft((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (timeLeft !== 0 || finished) return;
    setFinished(true);
    playSuccess(soundOn);
    const stars = score >= 20 ? 3 : score >= 11 ? 2 : score > 0 ? 1 : 0;
    void persistMotionResult('star-catcher', 'Star Catcher', score, stars);
  }, [timeLeft, finished, soundOn, score]);

  const catchStar = () => {
    if (finished) return;
    setScore((value) => value + 1);
    setStreak((value) => value + 1);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 180);
    playTone(soundOn, 620 + Math.min(streak, 8) * 38, 0.09, 'triangle');
    moveTarget();
  };

  const restart = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(20);
    setFinished(false);
    setPulse(false);
    moveTarget();
  };

  if (finished) {
    const stars = score >= 20 ? 3 : score >= 11 ? 2 : score > 0 ? 1 : 0;
    return <GameResult emoji="🏆" title="Star streak complete!" text={`You caught ${score} glowing stars. Your best run stayed alive for ${streak} catches!`} score={score} stars={stars} onRestart={restart} onDone={onDone} />;
  }

  return (
    <div>
      <MiniHeader emoji="⭐" title="Star Catcher" subtitle="Catch the star before it zips to its next spot." accent="from-sky-100 to-lavender-100" />
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3 sm:px-3">
        <div className="flex flex-wrap gap-2">
          <ScorePill score={score} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">
            <Flame size={14} /> {streak}
          </span>
        </div>
        <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">⏱ {timeLeft}s</div>
      </div>

      <div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 bg-gradient-to-br from-sky-100 via-lavender-100 to-white">
        <div className="absolute left-3 top-3 rounded-full bg-white/60 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-400 backdrop-blur-md">Catch • Move • Repeat</div>
        {Array.from({ length: 13 }).map((_, index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            className="absolute text-lavender-300/50"
            style={{ left: `${5 + (index * 17) % 90}%`, top: `${8 + (index * 23) % 78}%` }}
            animate={{ y: [0, -8, 0], opacity: [0.2, 0.9, 0.2], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2.2 + (index % 3) * 0.45, repeat: Infinity, delay: index * 0.1 }}
          >
            ✦
          </motion.span>
        ))}
        <motion.div className="absolute inset-x-8 bottom-4 h-10 rounded-full bg-white/30 blur-2xl" animate={{ opacity: [0.2, 0.55, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />

        <motion.button
          type="button"
          onClick={catchStar}
          className="absolute flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.75rem] border-2 border-white/90 bg-white/78 text-5xl shadow-[0_20px_55px_rgba(85,74,145,0.18)] backdrop-blur-md focus-visible:ring-4 focus-visible:ring-lavender-300/50"
          style={{ left: `${position.left}%`, top: `${position.top}%` }}
          animate={{ scale: pulse ? 1.22 : [1, 1.07, 1], rotate: pulse ? 10 : [-6, 6, -6] }}
          transition={{ duration: pulse ? 0.16 : 1.45, repeat: pulse ? 0 : Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.14 }}
          whileTap={{ scale: 0.84, rotate: 12 }}
          aria-label="Catch the star"
        >
          ⭐
        </motion.button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/75 bg-white/45 px-3 py-2 backdrop-blur-md">
          <span className="text-[11px] font-display font-bold text-lavender-400">Tip: fast taps build a streak</span>
          <Target size={15} className="text-lavender-400" />
        </div>
      </div>
    </div>
  );
}

function BalloonPop({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [finished, setFinished] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>(() => Array.from({ length: 10 }, (_, index) => makeBalloon(index)));
  const nextId = useRef(10);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setTimeLeft((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (timeLeft !== 0 || finished) return;
    setFinished(true);
    playSuccess(soundOn);
    const stars = score >= 28 ? 3 : score >= 15 ? 2 : score > 0 ? 1 : 0;
    void persistMotionResult('balloon-pop', 'Balloon Pop', score, stars);
  }, [timeLeft, finished, soundOn, score]);

  const pop = (id: number) => {
    if (finished) return;
    setBalloons((value) => value.filter((balloon) => balloon.id !== id));
    const newCombo = combo + 1;
    const bonus = Math.min(Math.floor(newCombo / 2), 4);
    setScore((value) => value + 1 + bonus);
    setCombo(newCombo);
    setBestCombo((value) => Math.max(value, newCombo));
    playTone(soundOn, 420 + Math.min(newCombo, 8) * 48, 0.08, newCombo >= 4 ? 'triangle' : 'sine', 0.06);
    window.setTimeout(() => setBalloons((value) => [...value, makeBalloon(nextId.current++)]), 180);
  };

  const resetCombo = () => setCombo(0);

  const restart = () => {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(20);
    setFinished(false);
    nextId.current = 10;
    setBalloons(Array.from({ length: 10 }, (_, index) => makeBalloon(index)));
  };

  if (finished) {
    const stars = score >= 28 ? 3 : score >= 15 ? 2 : score > 0 ? 1 : 0;
    return <GameResult emoji="🎉" title="Balloon champion!" text={`You popped a sky full of balloons and reached a best combo of ${bestCombo}.`} score={score} stars={stars} onRestart={restart} onDone={onDone} />;
  }

  const hueClasses: Record<Balloon['hue'], string> = {
    pink: 'from-blush-200 to-peach-300',
    yellow: 'from-lemon-200 to-peach-300',
    blue: 'from-sky-200 to-lavender-300',
    mint: 'from-mint-200 to-sky-200',
  };

  const sizeClasses: Record<Balloon['size'], string> = {
    sm: 'h-14 w-12 text-2xl',
    md: 'h-17 w-14 text-3xl',
    lg: 'h-[4.75rem] w-[4rem] text-4xl',
  };

  return (
    <div>
      <MiniHeader emoji="🎈" title="Balloon Pop" subtitle="Pop fast, keep your combo alive, and make every tap count." accent="from-blush-100 to-peach-100" />
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3 sm:px-3">
        <div className="flex flex-wrap gap-2">
          <ScorePill score={score} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">
            <Flame size={14} /> x{combo}
          </span>
        </div>
        <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">⏱ {timeLeft}s</div>
      </div>

      <div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 bg-gradient-to-b from-sky-100 to-white">
        <motion.div className="absolute inset-x-8 bottom-1 h-16 rounded-full bg-sky-200/25 blur-2xl" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2.6, repeat: Infinity }} />
        {balloons.map((balloon) => (
          <motion.button
            key={balloon.id}
            type="button"
            onClick={() => pop(balloon.id)}
            onKeyDown={(event) => {
              if (event.key === ' ') {
                event.preventDefault();
                resetCombo();
              }
            }}
            initial={{ opacity: 0, scale: 0.4, y: 22 }}
            animate={{ opacity: 1, scale: [1, 1.035, 1], x: [0, balloon.drift, 0], y: [10, -12, 10] }}
            transition={{ opacity: { duration: 0.25 }, scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
            exit={{ opacity: 0, scale: 1.55, y: -30, transition: { duration: 0.2 } }}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[50%] border-2 border-white/80 bg-gradient-to-br ${hueClasses[balloon.hue]} ${sizeClasses[balloon.size]} shadow-soft focus-visible:ring-4 focus-visible:ring-lavender-300/50`}
            style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
            whileHover={{ scale: 1.14, rotate: 3 }}
            whileTap={{ scale: 0.74, rotate: -8 }}
            aria-label="Pop balloon"
          >
            <span>{balloon.icon}</span>
          </motion.button>
        ))}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between rounded-2xl border border-white/75 bg-white/50 px-3 py-2 backdrop-blur-md">
          <span className="text-[11px] font-display font-bold text-lavender-400">Each chain adds a bigger bonus</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-display font-bold text-lavender-400"><Sparkles size={13} /> Best: {bestCombo}</span>
        </div>
      </div>
    </div>
  );
}

function FreezeDance({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const TOTAL_ROUNDS = 6;
  const [phase, setPhase] = useState<'ready' | 'move' | 'freeze' | 'done'>('ready');
  const [round, setRound] = useState(0);
  const [goodFreezes, setGoodFreezes] = useState(0);
  const [misses, setMisses] = useState(0);
  const roundRef = useRef(0);
  const freezePressedRef = useRef(false);

  const start = () => {
    roundRef.current = 0;
    freezePressedRef.current = false;
    setRound(0);
    setGoodFreezes(0);
    setMisses(0);
    setPhase('move');
    playTone(soundOn, 392, 0.12, 'triangle');
  };

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') return;
    let timeoutId: number;

    if (phase === 'move') {
      const duration = 1350 + (round % 3) * 170;
      timeoutId = window.setTimeout(() => {
        freezePressedRef.current = false;
        setPhase('freeze');
        playTone(soundOn, 740, 0.18, 'square', 0.05);
      }, duration);
    } else {
      timeoutId = window.setTimeout(() => {
        if (!freezePressedRef.current) {
          setMisses((value) => value + 1);
          playTone(soundOn, 220, 0.12, 'sine', 0.035);
        }
        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        if (nextRound >= TOTAL_ROUNDS) {
          setPhase('done');
          playSuccess(soundOn);
        } else {
          setRound(nextRound);
          setPhase('move');
          playTone(soundOn, 392 + nextRound * 30, 0.1, 'triangle');
        }
      }, 1200);
    }

    return () => window.clearTimeout(timeoutId);
  }, [phase, round, soundOn]);

  useEffect(() => {
    if (phase !== 'done') return;
    const stars = goodFreezes >= 6 ? 3 : goodFreezes >= 4 ? 2 : goodFreezes > 0 ? 1 : 0;
    void persistMotionResult('freeze-dance', 'Freeze Dance', goodFreezes, stars);
  }, [phase, goodFreezes]);

  const markFreeze = () => {
    if (phase !== 'freeze' || freezePressedRef.current) return;
    freezePressedRef.current = true;
    setGoodFreezes((value) => value + 1);
    playTone(soundOn, 880, 0.09, 'triangle', 0.06);
  };

  const restart = () => start();

  if (phase === 'done') {
    const stars = goodFreezes >= 6 ? 3 : goodFreezes >= 4 ? 2 : goodFreezes > 0 ? 1 : 0;
    return <GameResult emoji="🕺" title="Dance complete!" text={`You hit ${goodFreezes} perfect freezes out of ${TOTAL_ROUNDS}. ${misses === 0 ? 'Perfect timing!' : 'Nice try — your timing is getting sharper!'}`} score={goodFreezes} stars={stars} onRestart={restart} onDone={onDone} />;
  }

  return (
    <div>
      <MiniHeader emoji="🪩" title="Freeze Dance" subtitle="Move with the beat. When it stops, freeze right away!" accent="from-mint-100 to-sky-100" />
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3 sm:px-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">
          <Music2 size={14} /> Round {Math.min(round + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
        </span>
        <div className="flex gap-2">
          <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">✅ {goodFreezes}</span>
          <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm">⏭ {misses}</span>
        </div>
      </div>

      <div className={`relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 p-5 transition-colors duration-300 ${phase === 'freeze' ? 'bg-gradient-to-br from-mint-100 via-white to-sky-100' : 'bg-gradient-to-br from-lavender-100 via-sky-100 to-blush-100'}`}>
        <motion.div className="absolute inset-0 opacity-35" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0 2px, transparent 3px), radial-gradient(circle at 70% 65%, rgba(255,255,255,0.8) 0 2px, transparent 3px)', backgroundSize: '90px 90px, 130px 130px' }} />

        {phase === 'ready' && (
          <div className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center text-center">
            <motion.div className="text-6xl" animate={{ rotate: [-7, 7, -7], y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>💃</motion.div>
            <h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">Ready to dance?</h4>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-lavender-400">Follow the dancer while the beat is on, then hit FREEZE before the short freeze window ends.</p>
            <button type="button" onClick={start} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95"><Play size={17} fill="currentColor" /> Start dance</button>
          </div>
        )}

        {phase !== 'ready' && (
          <div className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center text-center">
            <motion.div
              className="text-7xl drop-shadow-sm"
              animate={phase === 'move' ? { y: [0, -20, 0], rotate: [-10, 10, -10], x: [-28, 28, -28] } : { y: 0, rotate: 0, x: 0, scale: 1.05 }}
              transition={{ duration: 0.7, repeat: phase === 'move' ? Infinity : 0, ease: 'easeInOut' }}
            >
              {phase === 'freeze' ? '🧊' : '🕺'}
            </motion.div>
            <motion.p key={phase} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 font-display text-2xl font-bold text-lavender-500">
              {phase === 'move' ? 'MOVE! MOVE! MOVE!' : 'FREEZE! 🧊'}
            </motion.p>
            <p className="mt-1 text-sm text-lavender-400">
              {phase === 'move' ? 'Follow the beat...' : 'Tap FREEZE now!'}
            </p>
            {phase === 'freeze' && (
              <motion.button
                type="button"
                onClick={markFreeze}
                disabled={freezePressedRef.current}
                whileTap={{ scale: 0.9 }}
                className="mt-5 rounded-[1.4rem] border-4 border-white/90 bg-mint-300 px-8 py-4 font-display text-lg font-black text-lavender-500 shadow-[0_15px_35px_rgba(52,193,135,0.22)] transition-transform hover:-translate-y-1 disabled:opacity-70"
              >
                {freezePressedRef.current ? <span className="inline-flex items-center gap-2"><Check size={20} /> Perfect!</span> : 'FREEZE!'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
