import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, X as XIcon } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Cell = 'empty' | 'wall' | 'goal';
type Dir = 'up' | 'down' | 'left' | 'right';
type Level = { grid: Cell[][]; start: { x: number; y: number }; goal: { x: number; y: number } };

const SIZE = 5;

const LEVELS: Level[] = [
  { start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, grid: gridFrom(['.....','.....','.....','.....','.....']) },
  { start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, grid: gridFrom(['.....','.###.','.....','.###.','.....']) },
  { start: { x: 0, y: 0 }, goal: { x: 4, y: 0 }, grid: gridFrom(['....#','.....','###..','.....','#....']) },
  { start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, grid: gridFrom(['.....','#.##.','#....','#.##.','....#']) },
  { start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, grid: gridFrom(['...#.','.#.#.','.#...','...##','#.#..']) },
];

function gridFrom(rows: string[]): Cell[][] {
  return rows.map((r) => r.split('').map((c) => (c === '#' ? 'wall' : c === 'G' ? 'goal' : 'empty')) as Cell[]);
}

const DELTA: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};


export default function CodingMaze({ onClose, onWin }: GameProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [commands, setCommands] = useState<Dir[]>([]);
  const [robot, setRobot] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const runIdx = useRef(0);
  const level = LEVELS[levelIdx];

  const reset = useCallback((lvl: number) => {
    setLevelIdx(lvl);
    setCommands([]);
    setRobot(LEVELS[lvl].start);
    setRunning(false);
    setLives(3);
    setTime(0);
    setTimerOn(true);
    setStatus('playing');
    setFeedback(null);
    setTrail([LEVELS[lvl].start]);
    runIdx.current = 0;
  }, []);

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  // Execute commands step by step
  useEffect(() => {
    if (!running || runIdx.current >= commands.length) {
      if (running) {
        setRunning(false);
        if (robot.x === level.goal.x && robot.y === level.goal.y) {
          setFeedback('correct');
          setTimeout(() => {
            if (levelIdx + 1 >= LEVELS.length) {
              setStatus('won');
              setTimerOn(false);
              onWin(computeStars(lives, 3));
            } else {
              reset(levelIdx + 1);
            }
          }, 800);
        }
      }
      return;
    }
    const t = setTimeout(() => {
      const dir = commands[runIdx.current];
      const d = DELTA[dir];
      const nx = robot.x + d.x;
      const ny = robot.y + d.y;
      if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE || level.grid[ny][nx] === 'wall') {
        setFeedback('wrong');
        setRunning(false);
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) { setStatus('lost'); setTimerOn(false); }
          return nl;
        });
        setTimeout(() => {
          if (lives > 1) {
            setRobot(level.start);
            setTrail([level.start]);
            setCommands([]);
            setFeedback(null);
          }
        }, 900);
        return;
      }
      runIdx.current += 1;
      const np = { x: nx, y: ny };
      setRobot(np);
      setTrail((tr) => [...tr, np]);
    }, 350);
    return () => clearTimeout(t);
  }, [running, robot, commands, level, levelIdx, lives, onWin]);

  const addCommand = (d: Dir) => {
    if (running || status !== 'playing') return;
    setCommands((c) => [...c, d]);
  };

  const run = () => {
    if (commands.length === 0 || running || status !== 'playing') return;
    runIdx.current = 0;
    setRobot(level.start);
    setTrail([level.start]);
    setFeedback(null);
    setRunning(true);
  };

  const stars = computeStars(lives, 3);
  const arrows: { dir: Dir; Icon: typeof ArrowUp }[] = [
    { dir: 'up', Icon: ArrowUp }, { dir: 'down', Icon: ArrowDown },
    { dir: 'left', Icon: ArrowLeft }, { dir: 'right', Icon: ArrowRight },
  ];

  return (
    <GameShell
      title="Coding Maze"
      gradient="from-mint-200 to-sky-200"
      emoji="🤖"
      onClose={onClose}
      onRestart={() => reset(levelIdx)}
      status={status}
      stars={stars}
      winMessage="Code Master!"
      winDetail={`You solved all ${LEVELS.length} levels in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `Level ${levelIdx + 1}/${LEVELS.length}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        <div className="inline-block p-2 rounded-3xl bg-lavender-100 mb-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {level.grid.map((row, y) => row.map((cell, x) => {
              const isRobot = robot.x === x && robot.y === y;
              const isGoal = level.goal.x === x && level.goal.y === y;
              const visited = trail.some((t) => t.x === x && t.y === y);
              return (
                <div key={`${x}-${y}`} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cell === 'wall' ? 'bg-lavender-300' : isGoal ? 'bg-mint-100' : visited ? 'bg-sky-100' : 'bg-white'}`}>
                  {cell === 'wall' ? '🧱' : isGoal ? '🎯' : isRobot ? <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }}>🤖</motion.span> : ''}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Command sequence */}
        <div className="min-h-[48px] mb-4 flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
          <AnimatePresence>
            {commands.map((c, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  runIdx.current > i && running ? 'bg-mint-200 text-mint-500' : 'bg-sky-100 text-sky-500'
                }`}
              >
                {c === 'up' ? '↑' : c === 'down' ? '↓' : c === 'left' ? '←' : '→'}
              </motion.div>
            ))}
          </AnimatePresence>
          {commands.length === 0 && <p className="text-lavender-300 text-sm font-display">Add commands to guide the robot!</p>}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 mb-3">
          {arrows.map(({ dir, Icon }) => (
            <motion.button
              key={dir}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addCommand(dir)}
              disabled={running || status !== 'playing'}
              className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-200 disabled:opacity-50"
            >
              <Icon size={22} />
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={run}
            disabled={running || commands.length === 0 || status !== 'playing'}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-mint-300 to-mint-400 text-white font-display font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={18} /> Run
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setCommands([]); setRobot(level.start); setTrail([level.start]); }}
            disabled={running}
            className="px-6 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={18} /> Clear
          </motion.button>
        </div>

        {feedback === 'correct' && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 text-mint-500 font-display font-bold flex items-center justify-center gap-1"><Check size={18} /> Level Complete!</motion.p>}
        {feedback === 'wrong' && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 text-blush-500 font-display font-bold flex items-center justify-center gap-1"><XIcon size={18} /> Oops! Hit a wall!</motion.p>}
      </div>
    </GameShell>
  );
}
