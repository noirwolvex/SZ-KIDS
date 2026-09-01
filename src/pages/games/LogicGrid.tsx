import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Lightbulb } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Puzzle = {
  theme: string;
  people: string[];
  items: string[];
  /** solution[personIndex] = itemIndex */
  solution: number[];
  clues: string[];
};

const PUZZLES: Puzzle[] = [
  {
    theme: 'Pets 🐾',
    people: ['Ana', 'Ben', 'Cleo'],
    items: ['🐱 Cat', '🐶 Dog', '🐰 Rabbit'],
    solution: [2, 0, 1],
    clues: ['Ana is allergic to cats and does not own a dog.', 'Ben owns the cat.', 'Cleo does not own the rabbit.'],
  },
  {
    theme: 'Fruits 🍎',
    people: ['Dev', 'Eve', 'Finn'],
    items: ['🍎 Apple', '🍌 Banana', '🍇 Grapes'],
    solution: [1, 2, 0],
    clues: ['Dev did not bring the apple.', 'Eve loves purple food.', 'Finn brought the apple.'],
  },
  {
    theme: 'Sports ⚽',
    people: ['Gus', 'Hana', 'Iris'],
    items: ['⚽ Soccer', '🏀 Basketball', '🎾 Tennis'],
    solution: [0, 2, 1],
    clues: ['Gus plays the sport with a round ball you kick.', 'Hana does not play basketball.', 'Iris plays the sport with a hoop.'],
  },
  {
    theme: 'Cities 🏙️',
    people: ['Jax', 'Kai', 'Lia'],
    items: ['🗼 Paris', '🇯🇵 Tokyo', '🇮🇹 Rome'],
    solution: [2, 1, 0],
    clues: ['Jax visited the city of the Colosseum.', 'Kai went to the city in Japan.', 'Lia visited the Eiffel Tower city.'],
  },
  {
    theme: 'Instruments 🎵',
    people: ['Mia', 'Noah', 'Owen'],
    items: ['🎸 Guitar', '🎹 Piano', '🥁 Drums'],
    solution: [1, 2, 0],
    clues: ['Mia plays an instrument with keys.', 'Noah plays the loudest rhythm instrument.', 'Owen plays an instrument with strings.'],
  },
];


export default function LogicGrid({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(1);
  const totalRounds = PUZZLES.length;
  const [puzzle, setPuzzle] = useState<Puzzle>(() => PUZZLES[0]);
  const [guess, setGuess] = useState<(number | null)[]>(() => [null, null, null]);
  const [usedItems, setUsedItems] = useState<Set<number>>(() => new Set());
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activePerson, setActivePerson] = useState(0);
  const [showClue, setShowClue] = useState(false);

  const startRound = useCallback((r: number) => {
    const p = PUZZLES[(r - 1) % PUZZLES.length];
    setPuzzle(p);
    setGuess(new Array(p.people.length).fill(null));
    setUsedItems(new Set());
    setFeedback(null);
    setShowClue(false);
    setActivePerson(0);
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

  const assign = (personIdx: number, itemIdx: number) => {
    if (status !== 'playing' || feedback) return;
    setGuess((g) => {
      const ng = [...g];
      // free up previously held item
      if (ng[personIdx] !== null) {
        setUsedItems((u) => { const nu = new Set(u); nu.delete(ng[personIdx] as number); return nu; });
      }
      ng[personIdx] = itemIdx;
      return ng;
    });
    setUsedItems((u) => { const nu = new Set(u); nu.add(itemIdx); return nu; });
  };

  const clearCell = (personIdx: number) => {
    if (status !== 'playing' || feedback) return;
    setGuess((g) => {
      const ng = [...g];
      if (ng[personIdx] !== null) {
        setUsedItems((u) => { const nu = new Set(u); nu.delete(ng[personIdx] as number); return nu; });
      }
      ng[personIdx] = null;
      return ng;
    });
  };

  const check = () => {
    if (guess.some((g) => g === null)) return;
    const correct = guess.every((g, i) => g === puzzle.solution[i]);
    if (correct) {
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
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const stars = computeStars(lives, 3);
  const allFilled = guess.every((g) => g !== null);

  return (
    <GameShell
      title="Logic Grid"
      gradient="from-lavender-200 to-sky-300"
      emoji="🧩"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Logic Master!"
      winDetail={`You solved all ${totalRounds} puzzles in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <motion.div key={round} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <p className="font-display text-lg text-lavender-500 mb-1">Puzzle {round}: {puzzle.theme}</p>
          <p className="text-sm text-lavender-400 mb-3">Match each person to their item using the clues.</p>
        </motion.div>

        {/* Clues */}
        <div className="bg-sky-50 rounded-3xl p-4 mb-4 text-left">
          <button onClick={() => setShowClue(!showClue)} className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-lemon-500 hover:text-lemon-400 mb-2">
            <Lightbulb size={16} /> {showClue ? 'Hide clues' : 'Show clues'}
          </button>
          <AnimatePresence>
            {showClue && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden">
                {puzzle.clues.map((c, i) => (
                  <motion.li key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="text-sm text-lavender-500 flex gap-2">
                    <span className="text-sky-400 font-bold">{i + 1}.</span> {c}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Assignment grid */}
        <div className="space-y-2 mb-5">
          {puzzle.people.map((person, pi) => (
            <motion.div key={pi} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: pi * 0.08 }}
              className={`flex items-center gap-3 p-2.5 rounded-2xl transition-colors ${activePerson === pi ? 'bg-lavender-100 ring-2 ring-lavender-300' : 'bg-white/60'}`}>
              <span className="font-display font-bold text-lavender-500 w-16 text-left">{person}</span>
              <div className="flex gap-1.5 flex-wrap">
                {puzzle.items.map((item, ii) => {
                  const selected = guess[pi] === ii;
                  const taken = usedItems.has(ii) && !selected;
                  let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50';
                  if (selected) style = feedback === 'correct' ? 'bg-mint-200 border-mint-400 text-mint-500 shadow-glow' : feedback === 'wrong' ? 'bg-blush-200 border-blush-400 text-blush-500' : 'bg-sky-200 border-sky-400 text-lavender-500 shadow-soft';
                  else if (taken) style = 'bg-lavender-50 border-lavender-100 text-lavender-300 opacity-50';
                  return (
                    <motion.button key={ii} whileHover={!taken ? { scale: 1.05 } : {}} whileTap={!taken ? { scale: 0.92 } : {}}
                      onClick={() => { setActivePerson(pi); selected ? clearCell(pi) : assign(pi, ii); }} disabled={taken}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-display font-semibold transition-colors ${style}`}>
                      {item}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button whileHover={allFilled ? { scale: 1.05 } : {}} whileTap={allFilled ? { scale: 0.95 } : {}} onClick={check} disabled={!allFilled}
          className={`px-8 py-3 rounded-2xl font-display font-bold text-white transition-all ${allFilled ? 'bg-gradient-to-r from-lavender-300 to-sky-400 shadow-soft' : 'bg-lavender-200 opacity-50'}`}>
          {feedback === 'correct' ? <Check size={20} className="inline" /> : feedback === 'wrong' ? <XIcon size={20} className="inline" /> : 'Check Answer'}
        </motion.button>

        <div className="mt-5 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-lavender-400 mb-1"><span>Progress</span><span>{round}/{totalRounds}</span></div>
          <div className="h-3 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-lavender-300 to-sky-400" animate={{ width: `${(round / totalRounds) * 100}%` }} />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
