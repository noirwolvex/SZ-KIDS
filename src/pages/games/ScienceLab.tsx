import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Check, X as XIcon } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Potion = { emoji: string; name: string; color: string; bg: string };

const POTIONS: Potion[] = [
  { emoji: '🔴', name: 'Red', color: '#ff7fbf', bg: 'bg-blush-200' },
  { emoji: '🟡', name: 'Yellow', color: '#ffd24d', bg: 'bg-lemon-200' },
  { emoji: '🟢', name: 'Green', color: '#34c187', bg: 'bg-mint-200' },
  { emoji: '🔵', name: 'Blue', color: '#38bdf8', bg: 'bg-sky-200' },
  { emoji: '🟣', name: 'Purple', color: '#9d7ce6', bg: 'bg-lavender-200' },
  { emoji: '🟠', name: 'Orange', color: '#ff8f63', bg: 'bg-peach-200' },
];

type Recipe = { target: string; targetName: string; ingredients: string[] };

const RECIPES: Recipe[] = [
  { target: '🟠', targetName: 'Orange', ingredients: ['🔴', '🟡'] },
  { target: '🟢', targetName: 'Green', ingredients: ['🟡', '🔵'] },
  { target: '🟣', targetName: 'Purple', ingredients: ['🔴', '🔵'] },
  { target: '🟠', targetName: 'Orange', ingredients: ['🔴', '🟡'] },
  { target: '🟢', targetName: 'Green', ingredients: ['🟡', '🔵'] },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export default function ScienceLab({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [recipe, setRecipe] = useState<Recipe>(() => RECIPES[0]);
  const [cauldron, setCauldron] = useState<string[]>([]);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [bubbling, setBubbling] = useState(false);

  const startRound = useCallback((r: number) => {
    const rec = shuffle(RECIPES)[0];
    setRecipe(rec);
    setCauldron([]);
    setFeedback(null);
    setBubbling(false);
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
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const addIngredient = (emoji: string) => {
    if (cauldron.length >= 2 || status !== 'playing') return;
    const nc = [...cauldron, emoji];
    setCauldron(nc);
    setBubbling(true);
    if (nc.length === 2) {
      // Check
      const sortedCauldron = [...nc].sort();
      const sortedRecipe = [...recipe.ingredients].sort();
      if (sortedCauldron.join('') === sortedRecipe.join('')) {
        setFeedback('correct');
        setTimeout(() => {
          if (round >= totalRounds) {
            setStatus('won');
            setRunning(false);
            onWin(computeStars(lives, 3));
          } else {
            startRound(round + 1);
          }
        }, 1200);
      } else {
        setFeedback('wrong');
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) { setStatus('lost'); setRunning(false); }
          return nl;
        });
        setTimeout(() => {
          setCauldron([]);
          setFeedback(null);
          setBubbling(false);
        }, 1000);
      }
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Science Lab"
      gradient="from-lemon-200 to-mint-200"
      emoji="🧪"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Master Scientist!"
      winDetail={`You mixed ${totalRounds} potions perfectly in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <p className="font-display text-lg text-lavender-500 mb-2">Mix potions to create:</p>
        <motion.div
          key={round}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-3xl bg-white shadow-soft mb-5"
        >
          <span className="text-4xl">{recipe.target}</span>
          <span className="font-display font-bold text-xl text-lavender-500">{recipe.targetName}</span>
        </motion.div>

        {/* Cauldron */}
        <div className={`relative mx-auto w-40 h-40 rounded-full mb-5 flex items-center justify-center transition-all overflow-hidden ${
          feedback === 'correct' ? 'bg-mint-200 shadow-glow' :
          feedback === 'wrong' ? 'bg-blush-200' :
          cauldron.length > 0 ? 'bg-lavender-100 shadow-soft' : 'bg-lavender-50'
        }`}>
          {/* Liquid surface effect */}
          {cauldron.length > 0 && !feedback && (
            <motion.div
              className="absolute inset-0 bg-lavender-200/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          <motion.div
            animate={bubbling ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: bubbling ? Infinity : 0 }}
            className="text-6xl"
          >
            {feedback === 'correct' ? recipe.target :
             feedback === 'wrong' ? '💥' :
             cauldron.length === 0 ? '⚗️' :
             cauldron.join('')}
          </motion.div>
          {bubbling && [...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg"
              initial={{ y: 0, opacity: 0.8 }}
              animate={{ y: -40, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              style={{ left: `${30 + i * 20}%`, top: '30%' }}
            >
              {['💧', '✨', '🫧'][i]}
            </motion.div>
          ))}
        </div>

        {/* Ingredient shelf */}
        <p className="text-sm font-display font-semibold text-lavender-400 mb-3">Pick two ingredients:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {POTIONS.map((p) => (
            <motion.button
              key={p.name}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addIngredient(p.emoji)}
              disabled={cauldron.length >= 2 || status !== 'playing'}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl ${p.bg} shadow-soft transition-all hover:shadow-glow hover:-translate-y-1 ${
                cauldron.length >= 2 ? 'opacity-40' : ''
              }`}
            >
              <span className="text-3xl">{p.emoji}</span>
              <span className="text-xs font-display font-semibold text-lavender-500">{p.name}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold ${
                feedback === 'correct' ? 'bg-mint-100 text-mint-500' : 'bg-blush-100 text-blush-500'
              }`}
            >
              {feedback === 'correct' ? <><Check size={18} /> Perfect mixture!</> : <><XIcon size={18} /> Wrong recipe! Try again.</>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
