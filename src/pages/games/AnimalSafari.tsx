import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Animal = { emoji: string; name: string; sound: string; fact: string; habitat: string };

const ANIMALS: Animal[] = [
  { emoji: '🦁', name: 'Lion', sound: 'Roar!', fact: 'Lions live in groups called prides.', habitat: 'Savanna' },
  { emoji: '🐘', name: 'Elephant', sound: 'Trumpet!', fact: 'Elephants are the largest land animals.', habitat: 'Savanna' },
  { emoji: '🐧', name: 'Penguin', sound: 'Squawk!', fact: 'Penguins can swim but cannot fly.', habitat: 'Antarctica' },
  { emoji: '🦒', name: 'Giraffe', sound: 'Hum!', fact: 'Giraffes have the longest necks of any animal.', habitat: 'Savanna' },
  { emoji: '🐬', name: 'Dolphin', sound: 'Click!', fact: 'Dolphins are very smart and love to play.', habitat: 'Ocean' },
  { emoji: '🦘', name: 'Kangaroo', sound: 'Chortle!', fact: 'Baby kangaroos live in their mother\'s pouch.', habitat: 'Outback' },
  { emoji: '🦉', name: 'Owl', sound: 'Hoot!', fact: 'Owls can turn their heads almost all the way around.', habitat: 'Forest' },
  { emoji: '🐸', name: 'Frog', sound: 'Ribbit!', fact: 'Frogs can jump 20 times their body length.', habitat: 'Pond' },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export default function AnimalSafari({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(6);
  const [animal, setAnimal] = useState<Animal>(() => ANIMALS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showInfo, setShowInfo] = useState(false);

  const startRound = useCallback((r: number, total: number) => {
    const shuffled = shuffle(ANIMALS);
    const next = shuffled[0];
    setAnimal(next);
    const wrongNames = shuffle(ANIMALS.filter((a) => a.name !== next.name)).slice(0, 3).map((a) => a.name);
    setOptions(shuffle([next.name, ...wrongNames]));
    setSelected(null);
    setShowInfo(false);
    setRound(r);
    setTotalRounds(total);
  }, []);

  const reset = useCallback((total: number) => {
    setScore(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    startRound(1, total);
  }, [startRound]);

  useEffect(() => {
    startRound(1, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleSelect = (name: string) => {
    if (selected || status !== 'playing') return;
    setSelected(name);
    if (name === animal.name) {
      setScore((s) => s + 1);
      setShowInfo(true);
      setTimeout(() => {
        if (round >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          startRound(round + 1, totalRounds);
        }
      }, 1800);
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => {
        if (lives > 1) startRound(round, totalRounds);
      }, 1200);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Animal Safari"
      gradient="from-mint-200 to-lemon-200"
      emoji="🦁"
      onClose={onClose}
      onRestart={() => reset(6)}
      status={status}
      stars={stars}
      winMessage="Safari Champion!"
      winDetail={`You discovered ${score} animals in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <p className="font-display text-lg text-lavender-500 mb-3">Which animal is this?</p>

        {/* Animal display */}
        <motion.div
          key={round}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="relative inline-block mb-5"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-8xl drop-shadow-lg"
          >
            {animal.emoji}
          </motion.div>
          {/* Habitat badge */}
          <div className="absolute -top-2 -left-6 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-display font-bold text-mint-500 shadow-soft">
            {animal.habitat}
          </div>
          <button
            onClick={() => speak(`${animal.name}. ${animal.sound} ${animal.fact}`)}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-sky-300 text-white flex items-center justify-center shadow-soft hover:bg-sky-400 active:scale-90 transition-colors"
            aria-label="Listen"
          >
            <Volume2 size={18} />
          </button>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {options.map((opt) => {
            const isCorrect = opt === animal.name;
            const isSelected = opt === selected;
            let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50 hover:border-lavender-200';
            if (selected === opt && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500 shadow-soft';
            else if (selected === opt && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
            else if (selected && isCorrect) style = 'bg-mint-100 border-mint-300 text-mint-400';
            return (
              <motion.button
                key={opt}
                whileHover={!selected ? { scale: 1.04, y: -3 } : {}}
                whileTap={!selected ? { scale: 0.96 } : {}}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`p-4 rounded-2xl border-2 font-display font-semibold text-lg transition-all ${style}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Info card on correct answer */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 p-4 rounded-2xl bg-mint-50 border-2 border-mint-200 max-w-sm mx-auto"
            >
              <p className="font-display font-bold text-mint-500 text-lg">{animal.name} — {animal.sound}</p>
              <p className="text-sm text-lavender-400 mt-1">{animal.fact}</p>
              <p className="text-xs text-mint-400 font-semibold mt-1.5">Home: {animal.habitat}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
