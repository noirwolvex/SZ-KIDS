import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Note = { id: number; freq: number; color: string; bg: string; label: string };

const NOTES: Note[] = [
  { id: 0, freq: 261.63, color: 'text-white', bg: 'bg-blush-400', label: 'C' },
  { id: 1, freq: 293.66, color: 'text-white', bg: 'bg-peach-400', label: 'D' },
  { id: 2, freq: 329.63, color: 'text-white', bg: 'bg-lemon-400', label: 'E' },
  { id: 3, freq: 349.23, color: 'text-white', bg: 'bg-mint-400', label: 'F' },
  { id: 4, freq: 392.00, color: 'text-white', bg: 'bg-sky-400', label: 'G' },
  { id: 5, freq: 440.00, color: 'text-white', bg: 'bg-lavender-400', label: 'A' },
];


export default function MusicMaker({ onClose, onWin }: GameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'input' | 'round-win'>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [totalRounds] = useState(8);
  const audioRef = useRef<AudioContext | null>(null);

  const reset = useCallback(() => {
    setSequence([]);
    setUserInput([]);
    setRound(0);
    setScore(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setPhase('idle');
    setActiveNote(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const playNote = useCallback((noteId: number) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = NOTES[noteId].freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* audio not available */ }
    setActiveNote(noteId);
    setTimeout(() => setActiveNote(null), 400);
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    setPhase('playing');
    await new Promise((r) => setTimeout(r, 600));
    for (const noteId of seq) {
      playNote(noteId);
      await new Promise((r) => setTimeout(r, 650));
    }
    setPhase('input');
  }, [playNote]);

  const startNextRound = useCallback(() => {
    const nextLen = round + 1;
    const newSeq = Array.from({ length: nextLen }, () => Math.floor(Math.random() * NOTES.length));
    setSequence(newSeq);
    setUserInput([]);
    setRound(nextLen);
    playSequence(newSeq);
  }, [round, playSequence]);

  const handleNoteClick = (noteId: number) => {
    if (phase !== 'input' || status !== 'playing') return;
    playNote(noteId);
    const newInput = [...userInput, noteId];
    setUserInput(newInput);

    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      // Wrong note
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setPhase('idle');
      setTimeout(() => {
        if (lives > 1) playSequence(sequence);
      }, 1000);
      return;
    }

    if (newInput.length === sequence.length) {
      // Round complete
      setScore((s) => s + 1);
      setPhase('round-win');
      if (round >= totalRounds) {
        setTimeout(() => {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        }, 800);
      } else {
        setTimeout(() => startNextRound(), 1000);
      }
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Music Maker"
      gradient="from-peach-200 to-lemon-200"
      emoji="🎵"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Music Maestro!"
      winDetail={`You played ${score} notes perfectly in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <p className="font-display text-lg text-lavender-500 mb-2">
          {phase === 'playing' && '🎵 Listen carefully...'}
          {phase === 'input' && '🎹 Now repeat the tune!'}
          {phase === 'round-win' && '🎉 Perfect! Get ready...'}
          {phase === 'idle' && 'Press play to start the next round!'}
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {sequence.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < userInput.length ? 'bg-mint-400' : 'bg-lavender-200'}`} />
          ))}
        </div>

        {/* Piano keys */}
        <div className="flex justify-center gap-2 mb-6">
          {NOTES.map((note) => (
            <motion.button
              key={note.id}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNoteClick(note.id)}
              disabled={phase !== 'input'}
              animate={activeNote === note.id ? { scale: [1, 1.25, 1] } : {}}
              className={`relative w-12 sm:w-14 h-32 rounded-2xl ${note.bg} flex flex-col items-center justify-end pb-3 font-display font-bold ${note.color} shadow-soft transition-all overflow-hidden ${
                phase === 'input' ? 'opacity-100' : 'opacity-60'
              } ${activeNote === note.id ? 'ring-4 ring-white shadow-glow' : ''}`}
            >
              {/* Glow effect when active */}
              {activeNote === note.id && (
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              {/* Key shine */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-2xl" />
              <span className="relative">{note.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Start button */}
        {phase === 'idle' && round === 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNextRound}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-peach-300 to-lemon-400 text-white font-display font-bold shadow-soft"
          >
            <Play size={18} fill="white" /> Start Playing!
          </motion.button>
        )}
        {phase === 'idle' && round > 0 && status === 'playing' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSequence(sequence)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-bold shadow-soft"
          >
            <Volume2 size={18} /> Hear Again
          </motion.button>
        )}
      </div>
    </GameShell>
  );
}
