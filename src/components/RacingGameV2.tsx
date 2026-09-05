import { motion } from 'framer-motion';
import { Flag, Gauge, Medal, Pause, Play, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addActivityLog, recordGamePlay } from '@/lib/db';

type Lane = 0 | 1 | 2;
type Props = { soundOn?: boolean; onDone?: () => void };
type Bot = { id: number; lane: Lane; y: number; variant: 'red' | 'yellow'; name: string };
type Pickup = { id: number; lane: Lane; y: number; kind: 'coin' | 'boost' };

const ROAD = 380;
const HEIGHT = 520;
const PLAYER_TOP = 392;
const FINISH_DISTANCE = 1800;
const lanes: Lane[] = [0, 1, 2];

function tone(enabled: boolean, frequency: number, duration = 0.08) {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;
  const audio = new AudioContextImpl();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  window.setTimeout(() => void audio.close(), 350);
}

function finishTone(enabled: boolean) {
  if (!enabled) return;
  tone(true, 523, 0.1);
  window.setTimeout(() => tone(true, 659, 0.1), 80);
  window.setTimeout(() => tone(true, 784, 0.14), 160);
}

function lanePercent(lane: Lane) {
  return 18 + lane * 32;
}

function CarSvg({ variant, bot = false }: { variant: 'player' | 'red' | 'yellow'; bot?: boolean }) {
  const main = variant === 'player' ? '#22d3ee' : variant === 'red' ? '#fb7185' : '#fbbf24';
  const deep = variant === 'player' ? '#6d5ce7' : variant === 'red' ? '#be123c' : '#b45309';
  const id = `car-${variant}-${bot ? 'bot' : 'player'}`;
  return (
    <motion.div
      className="relative h-[102px] w-[118px]"
      animate={{ y: bot ? [0, -2, 0] : [0, -1, 0] }}
      transition={{ duration: bot ? 0.65 : 0.48, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 140 120" className="h-full w-full" role="img" aria-label={bot ? 'Bot racing car' : 'Player racing car'}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.2" stopColor={main} />
            <stop offset="1" stopColor={deep} />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e0f2fe" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
        <ellipse cx="70" cy="108" rx="45" ry="6" fill="#0f172a" opacity="0.25" />
        <rect x="15" y="74" width="16" height="30" rx="7" fill="#111827" />
        <rect x="109" y="74" width="16" height="30" rx="7" fill="#111827" />
        <rect x="21" y="80" width="8" height="18" rx="4" fill="#475569" />
        <rect x="111" y="80" width="8" height="18" rx="4" fill="#475569" />
        <path d="M27 76 C29 53 42 39 58 35 L82 35 C99 39 112 53 114 76 L105 91 C88 98 52 98 35 91 Z" fill={`url(#${id})`} stroke="#fff" strokeOpacity="0.72" strokeWidth="2.2" />
        <path d="M52 40 C56 30 63 24 70 24 C77 24 84 30 88 40 L83 58 L57 58 Z" fill="#0f172a" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
        <path d="M56 42 L84 42 L80 53 L60 53 Z" fill={`url(#${id}-glass)`} />
        <path d="M37 64 L53 64" stroke="#fff" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
        <path d="M87 64 L103 64" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="69" r="5" fill="#f8fafc" /><circle cx="98" cy="69" r="5" fill="#f8fafc" />
        <circle cx="42" cy="69" r="2.3" fill="#fde68a" /><circle cx="98" cy="69" r="2.3" fill="#fde68a" />
        <rect x="57" y="74" width="26" height="8" rx="4" fill="#fff" opacity="0.25" />
        <path d="M34 86 C52 80 89 80 106 86" stroke="#0f172a" strokeOpacity="0.18" strokeWidth="4" fill="none" />
        {bot && (
          <g transform="translate(55 4)">
            <rect width="30" height="21" rx="8" fill="#fff" opacity="0.95" />
            <circle cx="9" cy="10" r="2.2" fill="#6366f1" /><circle cx="21" cy="10" r="2.2" fill="#6366f1" />
            <path d="M9 15 Q15 19 21 15" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

function PickupIcon({ kind }: { kind: Pickup['kind'] }) {
  return (
    <motion.div
      className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white/80 bg-white/75 text-2xl shadow-soft backdrop-blur"
      animate={{ rotate: kind === 'coin' ? [0, 8, -8, 0] : [0, -6, 6, 0], y: [0, -4, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
    >
      {kind === 'coin' ? '🪙' : '⚡'}
    </motion.div>
  );
}

export default function RacingGameV2({ soundOn = true, onDone }: Props) {
  const [playerLane, setPlayerLane] = useState<Lane>(1);
  const [bots, setBots] = useState<Bot[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [distance, setDistance] = useState(0);
  const [boost, setBoost] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [coins, setCoins] = useState(0);
  const [ended, setEnded] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [muted, setMuted] = useState(!soundOn);
  const [banner, setBanner] = useState('Get ready!');
  const recordedRef = useRef(false);
  const distanceRef = useRef(0);
  const laneRef = useRef<Lane>(1);
  const speedRef = useRef(1);
  const boostRef = useRef(100);
  const endedRef = useRef(false);
  const pausedRef = useRef(false);
  const sound = soundOn && !muted;

  const persistResult = useCallback(async (stars: number, score: number) => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    try {
      await recordGamePlay('turbo-kids-racing', stars, score);
      await addActivityLog('turbo-kids-racing', 'Turbo Kids Racing', '🏎️', `Earned ${stars} star${stars !== 1 ? 's' : ''} & ${stars * 10} coins`);
    } catch (error) {
      recordedRef.current = false;
      console.error('[RacingGameV2] failed to save result:', error);
    }
  }, []);

  const reset = useCallback(() => {
    const initialBots: Bot[] = [
      { id: 1, lane: 0, y: -70, variant: 'red', name: 'Bolt Bot' },
      { id: 2, lane: 2, y: -260, variant: 'yellow', name: 'Sunny Bot' },
    ];
    const initialPickups: Pickup[] = [
      { id: 1, lane: 1, y: -150, kind: 'coin' },
      { id: 2, lane: 0, y: -420, kind: 'boost' },
      { id: 3, lane: 2, y: -720, kind: 'coin' },
      { id: 4, lane: 1, y: -980, kind: 'boost' },
    ];
    setPlayerLane(1);
    laneRef.current = 1;
    setBots(initialBots);
    setPickups(initialPickups);
    setDistance(0);
    distanceRef.current = 0;
    setBoost(100);
    boostRef.current = 100;
    setSpeed(1);
    speedRef.current = 1;
    setCoins(0);
    setEnded(false);
    endedRef.current = false;
    setCrashed(false);
    setPaused(false);
    pausedRef.current = false;
    setCountdown(3);
    setBanner('Get ready!');
    recordedRef.current = false;
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (countdown === null || ended || paused) return;
    if (countdown === 0) return;
    const timer = window.setTimeout(() => {
      const next = countdown - 1;
      setCountdown(next);
      if (next > 0) tone(sound, next === 1 ? 700 : 560, 0.1);
      else {
        setBanner('GO!');
        tone(sound, 880, 0.14);
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [countdown, ended, paused, sound]);

  const move = useCallback((direction: -1 | 1) => {
    if (endedRef.current || pausedRef.current || countdown !== 0) return;
    setPlayerLane((current) => {
      const next = Math.max(0, Math.min(2, current + direction)) as Lane;
      laneRef.current = next;
      if (next !== current) tone(sound, direction < 0 ? 420 : 540);
      return next;
    });
  }, [countdown, sound]);

  const triggerBoost = useCallback(() => {
    if (endedRef.current || pausedRef.current || countdown !== 0 || boostRef.current < 15) return;
    setBoost((value) => {
      const next = Math.max(0, value - 15);
      boostRef.current = next;
      return next;
    });
    setSpeed((value) => {
      const next = Math.min(7.5, value + 1.55);
      speedRef.current = next;
      return next;
    });
    setBanner('TURBO!');
    tone(sound, 940, 0.13);
    window.setTimeout(() => setBanner('Stay ahead!'), 450);
  }, [countdown, sound]);

  useEffect(() => {
    if (ended || paused || countdown !== 0) return;
    const timer = window.setInterval(() => {
      const tickSpeed = Math.min(5.8, speedRef.current + 0.004);
      speedRef.current = tickSpeed;
      setSpeed(tickSpeed);
      const nextDistance = distanceRef.current + 1;
      distanceRef.current = nextDistance;
      setDistance(nextDistance);

      const movement = 4.8 + tickSpeed * 1.35;
      setBots((current) => current.map((bot) => {
        const nextY = bot.y + movement;
        if (nextY > HEIGHT + 60) return { ...bot, y: -150 - Math.random() * 170, lane: lanes[Math.floor(Math.random() * lanes.length)] };
        return { ...bot, y: nextY };
      }));

      setPickups((current) => current.map((item) => {
        const nextY = item.y + movement;
        if (nextY > HEIGHT + 40) return { ...item, y: -180 - Math.random() * 260, lane: lanes[Math.floor(Math.random() * lanes.length)] };
        return { ...item, y: nextY };
      }));

      setBoost((value) => {
        const next = Math.min(100, value + 0.18);
        boostRef.current = next;
        return next;
      });

      setBots((current) => {
        const collision = current.some((bot) => bot.lane === laneRef.current && bot.y + 62 >= PLAYER_TOP && bot.y <= PLAYER_TOP + 78);
        if (collision) {
          setCrashed(true);
          setEnded(true);
          endedRef.current = true;
          setBanner('Bump!');
          void persistResult(1, Math.max(10, Math.floor(nextDistance / 8) + coins * 5));
          tone(sound, 150, 0.17);
        }
        return current;
      });

      setPickups((current) => {
        let collected = 0;
        let boostCollected = 0;
        const remaining = current.filter((item) => {
          const hit = item.lane === laneRef.current && item.y + 42 >= PLAYER_TOP && item.y <= PLAYER_TOP + 80;
          if (hit) {
            if (item.kind === 'coin') collected += 1;
            else boostCollected += 1;
          }
          return !hit;
        });
        if (collected) {
          setCoins((value) => value + collected);
          setBanner(`+${collected} coin${collected > 1 ? 's' : ''}!`);
          tone(sound, 760, 0.08);
        }
        if (boostCollected) {
          setBoost((value) => {
            const next = Math.min(100, value + 28 * boostCollected);
            boostRef.current = next;
            return next;
          });
          setBanner('Boost refilled!');
          tone(sound, 860, 0.08);
        }
        return remaining;
      });

      if (nextDistance >= FINISH_DISTANCE) {
        setEnded(true);
        endedRef.current = true;
        setBanner('Finish!');
        finishTone(sound);
        void persistResult(3, Math.floor(nextDistance / 8) + coins * 10);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [countdown, ended, paused, persistResult, sound, coins]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
      if (event.code === 'Space') {
        event.preventDefault();
        triggerBoost();
      }
      if (event.key.toLowerCase() === 'p' && countdown === 0 && !endedRef.current) {
        setPaused((value) => {
          pausedRef.current = !value;
          return !value;
        });
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [countdown, move, triggerBoost]);

  const meters = Math.floor(distance / 8);
  const progress = Math.min(100, (distance / FINISH_DISTANCE) * 100);
  const place = useMemo(() => {
    if (distance > 1420) return '1st';
    if (distance > 820) return '2nd';
    return '3rd';
  }, [distance]);
  const stars = crashed ? 1 : coins >= 6 ? 3 : coins >= 3 ? 2 : 3;

  return (
    <div className="px-1 pb-2 pt-2 sm:px-4 sm:pt-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500">Turbo Track</span>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-display font-bold text-lavender-400">🤖 2 BOT RACERS</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold text-lavender-500">Race with the Bots.</h3>
          <p className="text-sm text-lavender-400">Dodge, collect coins, charge your turbo and beat Bolt + Sunny.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setPaused((value) => { pausedRef.current = !value; return !value; }); }} disabled={countdown !== 0 || ended} className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm disabled:opacity-40">
            {paused ? <Play size={15} /> : <Pause size={15} />} {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={() => setMuted((value) => !value)} className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm">
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />} {muted ? 'Sound off' : 'Sound on'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Stat icon="🏁" label="Distance" value={`${meters} m`} />
        <Stat icon="⚡" label="Turbo" value={`${Math.round(boost)}%`} />
        <Stat icon="🪙" label="Coins" value={`${coins}`} />
        <Stat icon="🏆" label="Place" value={place} />
      </div>

      <div className="mx-auto mt-4 max-w-[520px] rounded-2xl border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-lavender-400">
          <span>Finish line</span><span>{meters} / 225 m</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-lavender-100">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-lavender-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-b from-sky-100 via-white to-mint-100 p-3 pb-4 shadow-soft-lg">
          <div className="relative overflow-hidden rounded-[1.55rem] border-4 border-white/85 bg-gradient-to-b from-slate-300 to-slate-700" style={{ width: ROAD, height: HEIGHT }}>
            <motion.div
              className="absolute inset-0 opacity-75"
              animate={{ backgroundPositionY: ['0px', '84px'] }}
              transition={{ duration: 0.36, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 42px, rgba(255,255,255,0.82) 42px, rgba(255,255,255,0.82) 84px)', backgroundSize: '8px 84px', backgroundRepeat: 'repeat-y' }}
            />
            <div className="absolute inset-y-0 left-0 w-3 bg-white/10" /><div className="absolute inset-y-0 right-0 w-3 bg-white/10" />
            <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent" />

            <div className="absolute inset-x-3 top-3 z-40 flex justify-between gap-2">
              <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-500 shadow-sm">🤖 BOLT</span>
              <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-500 shadow-sm">☀️ SUNNY</span>
            </div>

            {pickups.map((item) => (
              <motion.div key={item.id} className="absolute z-15 -translate-x-1/2" style={{ left: `${lanePercent(item.lane)}%`, top: item.y }}>
                <PickupIcon kind={item.kind} />
              </motion.div>
            ))}

            {bots.map((bot) => (
              <motion.div key={bot.id} className="absolute z-20 -translate-x-1/2" style={{ left: `${lanePercent(bot.lane)}%`, top: bot.y }}>
                <CarSvg variant={bot.variant} bot />
              </motion.div>
            ))}

            <motion.div className="absolute z-30 -translate-x-1/2" style={{ top: PLAYER_TOP }} animate={{ left: `${lanePercent(playerLane)}%` }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
              <CarSvg variant="player" />
            </motion.div>

            <motion.div className="absolute left-0 right-0 top-[40%] z-10 flex justify-center" animate={{ y: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
              <span className="rounded-full border border-white/75 bg-white/80 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500 shadow-sm"><Flag size={12} className="mr-1 inline" /> Finish 225 m</span>
            </motion.div>

            {!ended && countdown !== null && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 p-5 backdrop-blur-[2px]">
                <motion.div key={countdown} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="text-7xl font-display font-black text-white drop-shadow-[0_6px_20px_rgba(79,70,229,0.35)]">{countdown === 0 ? 'GO!' : countdown}</div>
                  <p className="mt-2 rounded-full bg-white/80 px-4 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm">{banner}</p>
                </motion.div>
              </div>
            )}

            {!ended && paused && countdown === 0 && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-5 backdrop-blur-sm">
                <div className="rounded-[1.75rem] border border-white/90 bg-white/92 px-8 py-7 text-center shadow-[0_25px_90px_rgba(15,23,42,0.3)]">
                  <Pause className="mx-auto text-lavender-400" size={34} />
                  <h4 className="mt-2 font-display text-2xl font-bold text-lavender-500">Race paused</h4>
                  <button type="button" onClick={() => { setPaused(false); pausedRef.current = false; }} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-lavender-400 px-5 py-3 font-display font-bold text-white shadow-soft"><Play size={16} /> Resume race</button>
                </div>
              </div>
            )}

            {!ended && countdown === 0 && (
              <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
                <div className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-500 shadow-sm backdrop-blur-md">A/D or ← → to steer • SPACE for turbo</div>
              </div>
            )}

            {ended && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[1.75rem] border border-white/90 bg-white/95 p-6 text-center shadow-[0_25px_90px_rgba(15,23,42,0.3)]">
                  <div className="flex justify-center gap-1 text-4xl">{[1, 2, 3].map((item) => <span key={item} className={item <= stars ? 'opacity-100' : 'opacity-20'}>⭐</span>)}</div>
                  <div className="mt-2 text-5xl">{crashed ? '💥' : '🏁'}</div>
                  <h4 className="mt-2 font-display text-2xl font-bold text-lavender-500">{crashed ? 'Nice try, racer!' : 'You beat the track!'}</h4>
                  <p className="mt-1 text-sm text-lavender-400">{crashed ? 'Switch lanes earlier and try again.' : `Great run! You collected ${coins} coin${coins === 1 ? '' : 's'}.`}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniResult icon={<Flag size={15} />} label="Distance" value={`${meters} m`} />
                    <MiniResult icon={<Medal size={15} />} label="Coins" value={`${coins}`} />
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-2xl bg-lavender-400 px-4 py-3 font-display font-bold text-white shadow-soft"><RotateCcw size={16} /> Race again</button>
                    <button type="button" onClick={onDone} className="inline-flex items-center gap-2 rounded-2xl border border-lavender-100 bg-white px-4 py-3 font-display font-bold text-lavender-500 shadow-soft"><Flag size={16} /> Back to Games</button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {!ended && (
            <div className="mt-4 grid grid-cols-3 items-center gap-3 px-1">
              <button type="button" onClick={() => move(-1)} disabled={paused || countdown !== 0} className="h-12 w-full rounded-2xl bg-white/85 text-2xl shadow-soft disabled:opacity-45" aria-label="Move left">←</button>
              <button type="button" onClick={triggerBoost} disabled={paused || countdown !== 0 || boost < 15} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lemon-300 to-peach-300 px-4 font-display font-black text-lavender-500 shadow-soft disabled:opacity-45"><Zap size={16} fill="currentColor" /> Turbo</button>
              <button type="button" onClick={() => move(1)} disabled={paused || countdown !== 0} className="h-12 w-full rounded-2xl bg-white/85 text-2xl shadow-soft disabled:opacity-45" aria-label="Move right">→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/80 bg-white/65 px-3 py-2 shadow-sm"><div className="flex items-center gap-2 text-xs font-display font-bold text-lavender-400"><span>{icon}</span>{label}</div><p className="mt-1 font-display text-lg font-bold text-lavender-500">{value}</p></div>;
}

function MiniResult({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-sky-50 px-3 py-2 text-left"><div className="flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">{icon}{label}</div><p className="mt-1 font-display text-lg font-bold text-lavender-500">{value}</p></div>;
}
