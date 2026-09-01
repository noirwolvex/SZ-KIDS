import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check, X as XIcon } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type WordEntry = { word: string; emoji: string; hint: string };

const WORDS: WordEntry[] = [
  { word: 'CAT', emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'SUN', emoji: '☀️', hint: 'It lights up our day' },
  { word: 'DOG', emoji: '🐶', hint: 'A loyal furry friend' },
  { word: 'BUS', emoji: '🚌', hint: 'It takes you to school' },
  { word: 'HAT', emoji: '🎩', hint: 'You wear it on your head' },
  { word: 'BEE', emoji: '🐝', hint: 'It makes honey and buzzes' },
  { word: 'OWL', emoji: '🦉', hint: 'A bird that is awake at night' },
  { word: 'FOX', emoji: '🦊', hint: 'A clever orange animal' },
  { word: 'PIG', emoji: '🐷', hint: 'A pink farm animal that oinks' },
  { word: 'COW', emoji: '🐮', hint: 'It gives us milk' },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export default function WordWizard({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(6);
  const [entry, setEntry] = useState<WordEntry>(() => WORDS[0]);
  const [letters, setLetters] = useState<{ char: string; id: number }[]>([]);
  const [slots, setSlots] = useState<(typeof letters)[number][]>([]);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startRound = useCallback((r: number) => {
    const e = shuffle(WORDS)[0];
    setEntry(e);
    const chars = e.word.split('').map((char, id) => ({ char, id }));
    setLetters(shuffle(chars));
    setSlots([]);
    setShowHint(false);
    setFeedback(null);
    setRound(r);
  }, []);

  const reset = useCallback(() => {
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

  const placeLetter = (letter: { char: string; id: number }) => {
    if (status !== 'playing') return;
    setLetters((l) => l.filter((x) => x.id !== letter.id));
    setSlots((s) => [...s, letter]);
  };

  const removeLetter = (idx: number) => {
    if (status !== 'playing') return;
    const removed = slots[idx];
    setSlots((s) => s.filter((_, i) => i !== idx));
    setLetters((l) => [...l, removed]);
  };

  const checkWord = () => {
    const guess = slots.map((s) => s.char).join('');
    if (guess === entry.word) {
      setFeedback('correct');
      setTimeout(() => {
        if (round >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          startRound(round + 1);
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => {
        setFeedback(null);
        // Return all letters to pool
        setLetters((l) => shuffle([...l, ...slots]));
        setSlots([]);
      }, 800);
    }
  };

  const stars = computeStars(lives, 3);
  const isComplete = slots.length === entry.word.length;

  return (
    <GameShell
      title="Word Wizard"
      gradient="from-sky-200 to-mint-200"
      emoji="🔤"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Word Wizard!"
      winDetail={`You spelled ${totalRounds} words in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <motion.div
          key={round}
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative inline-block mb-3"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-sky-200/40 blur-2xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="relative text-7xl drop-shadow-lg">{entry.emoji}</span>
        </motion.div>
        <p className="font-display text-lg text-lavender-500 mb-1">Spell this word!</p>

        <button
          onClick={() => setShowHint(!showHint)}
          className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-lemon-500 hover:text-lemon-400 mb-4"
        >
          <Lightbulb size={16} /> {showHint ? entry.hint : 'Need a hint?'}
        </button>

        {/* Slots */}
        <div className="flex justify-center gap-2 mb-6">
          {entry.word.split('').map((_, i) => {
            const letter = slots[i];
            return (
              <motion.button
                key={i}
                onClick={() => letter && removeLetter(i)}
                whileHover={letter ? { scale: 1.05 } : {}}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-display font-bold transition-all ${
                  feedback === 'correct' ? 'bg-mint-200 border-mint-400 text-mint-500 shadow-glow' :
                  feedback === 'wrong' ? 'bg-blush-200 border-blush-400 text-blush-500 animate-wiggle' :
                  letter ? 'bg-sky-100 border-sky-300 text-lavender-500 shadow-soft' : 'border-lavender-200 bg-lavender-50'
                }`}
              >
                {letter?.char || ''}
              </motion.button>
            );
          })}
        </div>

        {/* Letter pool */}
        <div className="flex flex-wrap justify-center gap-2 min-h-[60px] mb-4">
          <AnimatePresence>
            {letters.map((letter) => (
              <motion.button
                key={letter.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => placeLetter(letter)}
                className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-xl font-display font-bold text-lavender-500 hover:shadow-glow hover:bg-sky-50 transition-all"
              >
                {letter.char}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Check button */}
        <motion.button
          whileHover={isComplete ? { scale: 1.05 } : {}}
          whileTap={isComplete ? { scale: 0.95 } : {}}
          onClick={checkWord}
          disabled={!isComplete}
          className={`px-8 py-3 rounded-2xl font-display font-bold text-white transition-all ${
            isComplete ? 'bg-gradient-to-r from-mint-300 to-mint-400 shadow-soft' : 'bg-lavender-200 opacity-50'
          }`}
        >
          {feedback === 'correct' ? <Check size={20} className="inline" /> : feedback === 'wrong' ? <XIcon size={20} className="inline" /> : 'Check!'}
        </motion.button>
      </div>
    </GameShell>
  );
}
