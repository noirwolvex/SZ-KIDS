import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Globe } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Country = { flag: string; name: string; continent: string };

const COUNTRIES: Country[] = [
  { flag: '🇺🇸', name: 'USA', continent: 'North America' },
  { flag: '🇫🇷', name: 'France', continent: 'Europe' },
  { flag: '🇯🇵', name: 'Japan', continent: 'Asia' },
  { flag: '🇧🇷', name: 'Brazil', continent: 'South America' },
  { flag: '🇦🇺', name: 'Australia', continent: 'Oceania' },
  { flag: '🇪🇬', name: 'Egypt', continent: 'Africa' },
  { flag: '🇨🇦', name: 'Canada', continent: 'North America' },
  { flag: '🇮🇹', name: 'Italy', continent: 'Europe' },
  { flag: '🇮🇳', name: 'India', continent: 'Asia' },
  { flag: '🇲🇽', name: 'Mexico', continent: 'North America' },
  { flag: '🇿🇦', name: 'South Africa', continent: 'Africa' },
  { flag: '🇪🇸', name: 'Spain', continent: 'Europe' },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export default function GlobeTrotter({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(8);
  const [country, setCountry] = useState<Country>(() => COUNTRIES[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showInfo, setShowInfo] = useState(false);

  const startRound = useCallback((r: number) => {
    const c = shuffle(COUNTRIES)[0];
    setCountry(c);
    const wrong = shuffle(COUNTRIES.filter((x) => x.name !== c.name)).slice(0, 3).map((x) => x.name);
    setOptions(shuffle([c.name, ...wrong]));
    setSelected(null);
    setShowInfo(false);
    setRound(r);
  }, []);

  const reset = useCallback(() => {
    setScore(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    startRound(1);
  }, [startRound]);

  useEffect(() => {
    startRound(1);
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
    if (name === country.name) {
      setScore((s) => s + 1);
      setShowInfo(true);
      setTimeout(() => {
        if (round >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          startRound(round + 1);
        }
      }, 1800);
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => {
        if (lives > 1) startRound(round);
      }, 1200);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Globe Trotter"
      gradient="from-sky-200 to-mint-200"
      emoji="🌍"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="World Traveler!"
      winDetail={`You identified ${score} flags in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <p className="font-display text-lg text-lavender-500 mb-4">Which country does this flag belong to?</p>

        {/* Flag display */}
        <motion.div
          key={round}
          initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 200, duration: 0.6 }}
          className="inline-block mb-5"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl drop-shadow-lg"
            >
              {country.flag}
            </motion.div>
            {/* Flag pole shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-lavender-200/50 blur-sm" />
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {options.map((opt) => {
            const isCorrect = opt === country.name;
            let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50 hover:border-lavender-200';
            if (selected === opt && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500 shadow-glow';
            else if (selected === opt && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
            else if (selected && isCorrect) style = 'bg-mint-100 border-mint-300 text-mint-400';
            return (
              <motion.button
                key={opt}
                whileHover={!selected ? { scale: 1.03, y: -2 } : {}}
                whileTap={!selected ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`relative p-4 rounded-2xl border-2 font-display font-semibold text-lg transition-colors ${style}`}
              >
                {opt}
                {selected === opt && isCorrect && <Check size={16} className="absolute top-2 right-2 text-mint-500" />}
                {selected === opt && !isCorrect && <XIcon size={16} className="absolute top-2 right-2 text-blush-500" />}
              </motion.button>
            );
          })}
        </div>

        {/* Info card */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 max-w-sm mx-auto flex items-center gap-3"
            >
              <Globe size={24} className="text-sky-500" />
              <div className="text-left">
                <p className="font-display font-bold text-sky-500">{country.name}</p>
                <p className="text-sm text-lavender-400">Continent: {country.continent}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
