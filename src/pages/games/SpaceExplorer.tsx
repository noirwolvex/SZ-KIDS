import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Planet = { emoji: string; name: string; color: string; fact: string; order: number };

const PLANETS: Planet[] = [
  { emoji: '☀️', name: 'Sun', color: 'from-lemon-200 to-peach-200', fact: 'The Sun is a star at the center of our solar system.', order: 0 },
  { emoji: '☿️', name: 'Mercury', color: 'from-sky-200 to-lavender-200', fact: 'Mercury is the smallest and closest planet to the Sun.', order: 1 },
  { emoji: '♀️', name: 'Venus', color: 'from-peach-200 to-lemon-200', fact: 'Venus is the hottest planet in our solar system.', order: 2 },
  { emoji: '🌍', name: 'Earth', color: 'from-sky-200 to-mint-200', fact: 'Earth is the only planet known to have life!', order: 3 },
  { emoji: '🔴', name: 'Mars', color: 'from-blush-200 to-peach-200', fact: 'Mars is called the Red Planet because of its color.', order: 4 },
  { emoji: '🪐', name: 'Jupiter', color: 'from-peach-200 to-lemon-200', fact: 'Jupiter is the largest planet in our solar system.', order: 5 },
  { emoji: '🟡', name: 'Saturn', color: 'from-lemon-200 to-peach-200', fact: 'Saturn has beautiful rings made of ice and rock.', order: 6 },
  { emoji: '🔵', name: 'Uranus', color: 'from-sky-200 to-lavender-200', fact: 'Uranus rotates on its side like a rolling ball.', order: 7 },
  { emoji: '🌀', name: 'Neptune', color: 'from-sky-200 to-lavender-300', fact: 'Neptune is the windiest planet with giant storms.', order: 8 },
];

type Phase = 'learn' | 'quiz' | 'order';


export default function SpaceExplorer({ onClose, onWin }: GameProps) {
  const [phase, setPhase] = useState<Phase>('learn');
  const [learnIdx, setLearnIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [orderSlots, setOrderSlots] = useState<(string | null)[]>([]);
  const [orderPool, setOrderPool] = useState<string[]>([]);
  const [orderSelected, setOrderSelected] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase('learn');
    setLearnIdx(0);
    setQuizIdx(0);
    setScore(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Start quiz phase
  const startQuiz = useCallback(() => {
    setPhase('quiz');
    setQuizIdx(0);
    setSelected(null);
    const planet = PLANETS[0];
    const wrong = shuffleArr(PLANETS.filter((p) => p.name !== planet.name)).slice(0, 3).map((p) => p.name);
    setQuizOptions(shuffleArr([planet.name, ...wrong]));
  }, []);

  const nextQuiz = useCallback((idx: number) => {
    if (idx + 1 >= PLANETS.length) {
      // Move to ordering phase
      const pool = shuffleArr(PLANETS.slice(1, 9).map((p) => p.name));
      setOrderPool(pool);
      setOrderSlots(new Array(8).fill(null));
      setPhase('order');
      return;
    }
    const planet = PLANETS[idx + 1];
    const wrong = shuffleArr(PLANETS.filter((p) => p.name !== planet.name)).slice(0, 3).map((p) => p.name);
    setQuizOptions(shuffleArr([planet.name, ...wrong]));
    setQuizIdx(idx + 1);
    setSelected(null);
  }, []);

  const handleQuizSelect = (name: string) => {
    if (selected || status !== 'playing') return;
    setSelected(name);
    const correct = PLANETS[quizIdx].name;
    if (name === correct) {
      setScore((s) => s + 1);
      setTimeout(() => nextQuiz(quizIdx), 1000);
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => {
        if (lives > 1) nextQuiz(quizIdx);
      }, 1200);
    }
  };

  // Ordering phase
  const placePlanet = (slotIdx: number) => {
    if (!orderSelected || status !== 'playing') return;
    const planet = orderSelected;
    const correctIdx = PLANETS.find((p) => p.name === planet)!.order - 1;
    if (slotIdx === correctIdx) {
      const ns = [...orderSlots];
      ns[slotIdx] = planet;
      setOrderSlots(ns);
      setOrderPool((p) => p.filter((n) => n !== planet));
      setOrderSelected(null);
      if (ns.every((s) => s !== null)) {
        setStatus('won');
        setRunning(false);
        onWin(computeStars(lives, 3));
      }
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setOrderSelected(null);
    }
  };

  const stars = computeStars(lives, 3);

  // LEARN PHASE
  if (phase === 'learn') {
    const planet = PLANETS[learnIdx];
    return (
      <GameShell
        title="Space Explorer"
        gradient="from-lavender-200 to-sky-300"
        emoji="🚀"
        onClose={onClose}
        onRestart={reset}
        status="playing"
        stars={0}
        stats={[{ icon: 'star', value: `Planet ${learnIdx + 1}/${PLANETS.length}`, color: 'text-lemon-500' }]}
      >
        <div className="text-center">
          <motion.div
            key={learnIdx}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring' }}
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${planet.color} mb-4 relative`}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <span className="text-6xl">{planet.emoji}</span>
            </motion.div>
            {/* orbit dots */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30" />
          </motion.div>
          <h3 className="font-display text-2xl font-bold text-lavender-500">{planet.name}</h3>
          <p className="text-lavender-400 mt-2 max-w-xs mx-auto">{planet.fact}</p>
          <div className="flex gap-3 justify-center mt-6">
            {learnIdx > 0 && (
              <button onClick={() => setLearnIdx((i) => i - 1)} className="px-5 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-semibold">
                ← Back
              </button>
            )}
            {learnIdx < PLANETS.length - 1 ? (
              <button onClick={() => setLearnIdx((i) => i + 1)} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-semibold shadow-soft">
                Next Planet →
              </button>
            ) : (
              <button onClick={startQuiz} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-mint-300 to-mint-400 text-white font-display font-semibold shadow-soft">
                Start Quiz! 🚀
              </button>
            )}
          </div>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {PLANETS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === learnIdx ? 'bg-lavender-400' : i < learnIdx ? 'bg-mint-300' : 'bg-lavender-100'}`} />
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ORDER PHASE
  if (phase === 'order') {
    return (
      <GameShell
        title="Space Explorer"
        gradient="from-lavender-200 to-sky-300"
        emoji="🚀"
        onClose={onClose}
        onRestart={reset}
        status={status}
        stars={stars}
        winMessage="Space Commander!"
        winDetail={`You ordered all 8 planets from the Sun! Time: ${formatTime(time)}`}
        stats={[
          { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
          { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
        ]}
      >
        <div className="text-center">
          <p className="font-display text-lg text-lavender-500 mb-2">Order the planets from the Sun!</p>
          <p className="text-sm text-lavender-400 mb-5">Pick a planet, then tap the correct spot.</p>

          {/* Sun + slots */}
          <div className="flex items-center justify-center gap-1 mb-6 overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-3xl">☀️</span>
              <span className="text-[10px] font-semibold text-lemon-500">Sun</span>
            </div>
            {orderSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <span className="text-lavender-200">→</span>
                <button
                  onClick={() => placePlanet(i)}
                  disabled={!orderSelected || slot !== null}
                  className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center text-2xl transition-all ${
                    slot ? 'bg-mint-100 border-mint-400' :
                    orderSelected ? 'border-sky-400 bg-sky-50 hover:scale-105' :
                    'border-lavender-200 bg-lavender-50'
                  }`}
                >
                  {slot ? PLANETS.find((p) => p.name === slot)?.emoji : i + 1}
                </button>
              </div>
            ))}
          </div>

          {/* Pool */}
          <div className="border-t-2 border-lavender-100 pt-4">
            <p className="text-sm font-display font-semibold text-lavender-400 mb-3">Available planets</p>
            <div className="flex flex-wrap justify-center gap-2">
              {orderPool.map((name) => {
                const p = PLANETS.find((pl) => pl.name === name)!;
                return (
                  <motion.button
                    key={name}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOrderSelected(name)}
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all ${
                      orderSelected === name ? 'bg-sky-200 ring-2 ring-sky-400' : 'bg-white shadow-soft'
                    }`}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="text-[10px] font-semibold text-lavender-500">{p.name}</span>
                  </motion.button>
                );
              })}
            </div>
            {orderSelected && (
              <p className="text-sm text-sky-500 font-display font-semibold mt-3">
                Tap a spot to place {orderSelected}!
              </p>
            )}
          </div>
        </div>
      </GameShell>
    );
  }

  // QUIZ PHASE
  const planet = PLANETS[quizIdx];
  return (
    <GameShell
      title="Space Explorer"
      gradient="from-lavender-200 to-sky-300"
      emoji="🚀"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Almost there!"
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${quizIdx + 1}/${PLANETS.length}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <p className="font-display text-lg text-lavender-500 mb-4">Which planet is this?</p>
        <motion.div
          key={quizIdx}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${planet.color} mb-4`}
        >
          <span className="text-5xl">{planet.emoji}</span>
        </motion.div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {quizOptions.map((opt) => {
            const isCorrect = opt === planet.name;
            let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50';
            if (selected === opt && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500';
            else if (selected === opt && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
            return (
              <motion.button
                key={opt}
                whileHover={!selected ? { scale: 1.03 } : {}}
                whileTap={!selected ? { scale: 0.97 } : {}}
                onClick={() => handleQuizSelect(opt)}
                disabled={!!selected}
                className={`relative p-3 rounded-2xl border-2 font-display font-semibold transition-colors ${style}`}
              >
                {opt}
                {selected === opt && isCorrect && <Check size={16} className="absolute top-2 right-2 text-mint-500" />}
                {selected === opt && !isCorrect && <XIcon size={16} className="absolute top-2 right-2 text-blush-500" />}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {selected === planet.name && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-mint-500 mt-4">
              Correct! {planet.fact}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
