import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play, Rocket, Sparkles, Zap } from 'lucide-react';
import GameShell, { type GameProps } from './GameShell';

type Lane = 0 | 1 | 2;
type RunnerState = 'playing' | 'paused' | 'won' | 'lost';
type ObstacleKind = 'meteor' | 'barrier' | 'drone';
type PickupKind = 'coin' | 'star' | 'energy';

type Obstacle = { id: number; lane: Lane; y: number; kind: ObstacleKind; phase: number };
type Pickup = { id: number; lane: Lane; y: number; kind: PickupKind; phase: number };
type Burst = { id: number; lane: Lane; y: number; emoji: string };

const LANES: Lane[] = [0, 1, 2];
const GAME_LENGTH = 72;
const START_SPEED = 31;
const MAX_SPEED = 76;
const HIGH_SCORE_KEY = 'space-zone-space-runner-high-score';

const OBSTACLE_EMOJI: Record<ObstacleKind, string> = {
  meteor: '☄️',
  barrier: '🧱',
  drone: '🤖',
};

const PICKUP_EMOJI: Record<PickupKind, string> = {
  coin: '🪙',
  star: '⭐',
  energy: '⚡',
};

function clampLane(value: number): Lane {
  return Math.max(0, Math.min(2, value)) as Lane;
}

function getHighScore() {
  if (typeof window === 'undefined') return 0;
  const saved = Number(window.localStorage.getItem(HIGH_SCORE_KEY));
  return Number.isFinite(saved) ? saved : 0;
}

export default function SpaceRunner({ onClose, onWin }: GameProps) {
  const [lane, setLane] = useState<Lane>(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [time, setTime] = useState(GAME_LENGTH);
  const [speed, setSpeed] = useState(START_SPEED);
  const [jumping, setJumping] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [shield, setShield] = useState(false);
  const [boost, setBoost] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore);
  const [state, setState] = useState<RunnerState>('playing');

  const laneRef = useRef<Lane>(1);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const lastFrameRef = useRef(0);
  const spawnRef = useRef(0);
  const pickupSpawnRef = useRef(0);
  const idRef = useRef(0);
  const distanceRef = useRef(0);
  const coinsRef = useRef(0);
  const boostRef = useRef(0);
  const shieldRef = useRef(false);
  const jumpingRef = useRef(false);
  const slidingRef = useRef(false);
  const resultSentRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  laneRef.current = lane;
  obstaclesRef.current = obstacles;
  pickupsRef.current = pickups;
  distanceRef.current = distance;
  coinsRef.current = coins;
  boostRef.current = boost;
  shieldRef.current = shield;
  jumpingRef.current = jumping;
  slidingRef.current = sliding;

  const finish = useCallback((won: boolean) => {
    if (resultSentRef.current) return;
    resultSentRef.current = true;
    const finalScore = Math.floor(distanceRef.current) + coinsRef.current * 25;
    const nextHigh = Math.max(highScore, finalScore);
    if (typeof window !== 'undefined') window.localStorage.setItem(HIGH_SCORE_KEY, String(nextHigh));
    setHighScore(nextHigh);
    setState(won ? 'won' : 'lost');
    onWin(won ? (coinsRef.current >= 16 ? 3 : coinsRef.current >= 9 ? 2 : 1) : 0);
  }, [highScore, onWin]);

  const reset = useCallback(() => {
    laneRef.current = 1;
    obstaclesRef.current = [];
    pickupsRef.current = [];
    distanceRef.current = 0;
    coinsRef.current = 0;
    boostRef.current = 0;
    shieldRef.current = false;
    jumpingRef.current = false;
    slidingRef.current = false;
    resultSentRef.current = false;
    lastFrameRef.current = 0;
    spawnRef.current = 0;
    pickupSpawnRef.current = 0;
    idRef.current = 0;
    setLane(1);
    setObstacles([]);
    setPickups([]);
    setBursts([]);
    setDistance(0);
    setCoins(0);
    setTime(GAME_LENGTH);
    setSpeed(START_SPEED);
    setJumping(false);
    setSliding(false);
    setShield(false);
    setBoost(0);
    setState('playing');
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    if (state !== 'playing') return;
    const next = clampLane(laneRef.current + direction);
    laneRef.current = next;
    setLane(next);
  }, [state]);

  const jump = useCallback(() => {
    if (state !== 'playing' || jumpingRef.current || slidingRef.current) return;
    jumpingRef.current = true;
    setJumping(true);
    window.setTimeout(() => {
      jumpingRef.current = false;
      setJumping(false);
    }, 820);
  }, [state]);

  const slide = useCallback(() => {
    if (state !== 'playing' || jumpingRef.current || slidingRef.current) return;
    slidingRef.current = true;
    setSliding(true);
    window.setTimeout(() => {
      slidingRef.current = false;
      setSliding(false);
    }, 650);
  }, [state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
      else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
      else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === ' ') {
        event.preventDefault();
        jump();
      } else if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') slide();
      else if (event.key.toLowerCase() === 'p') setState((current) => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [jump, move, slide]);

  useEffect(() => {
    if (state !== 'playing') return;
    let frame = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.034, lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 0.016);
      lastFrameRef.current = now;
      const effectiveSpeed = Math.min(MAX_SPEED, speed + (boostRef.current > 0 ? 29 : 0));
      const travel = effectiveSpeed * dt;
      const nextDistance = distanceRef.current + travel;
      distanceRef.current = nextDistance;
      setDistance(nextDistance);
      setBoost((value) => Math.max(0, value - dt));
      boostRef.current = Math.max(0, boostRef.current - dt);
      if (Math.random() < dt * 1.3) setSpeed((value) => Math.min(MAX_SPEED, value + 0.28));

      spawnRef.current -= dt;
      if (spawnRef.current <= 0) {
        const busy = new Set(obstaclesRef.current.filter((item) => item.y > 72).map((item) => item.lane));
        const available = LANES.filter((item) => !busy.has(item));
        const spawnLane = available[Math.floor(Math.random() * Math.max(1, available.length))] ?? (Math.floor(Math.random() * 3) as Lane);
        const kind: ObstacleKind = Math.random() < 0.34 ? 'drone' : Math.random() < 0.5 ? 'meteor' : 'barrier';
        obstaclesRef.current = [...obstaclesRef.current, { id: idRef.current++, lane: spawnLane, y: 0, kind, phase: Math.random() * Math.PI * 2 }];
        spawnRef.current = Math.max(0.42, 0.96 - (speed - START_SPEED) / 115) + Math.random() * 0.5;
      }

      pickupSpawnRef.current -= dt;
      if (pickupSpawnRef.current <= 0) {
        const pickupLane = Math.floor(Math.random() * 3) as Lane;
        const kind: PickupKind = Math.random() < 0.16 ? 'energy' : Math.random() < 0.3 ? 'star' : 'coin';
        pickupsRef.current = [...pickupsRef.current, { id: idRef.current++, lane: pickupLane, y: 0, kind, phase: Math.random() * Math.PI * 2 }];
        pickupSpawnRef.current = 0.38 + Math.random() * 0.52;
      }

      let missedObstacle = false;
      let nextObstacles = obstaclesRef.current
        .map((item) => ({ ...item, y: item.y + travel * 2.15, phase: item.phase + dt * 3 }))
        .filter((item) => item.y < 118);
      const hitIds = new Set<number>();
      for (const item of nextObstacles) {
        if (item.y > 87 && item.y < 103 && item.lane === laneRef.current) {
          const safe = item.kind === 'drone' ? jumpingRef.current : item.kind === 'barrier' ? slidingRef.current : jumpingRef.current || slidingRef.current;
          if (!safe) {
            hitIds.add(item.id);
            if (shieldRef.current) {
              shieldRef.current = false;
              setShield(false);
              setBursts((items) => [...items, { id: item.id, lane: item.lane, y: item.y, emoji: '🛡️' }]);
            } else {
              missedObstacle = true;
            }
          }
        }
      }
      nextObstacles = nextObstacles.filter((item) => !hitIds.has(item.id));

      let nextPickups = pickupsRef.current
        .map((item) => ({ ...item, y: item.y + travel * 2.2, phase: item.phase + dt * 5 }))
        .filter((item) => item.y < 118);
      const pickupHits = new Set<number>();
      for (const item of nextPickups) {
        if (item.y > 87 && item.y < 104 && item.lane === laneRef.current) {
          pickupHits.add(item.id);
          if (item.kind === 'coin') {
            coinsRef.current += 1;
            setCoins(coinsRef.current);
          } else if (item.kind === 'star') {
            coinsRef.current += 2;
            setCoins(coinsRef.current);
            shieldRef.current = true;
            setShield(true);
          } else {
            boostRef.current = 3.4;
            setBoost(3.4);
          }
          setBursts((items) => [...items, { id: item.id, lane: item.lane, y: item.y, emoji: PICKUP_EMOJI[item.kind] }]);
        }
      }
      nextPickups = nextPickups.filter((item) => !pickupHits.has(item.id));
      obstaclesRef.current = nextObstacles;
      pickupsRef.current = nextPickups;
      setObstacles(nextObstacles);
      setPickups(nextPickups);
      setBursts((items) => items.slice(-8).map((item) => ({ ...item, y: item.y + travel * 0.8 })).filter((item) => item.y < 124));

      if (missedObstacle) {
        finish(false);
        return;
      }
      if (nextDistance >= GAME_LENGTH * 10) {
        finish(true);
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [finish, speed, state]);

  useEffect(() => {
    if (state !== 'playing') return;
    const timer = window.setInterval(() => {
      setTime((value) => {
        const next = value - 1;
        if (next <= 0) finish(true);
        return Math.max(0, next);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, state]);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    const dy = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1);
    else if (dy < 0) jump();
    else slide();
  };

  const score = Math.floor(distance) + coins * 25;
  const progress = Math.min(100, (distance / (GAME_LENGTH * 10)) * 100);
  const roadStyle = (laneIndex: Lane): CSSProperties => ({ left: `${17 + laneIndex * 33}%` });

  return (
    <GameShell
      title="SPACE RUNNER"
      gradient="from-sky-300 to-lavender-300"
      emoji="🚀"
      onClose={onClose}
      onRestart={reset}
      status={state === 'paused' ? 'playing' : state}
      stars={coins >= 16 ? 3 : coins >= 9 ? 2 : 1}
      winMessage="COSMIC CHAMPION!"
      loseMessage="Crash Landing!"
      winDetail={`Distance ${Math.floor(distance)} • Score ${score} • Coins ${coins}`}
      stats={[
        { icon: 'clock', value: `${time}s`, color: 'text-sky-500' },
        { icon: 'score', value: `${score}`, color: 'text-lavender-500' },
        { icon: 'star', value: `${coins}`, color: 'text-lemon-500' },
      ]}
    >
      <div className="select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs font-display font-bold text-lavender-400">
          <span className="inline-flex items-center gap-1.5"><Rocket size={14} /> Reach the finish line • 720m</span>
          <span className="inline-flex items-center gap-1.5"><Zap size={14} className="text-lemon-400" /> {Math.round(speed)} km/h</span>
        </div>
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-lavender-100">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-lavender-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
        </div>

        <div className="relative mx-auto h-[390px] max-w-[620px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#071329] shadow-[inset_0_0_60px_rgba(56,189,248,0.14),0_25px_65px_rgba(38,44,95,0.18)] sm:h-[430px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(125,211,252,0.35),transparent_28%),linear-gradient(180deg,#0b1735_0%,#111f45_45%,#172554_100%)]" />
          {Array.from({ length: 24 }).map((_, index) => (
            <motion.span key={index} className="absolute rounded-full bg-white" style={{ left: `${(index * 41) % 97}%`, top: `${5 + ((index * 23) % 78)}%`, width: index % 3 === 0 ? 3 : 2, height: index % 3 === 0 ? 3 : 2 }} animate={{ opacity: [0.15, 0.9, 0.15] }} transition={{ duration: 1.3 + (index % 5) * 0.3, repeat: Infinity, delay: index * 0.06 }} />
          ))}
          <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
            <div className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-sky-200/75">SPACE ZONE // RUN</div>
          </div>

          <div className="absolute inset-x-[8%] bottom-0 top-[13%] overflow-hidden rounded-t-[48%] border-x border-white/10 bg-gradient-to-b from-slate-950/10 via-indigo-950/30 to-slate-950/70">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_31.8%,rgba(148,163,184,0.23)_32%,rgba(148,163,184,0.23)_32.4%,transparent_32.7%,transparent_65.1%,rgba(148,163,184,0.23)_65.4%,rgba(148,163,184,0.23)_65.8%,transparent_66%)]" />
            <motion.div className="absolute inset-x-0 bottom-0 h-[72%] bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_28px,rgba(125,211,252,0.11)_29px,rgba(125,211,252,0.11)_32px)]" animate={{ backgroundPositionY: ['0px', '64px'] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
            {LANES.map((laneIndex) => (
              <div key={laneIndex} className="absolute bottom-0 top-0 w-[27%] border-x border-white/5" style={roadStyle(laneIndex)} />
            ))}

            {obstacles.map((item) => (
              <motion.div key={item.id} className="absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-[0_0_28px_rgba(248,113,113,0.2)] backdrop-blur-md" style={{ left: `${17 + item.lane * 33}%`, top: `${item.y}%` }} animate={{ rotate: [0, item.kind === 'meteor' ? 10 : -5, 0], scale: [0.9, 1.04, 0.9] }} transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}>
                {OBSTACLE_EMOJI[item.kind]}
              </motion.div>
            ))}

            {pickups.map((item) => (
              <motion.div key={item.id} className="absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-200/20 bg-yellow-200/10 text-2xl shadow-[0_0_30px_rgba(250,204,21,0.28)] backdrop-blur-md" style={{ left: `${17 + item.lane * 33}%`, top: `${item.y}%` }} animate={{ y: [-4, 4, -4], rotate: [0, 180, 360] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                {PICKUP_EMOJI[item.kind]}
              </motion.div>
            ))}

            {bursts.map((burst) => (
              <motion.div key={burst.id} className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 text-xl" style={{ left: `${17 + burst.lane * 33}%`, top: `${burst.y}%` }} initial={{ opacity: 1, scale: 0.5, y: 0 }} animate={{ opacity: 0, scale: 1.8, y: -35 }} transition={{ duration: 0.55 }}>
                {burst.emoji}
              </motion.div>
            ))}

            <motion.div className="absolute z-40 -translate-x-1/2" style={{ left: `${17 + lane * 33}%`, bottom: jumping ? '19%' : sliding ? '4%' : '6%' }} animate={{ y: jumping ? [0, -70, 0] : 0, rotate: jumping ? [-7, 8, -7] : 0 }} transition={{ duration: 0.82, ease: 'easeOut' }}>
              <div className={`relative flex items-center justify-center ${sliding ? 'h-12 w-20' : 'h-20 w-20'} rounded-[1.6rem] border border-sky-100/40 bg-gradient-to-br from-sky-200/55 to-violet-300/40 shadow-[0_0_42px_rgba(56,189,248,0.38)] backdrop-blur-md`}>
                <div className="absolute -bottom-3 h-7 w-14 rounded-full bg-sky-400/25 blur-xl" />
                <Rocket className="text-sky-100" size={sliding ? 36 : 48} strokeWidth={1.6} />
                <motion.span className="absolute -bottom-5 text-lg" animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 0.18, repeat: Infinity }}>🔥</motion.span>
                {shield && <motion.div className="absolute inset-[-9px] rounded-[1.9rem] border-2 border-yellow-200/70" animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.97, 1.03, 0.97] }} transition={{ duration: 1.1, repeat: Infinity }} />}
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-bold text-sky-100 backdrop-blur-md">🪙 {coins} <span className="mx-1 text-white/25">•</span> BEST {highScore}</div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-bold text-sky-100 backdrop-blur-md">{shield ? '🛡️ SHIELD' : boost > 0 ? `⚡ BOOST ${boost.toFixed(1)}s` : '🚀 RUNNING'}</div>
          </div>

          {state === 'paused' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
              <div className="text-center">
                <Pause size={42} className="mx-auto text-sky-200" />
                <p className="mt-3 font-display text-2xl font-black text-white">PAUSED</p>
                <button type="button" onClick={() => setState('playing')} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-indigo-950 shadow-lg"><Play size={16} /> Continue</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <button type="button" onClick={() => move(-1)} className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/70 px-2 text-xs font-display font-bold text-lavender-500 shadow-sm active:scale-95 sm:text-sm"><ArrowLeft size={16} /> Left</button>
          <button type="button" onClick={jump} className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/70 px-2 text-xs font-display font-bold text-lavender-500 shadow-sm active:scale-95"><Rocket size={16} /> Jump</button>
          <button type="button" onClick={slide} className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/70 px-2 text-xs font-display font-bold text-lavender-500 shadow-sm active:scale-95"><ArrowDown size={16} /> Slide</button>
          <button type="button" onClick={() => move(1)} className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/70 px-2 text-xs font-display font-bold text-lavender-500 shadow-sm active:scale-95">Right <ArrowRight size={16} /></button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-lavender-300 sm:text-xs">
          <span>⌨️ ← → move</span><span>⬆️ / SPACE jump</span><span>⬇️ slide</span><span>📱 swipe on mobile</span>
          <button type="button" onClick={() => setState((current) => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current)} className="inline-flex items-center gap-1 rounded-full bg-lavender-100 px-3 py-1.5 font-bold text-lavender-500"><Pause size={12} /> P to pause</button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-sky-500"><Sparkles size={14} /> Collect ⭐ to activate a shield and ⚡ for a turbo burst!</div>
      </div>
    </GameShell>
  );
}
