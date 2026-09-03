import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gauge, Flag, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';

type RacingGameProps = {
  soundOn?: boolean;
  onDone?: () => void;
};

type Lane = 0 | 1 | 2;

type Obstacle = {
  id: number;
  lane: Lane;
  y: number;
  kind: 'cone' | 'rock' | 'puddle';
};

const LANES: Lane[] = [0, 1, 2];
const ROAD_WIDTH = 300;
const GAME_HEIGHT = 430;
const CAR_SIZE = 62;
const CAR_Y = GAME_HEIGHT - 92;

function playTone(enabled: boolean, frequency: number, duration = 0.1, type: OscillatorType = 'sine') {
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
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
  window.setTimeout(() => void context.close(), 500);
}

function playFinish(enabled: boolean) {
  if (!enabled) return;
  playTone(true, 523.25, 0.12, 'triangle');
  window.setTimeout(() => playTone(true, 659.25, 0.12, 'triangle'), 85);
  window.setTimeout(() => playTone(true, 783.99, 0.18, 'triangle'), 170);
}

export default function RacingGame({ soundOn = true, onDone }: RacingGameProps) {
  const [lane, setLane] = useState<Lane>(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [boost, setBoost] = useState(100);
  const [finished, setFinished] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [muted, setMuted] = useState(!soundOn);

  const effectiveSound = soundOn && !muted;

  const laneX = useCallback((value: Lane) => 50 + (value - 1) * 34, []);

  const spawnObstacle = useCallback(() => {
    setObstacles((current) => {
      const nextId = current.length === 0 ? 1 : Math.max(...current.map((item) => item.id)) + 1;
      const nextLane = LANES[Math.floor(Math.random() * LANES.length)];
      const nextKind: Obstacle['kind'] = ['cone', 'rock', 'puddle'][Math.floor(Math.random() * 3)] as Obstacle['kind'];
      return [...current, { id: nextId, lane: nextLane, y: -55, kind: nextKind }];
    });
  }, []);

  useEffect(() => {
    if (finished) return;
    const interval = window.setInterval(spawnObstacle, Math.max(650 - speed * 55, 330));
    return () => window.clearInterval(interval);
  }, [finished, spawnObstacle, speed]);

  useEffect(() => {
    if (finished) return;

    const frame = window.setInterval(() => {
      setObstacles((current) => {
        const next = current
          .map((item) => ({ ...item, y: item.y + 6 + speed * 1.2 }))
          .filter((item) => item.y < GAME_HEIGHT + 80);

        const collision = next.some((item) => {
          const sameLane = item.lane === lane;
          const verticalOverlap = item.y + 46 >= CAR_Y && item.y <= CAR_Y + CAR_SIZE - 8;
          return sameLane && verticalOverlap;
        });

        if (collision) {
          setCrashed(true);
          setFinished(true);
          playTone(effectiveSound, 150, 0.18, 'sawtooth');
        }

        return next;
      });

      setScore((value) => value + 1);
      setSpeed((value) => Math.min(5, value + 0.004));
    }, 50);

    return () => window.clearInterval(frame);
  }, [effectiveSound, finished, lane, speed]);

  const move = useCallback((direction: -1 | 1) => {
    if (finished) return;
    setLane((current) => {
      const next = Math.max(0, Math.min(2, current + direction)) as Lane;
      if (next !== current) playTone(effectiveSound, direction < 0 ? 420 : 540, 0.06, 'triangle');
      return next;
    });
  }, [effectiveSound, finished]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
      if (event.code === 'Space' && !finished && boost > 8) {
        setBoost((value) => Math.max(0, value - 8));
        setSpeed((value) => Math.min(7, value + 1));
        playTone(effectiveSound, 860, 0.1, 'sine');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [boost, effectiveSound, finished, move]);

  useEffect(() => {
    if (finished) return;
    const recharge = window.setInterval(() => setBoost((value) => Math.min(100, value + 1)), 280);
    return () => window.clearInterval(recharge);
  }, [finished]);

  useEffect(() => {
    if (crashed) return;
    if (score > 0 && score % 500 === 0) playTone(effectiveSound, 720, 0.1, 'triangle');
  }, [crashed, effectiveSound, score]);

  const distance = Math.floor(score / 8);
  const rank = useMemo(() => (score > 1100 ? '🏆 Champion!' : score > 700 ? '🥇 Speed Star!' : score > 350 ? '🥈 Fast Driver!' : '🌟 Rookie Racer!'), [score]);

  const restart = () => {
    setLane(1);
    setObstacles([]);
    setScore(0);
    setSpeed(1);
    setBoost(100);
    setCrashed(false);
    setFinished(false);
  };

  useEffect(() => {
    if (crashed) return;
    if (score >= 1800) {
      setFinished(true);
      playFinish(effectiveSound);
    }
  }, [crashed, effectiveSound, score]);

  return (
    <div className="px-1 pb-1 pt-2 sm:px-4 sm:pt-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-lavender-100 text-2xl shadow-soft" animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>🏎️</motion.div>
            <div>
              <h3 className="font-display text-2xl font-bold text-lavender-500">Turbo Kids Racing</h3>
              <p className="text-sm text-lavender-400">Dodge, boost and race to the finish line!</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setMuted((value) => !value)} className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm" aria-label={muted ? 'Turn racing sounds on' : 'Turn racing sounds off'}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />} {muted ? 'Sound off' : 'Sound on'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatPill icon="🏁" label="Distance" value={`${distance} m`} />
        <StatPill icon="⚡" label="Boost" value={`${Math.round(boost)}%`} />
        <StatPill icon="🏆" label="Rank" value={rank} />
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-b from-sky-100 via-white to-mint-100 p-3 shadow-soft-lg">
          <div className="relative overflow-hidden rounded-[1.25rem] border-4 border-white/70 bg-gradient-to-b from-slate-300 to-slate-500" style={{ width: ROAD_WIDTH, height: GAME_HEIGHT }}>
            <motion.div className="absolute inset-0 opacity-70" animate={{ backgroundPositionY: ['0px', '54px'] }} transition={{ duration: 0.38, repeat: Infinity, ease: 'linear' }} style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 30px, rgba(255,255,255,0.82) 30px, rgba(255,255,255,0.82) 58px)', backgroundPositionX: '50%', backgroundSize: '8px 54px', backgroundRepeat: 'repeat-y' }} />

            <div className="pointer-events-none absolute inset-y-0 left-0 w-7 bg-white/15" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-7 bg-white/15" />

            {obstacles.map((item) => (
              <motion.div key={item.id} className="absolute z-10 -translate-x-1/2" style={{ left: `${laneX(item.lane)}%`, top: item.y }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 text-2xl shadow-md">
                  {item.kind === 'cone' ? '🚧' : item.kind === 'rock' ? '🪨' : '💦'}
                </div>
              </motion.div>
            ))}

            <motion.div className="absolute z-20 -translate-x-1/2" animate={{ left: `${laneX(lane)}%`, rotate: crashed ? [-5, 5, -5] : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ top: CAR_Y }}>
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="relative flex h-[62px] w-[62px] items-center justify-center rounded-[1.2rem] border-4 border-white bg-gradient-to-br from-sky-400 via-lavender-400 to-lavender-500 text-3xl shadow-[0_12px_24px_rgba(49,46,129,0.28)]">🏎️<div className="absolute -bottom-2 left-1/2 h-2 w-11 -translate-x-1/2 rounded-full bg-black/20 blur-sm" /></motion.div>
            </motion.div>

            <motion.div className="absolute left-0 top-2 z-30 flex w-full justify-center" animate={{ y: [0, 2, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <span className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500 backdrop-blur-md"><Flag size={12} className="mr-1 inline" /> Finish at 225 m</span>
            </motion.div>

            {finished && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-lavender-950/25 p-5 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.82, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full rounded-[1.6rem] border border-white/90 bg-white/85 p-5 text-center shadow-[0_20px_70px_rgba(49,46,129,0.24)]">
                  <div className="text-5xl">{crashed ? '💥' : '🏁'}</div>
                  <h4 className="mt-3 font-display text-2xl font-bold text-lavender-500">{crashed ? 'Bumpy finish!' : 'You made it!'}</h4>
                  <p className="mt-1 text-sm text-lavender-400">{crashed ? 'Watch the road and try again.' : `Great driving — ${distance} meters!`}</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button type="button" onClick={restart} className="rounded-2xl bg-gradient-to-r from-sky-400 to-lavender-500 px-4 py-2.5 font-display text-sm font-bold text-white shadow-soft active:scale-95">Race again</button>
                    <button type="button" onClick={onDone} className="rounded-2xl border border-white bg-white/80 px-4 py-2.5 font-display text-sm font-bold text-lavender-500 active:scale-95">Back</button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[430px]">
        <div className="grid grid-cols-3 gap-2">
          <ControlButton label="◀" hint="Left" onClick={() => move(-1)} />
          <button type="button" onClick={() => { if (finished || boost < 8) return; setBoost((value) => Math.max(0, value - 8)); setSpeed((value) => Math.min(7, value + 1)); playTone(effectiveSound, 860, 0.1, 'sine'); }} className="rounded-2xl bg-gradient-to-br from-lemon-200 to-peach-200 px-3 py-3 font-display font-bold text-lavender-500 shadow-soft active:scale-95"><Zap size={18} className="mx-auto" />Boost</button>
          <ControlButton label="▶" hint="Right" onClick={() => move(1)} />
        </div>
        <p className="mt-2 text-center text-xs text-lavender-300">Use ← → or A / D. Space = boost.</p>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/80 bg-white/65 px-3 py-2 shadow-sm backdrop-blur-md"><div className="flex items-center gap-2"><span className="text-lg">{icon}</span><div className="min-w-0"><p className="text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">{label}</p><p className="truncate text-xs font-display font-bold text-lavender-500">{value}</p></div></div></div>;
}

function ControlButton({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-2xl border border-white/90 bg-white/75 px-3 py-3 font-display text-xl font-bold text-lavender-500 shadow-soft active:scale-95"><span className="block">{label}</span><span className="block text-[10px] font-semibold text-lavender-300">{hint}</span></button>;
}
