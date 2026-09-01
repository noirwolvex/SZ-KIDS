import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Card = { id: number; emoji: string; matched: boolean; flipped: boolean };

const EMOJIS = ['🦊', '🐼', '🦄', '🐙', '🦋', '🐝', '🦉', '🐸'];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const createDeck = (pairs: number): Card[] => {
  const selected = shuffle(EMOJIS).slice(0, pairs);
  return shuffle([...selected, ...selected]).map((emoji, i) => ({
    id: i, emoji, matched: false, flipped: false,
  }));
};


export default function MemoryGame({ onClose, onWin }: GameProps) {
  const [pairs, setPairs] = useState(6);
  const [cards, setCards] = useState<Card[]>(() => createDeck(6));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [lives, setLives] = useState(5);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [locked, setLocked] = useState(false);
  const [wrongPair, setWrongPair] = useState<number[]>([]);

  const reset = useCallback((p: number) => {
    setPairs(p);
    setCards(createDeck(p));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setLives(5);
    setTime(0);
    setRunning(true);
    setWon(false);
    setLost(false);
    setLocked(false);
    setWrongPair([]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleFlip = (id: number) => {
    if (locked || won || lost) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flipped, id];
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped;
      const cardA = cards.find((c) => c.id === a)!;
      const cardB = cards.find((c) => c.id === b)!;
      if (cardA.emoji === cardB.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)));
          setMatches((m) => {
            const nm = m + 1;
            if (nm === pairs) {
              setWon(true);
              setRunning(false);
              onWin(computeStars(lives, 5));
            }
            return nm;
          });
          setFlipped([]);
          setLocked(false);
        }, 600);
      } else {
        setWrongPair([a, b]);
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
          setLives((l) => {
            const nl = l - 1;
            if (nl <= 0) { setLost(true); setRunning(false); }
            return nl;
          });
          setWrongPair([]);
          setLocked(false);
        }, 1000);
      }
    }
  };

  const stars = computeStars(lives, 5);
  const status = won ? 'won' : lost ? 'lost' : 'playing';

  return (
    <GameShell
      title="Memory Match"
      gradient="from-blush-200 to-lavender-200"
      emoji="🧠"
      onClose={onClose}
      onRestart={() => reset(pairs)}
      status={status}
      stars={stars}
      winMessage="Memory Master!"
      winDetail={`Completed in ${moves} moves and ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${matches}/${pairs}`, color: 'text-lemon-500' },
        { icon: 'heart', value: `${Math.max(0, lives)}❤️`, color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([4, 6, 8] as const).map((p) => (
          <button
            key={p}
            onClick={() => reset(p)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              pairs === p ? 'bg-lavender-400 text-white shadow-soft' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
            }`}
          >
            {p === 4 ? 'Easy' : p === 6 ? 'Medium' : 'Hard'}
          </button>
        ))
      }
    >
      <div className={`grid gap-3 mx-auto max-w-md grid-cols-4`}>
        {cards.map((card) => {
          const isWrong = wrongPair.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className="relative aspect-square rounded-2xl"
              whileTap={{ scale: 0.92 }}
              animate={card.matched ? { scale: [1, 1.15, 1] } : isWrong ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-300 to-lavender-400 flex items-center justify-center shadow-soft"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <motion.span
                    className="text-2xl opacity-50"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </div>
                {/* Front */}
                <div
                  className={`absolute inset-0 rounded-2xl flex items-center justify-center text-4xl shadow-soft transition-colors ${
                    card.matched ? 'bg-mint-100 ring-2 ring-mint-400' : isWrong ? 'bg-blush-100' : 'bg-white'
                  }`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {card.emoji}
                </div>
              </motion.div>
              {/* Matched sparkle */}
              {card.matched && (
                <motion.div
                  className="absolute -top-1 -right-1 text-lemon-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.3 }}
                >
                  <Star size={16} fill="currentColor" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Moves counter */}
      <div className="mt-5 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-lavender-50 text-lavender-400 font-display font-semibold text-sm">
          Moves: <span className="text-lavender-500 font-bold">{moves}</span>
        </span>
      </div>
    </GameShell>
  );
}

function Star({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z" />
    </svg>
  );
}
