import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Music2,
  Play,
  Star,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

type MotionGame = 'star-catcher' | 'balloon-pop' | 'freeze-dance';

type MotionFunSectionProps = {
  onPlayGame?: (gameId: MotionGame) => void;
};

const motionGames: Array<{
  id: MotionGame;
  title: string;
  description: string;
  emoji: string;
  badge: string;
  gradient: string;
}> = [
  {
    id: 'star-catcher',
    title: 'Star Catcher',
    description: 'Tap the dancing stars before they zoom away!',
    emoji: '⭐',
    badge: 'Quick reflexes',
    gradient: 'from-sky-200 via-lavender-200 to-white',
  },
  {
    id: 'balloon-pop',
    title: 'Balloon Pop',
    description: 'Pop the happy balloons and build your combo!',
    emoji: '🎈',
    badge: 'Fast & fun',
    gradient: 'from-blush-200 via-peach-200 to-white',
  },
  {
    id: 'freeze-dance',
    title: 'Freeze Dance',
    description: 'Move with the beat, then freeze when the music stops!',
    emoji: '🕺',
    badge: 'Move & listen',
    gradient: 'from-mint-200 via-sky-200 to-white',
  },
];

function playTone(enabled: boolean, frequency: number, duration = 0.12, type: OscillatorType = 'sine') {
  if (!enabled || typeof window === 'undefined') return;

  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);

  window.setTimeout(() => void context.close(), 500);
}

function playSuccess(enabled: boolean) {
  if (!enabled) return;
  playTone(true, 523.25, 0.1, 'triangle');
  window.setTimeout(() => playTone(true, 659.25, 0.1, 'triangle'), 75);
  window.setTimeout(() => playTone(true, 783.99, 0.15, 'triangle'), 150);
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
      <section aria-labelledby="motion-fun-heading" className="mt-10 overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/45 p-4 shadow-[0_24px_75px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6 lg:p-7">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-gradient-to-br from-sky-100 via-lavender-100 to-blush-100 p-5 sm:p-7">
          <motion.div aria-hidden="true" className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/45 blur-2xl" animate={{ x: [0, -20, 0], y: [0, 18, 0], scale: [1, 1.12, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden="true" className="absolute -bottom-24 left-[24%] h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" animate={{ x: [0, 30, 0], scale: [1, 1.14, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 backdrop-blur-md"><Zap size={14} /> Move &amp; Play</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400"><Music2 size={13} /> Kid-friendly sounds</span>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/70 text-3xl shadow-soft backdrop-blur-md" animate={{ y: [0, -7, 0], rotate: [-4, 4, -4] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>🪩</motion.div>
                <div>
                  <h2 id="motion-fun-heading" className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">Move, tap, listen &amp; play!</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-lavender-400 sm:text-base">A playful corner for active mini-challenges with big motion, tiny surprises, and gentle sound effects designed for kids.</p>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setSoundOn((value) => !value)} className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/80 bg-white/65 px-3.5 py-2.5 text-sm font-display font-bold text-lavender-500 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5 active:scale-95" aria-pressed={soundOn} aria-label={soundOn ? 'Turn game sounds off' : 'Turn game sounds on'}>
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} {soundOn ? 'Sound on' : 'Sound off'}
            </button>
          </div>

          <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-3">
            {motionGames.map((game, index) => (
              <motion.button key={game.id} type="button" onClick={() => openGame(game.id)} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08, duration: 0.4 }} whileHover={{ y: -9, rotate: index === 1 ? 0 : index === 0 ? -1 : 1, scale: 1.012 }} whileTap={{ scale: 0.98 }} className={`group relative overflow-hidden rounded-[1.7rem] border border-white/90 bg-gradient-to-br ${game.gradient} p-4 text-left shadow-soft-lg`}>
                <motion.div aria-hidden="true" className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/35 blur-xl" animate={{ scale: [1, 1.18, 1], rotate: [0, 90, 0] }} transition={{ duration: 6 + index, repeat: Infinity }} />
                <div className="relative flex items-start justify-between gap-3">
                  <motion.div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/70 text-4xl shadow-soft backdrop-blur-md" animate={{ y: [0, -6, 0], rotate: [0, index % 2 === 0 ? 5 : -5, 0] }} transition={{ duration: 2.8 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}>{game.emoji}</motion.div>
                  <span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500 backdrop-blur-md">{game.badge}</span>
                </div>
                <div className="relative mt-5"><h3 className="font-display text-xl font-bold text-lavender-500">{game.title}</h3><p className="mt-1.5 min-h-[2.7rem] text-xs leading-relaxed text-lavender-400">{game.description}</p></div>
                <div className="relative mt-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/55 px-3 py-2.5 backdrop-blur-md"><span className="text-xs font-display font-bold text-lavender-500">Play now</span><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lavender-400 text-white transition-transform group-hover:translate-x-1"><ArrowRight size={15} /></span></div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeGame && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-lavender-950/20 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Motion and fun game">
            <motion.div initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/75 p-3 shadow-[0_35px_120px_rgba(54,45,110,0.24)] backdrop-blur-2xl sm:p-5">
              <button type="button" onClick={() => setActiveGame(null)} className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-lavender-500 shadow-sm transition-transform hover:scale-105 active:scale-95" aria-label="Close game"><X size={18} /></button>
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

function MiniHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return <div className="px-2 pb-3 pt-2 sm:px-4 sm:pt-3"><div className="flex items-center gap-3"><motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-lavender-100 text-2xl" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2.8, repeat: Infinity }}>{emoji}</motion.div><div><h3 className="font-display text-2xl font-bold text-lavender-500">{title}</h3><p className="text-sm text-lavender-400">{subtitle}</p></div></div></div>;
}

function ScorePill({ score }: { score: number }) {
  return <motion.div key={score} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500 shadow-sm"><Star size={14} fill="currentColor" /> {score}</motion.div>;
}

function StarCatcher({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => { if (finished) return; const timer = window.setInterval(() => setTimeLeft((value) => (value > 0 ? value - 1 : 0)), 1000); return () => window.clearInterval(timer); }, [finished]);
  useEffect(() => { if (timeLeft !== 0 || finished) return; setFinished(true); playSuccess(soundOn); }, [timeLeft, finished, soundOn]);

  const catchStar = () => { if (finished) return; setScore((value) => value + 1); setRound((value) => value + 1); playTone(soundOn, 650 + ((round % 4) * 70), 0.1, 'triangle'); };

  return <div><MiniHeader emoji="⭐" title="Star Catcher" subtitle="Catch as many dancing stars as you can in 15 seconds." /><div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 sm:px-4"><ScorePill score={score} /><div className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500">⏱ {timeLeft}s</div></div><div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 bg-gradient-to-br from-sky-100 via-lavender-100 to-white">{[...Array(10)].map((_, index) => <motion.span key={index} aria-hidden="true" className="absolute text-lavender-300/50" style={{ left: `${8 + (index * 13) % 88}%`, top: `${12 + (index * 19) % 72}%` }} animate={{ y: [0, -8, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.2 + (index % 3) * 0.5, repeat: Infinity, delay: index * 0.15 }}>✦</motion.span>)}{finished ? <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-center"><div className="text-6xl">🏆</div><h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">Amazing catch!</h4><p className="mt-1 text-sm text-lavender-400">You caught {score} {score === 1 ? 'star' : 'stars'}.</p><button type="button" onClick={onDone} className="mt-5 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95">Back to games</button></motion.div> : <motion.button type="button" onClick={catchStar} className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.75rem] border-2 border-white/80 bg-white/70 text-5xl shadow-[0_20px_55px_rgba(85,74,145,0.2)] backdrop-blur-md" animate={{ x: [0, 125, -110, 85, -55, 0], y: [0, -65, 70, -35, 50, 0], rotate: [0, 8, -10, 7, -7, 0] }} transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.84, rotate: 12 }} aria-label="Catch the star">⭐</motion.button>}</div></div>;
}

function BalloonPop({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [finished, setFinished] = useState(false);
  const [popped, setPopped] = useState<number[]>([]);

  useEffect(() => { if (finished) return; const timer = window.setInterval(() => setTimeLeft((value) => (value > 0 ? value - 1 : 0)), 1000); return () => window.clearInterval(timer); }, [finished]);
  useEffect(() => { if (timeLeft !== 0 || finished) return; setFinished(true); playSuccess(soundOn); }, [timeLeft, finished, soundOn]);

  const pop = (index: number) => { if (finished || popped.includes(index)) return; setPopped((value) => [...value, index]); setScore((value) => value + 1 + Math.min(combo, 3)); setCombo((value) => value + 1); playTone(soundOn, 420 + index * 35, 0.09, 'sine'); window.setTimeout(() => setPopped((value) => value.filter((item) => item !== index)), 380); };

  return <div><MiniHeader emoji="🎈" title="Balloon Pop" subtitle="Pop the balloons and see how high your combo can fly." /><div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 sm:px-4"><ScorePill score={score} /><div className="flex items-center gap-2"><div className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500">🔥 x{combo}</div><div className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500">⏱ {timeLeft}s</div></div></div><div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 bg-gradient-to-b from-sky-100 to-white">{[...Array(9)].map((_, index) => <AnimatePresence key={index}>{!popped.includes(index) && <motion.button type="button" onClick={() => pop(index)} initial={{ opacity: 0, y: 30, scale: 0.7 }} animate={{ opacity: 1, y: [20, -20, 20], x: [0, (index % 3 - 1) * 12, 0], scale: [1, 1.04, 1] }} exit={{ opacity: 0, scale: 1.5, y: -35 }} transition={{ opacity: { duration: 0.35, delay: index * 0.06 }, y: { duration: 3 + (index % 3) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.06 }, x: { duration: 3.5 + (index % 2) * 0.4, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, exit: { duration: 0.25 } }} className="absolute flex h-16 w-14 items-center justify-center rounded-[50%] border-2 border-white/75 bg-gradient-to-br from-blush-200 to-peach-300 text-3xl shadow-soft" style={{ left: `${7 + (index % 5) * 20}%`, top: `${16 + (index % 4) * 19}%` }} aria-label={`Pop balloon ${index + 1}`}>{index % 3 === 0 ? '🎈' : index % 3 === 1 ? '🎀' : '🟡'}</motion.button>}</AnimatePresence>)}{finished && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/65 text-center backdrop-blur-sm"><motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>🎉</motion.div><h4 className="mt-2 font-display text-2xl font-bold text-lavender-500">Balloon champion!</h4><p className="mt-1 text-sm text-lavender-400">Combo bonus included. Great job!</p><p className="mt-2 font-display text-lg font-bold text-lavender-500">Score: {score}</p><button type="button" onClick={onDone} className="mt-5 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95">Back to games</button></motion.div>}</div></div>;
}

function FreezeDance({ soundOn, onDone }: { soundOn: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'move' | 'freeze' | 'done'>('ready');
  const [round, setRound] = useState(0);
  const [goodFreezes, setGoodFreezes] = useState(0);
  const roundRef = useRef(0);

  const start = () => { roundRef.current = 0; setRound(0); setGoodFreezes(0); setPhase('move'); playTone(soundOn, 392, 0.12, 'triangle'); };

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') return;
    let timeoutId: number;
    if (phase === 'move') {
      timeoutId = window.setTimeout(() => { setPhase('freeze'); playTone(soundOn, 740, 0.18, 'square'); }, 1600);
    } else {
      timeoutId = window.setTimeout(() => { const nextRound = roundRef.current + 1; roundRef.current = nextRound; if (nextRound >= 5) { setPhase('done'); playSuccess(soundOn); } else { setRound(nextRound); setPhase('move'); playTone(soundOn, 392 + nextRound * 35, 0.1, 'triangle'); } }, 1150);
    }
    return () => window.clearTimeout(timeoutId);
  }, [phase, soundOn]);

  const markFreeze = () => { if (phase !== 'freeze') return; setGoodFreezes((value) => value + 1); playTone(soundOn, 880, 0.09, 'triangle'); };

  return <div><MiniHeader emoji="🪩" title="Freeze Dance" subtitle="Move while the beat is on — tap FREEZE when it stops." /><div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 sm:px-4"><div className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500">Round {Math.min(round + 1, 5)} / 5</div><div className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-display font-bold text-lavender-500">❄️ {goodFreezes} freezes</div></div><div className={`relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/80 p-5 transition-colors duration-300 ${phase === 'freeze' ? 'bg-gradient-to-br from-mint-100 via-white to-sky-100' : 'bg-gradient-to-br from-lavender-100 via-sky-100 to-blush-100'}`}><motion.div className="absolute inset-0 opacity-35" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0 2px, transparent 3px), radial-gradient(circle at 70% 65%, rgba(255,255,255,0.8) 0 2px, transparent 3px)', backgroundSize: '90px 90px, 130px 130px' }} />
    {phase === 'ready' && <div className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center text-center"><motion.div className="text-6xl" animate={{ rotate: [-7, 7, -7], y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>💃</motion.div><h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">Ready to dance?</h4><p className="mt-1 max-w-sm text-sm text-lavender-400">Follow the moving character, then hit FREEZE when the beat stops.</p><button type="button" onClick={start} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95"><Play size={17} fill="currentColor" /> Start</button></div>}
    {phase !== 'ready' && phase !== 'done' && <div className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center text-center"><motion.div className="text-7xl" animate={phase === 'move' ? { y: [0, -20, 0], rotate: [-10, 10, -10], x: [-22, 22, -22] } : { y: 0, rotate: 0, x: 0, scale: 1.04 }} transition={{ duration: 0.72, repeat: phase === 'move' ? Infinity : 0, ease: 'easeInOut' }}>🕺</motion.div><motion.p key={phase} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 font-display text-2xl font-bold text-lavender-500">{phase === 'move' ? 'MOVE! MOVE! MOVE!' : 'FREEZE! 🧊'}</motion.p><p className="mt-1 text-sm text-lavender-400">{phase === 'move' ? 'Follow the beat.' : 'Tap the button when you freeze.'}</p>{phase === 'freeze' && <motion.button type="button" onClick={markFreeze} whileTap={{ scale: 0.9 }} className="mt-5 rounded-[1.4rem] border-4 border-white/80 bg-mint-300 px-7 py-4 font-display text-lg font-black text-lavender-500 shadow-[0_15px_35px_rgba(52,193,135,0.22)]">FREEZE!</motion.button>}</div>}
    {phase === 'done' && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex min-h-[20rem] flex-col items-center justify-center text-center"><div className="text-6xl">🏆</div><h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">Dance complete!</h4><p className="mt-1 text-sm text-lavender-400">You nailed {goodFreezes} out of 5 freezes.</p><button type="button" onClick={onDone} className="mt-5 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95">Back to games</button></motion.div>}
  </div></div>;
}
