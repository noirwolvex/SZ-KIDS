import { motion } from 'framer-motion';
import { Gauge, Flag, Volume2, VolumeX, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addActivityLog, recordGamePlay } from '@/lib/db';

type Lane = 0 | 1 | 2;
type Props = { soundOn?: boolean; onDone?: () => void };
type Bot = { id: number; lane: Lane; y: number; variant: 'red' | 'yellow' };

const ROAD = 360;
const HEIGHT = 500;
const PLAYER_TOP = 392;
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

function CarSvg({ variant, bot = false }: { variant: 'player' | 'red' | 'yellow'; bot?: boolean }) {
  const main = variant === 'player' ? '#22d3ee' : variant === 'red' ? '#fb7185' : '#fbbf24';
  const deep = variant === 'player' ? '#6d5ce7' : variant === 'red' ? '#be123c' : '#b45309';
  const id = `car-${variant}-${bot ? 'bot' : 'player'}`;
  return (
    <motion.div className="relative h-[102px] w-[118px]" animate={{ y: bot ? [0, -2, 0] : [0, -1, 0] }} transition={{ duration: bot ? 0.65 : 0.48, repeat: Infinity, ease: 'easeInOut' }}>
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
        <circle cx="42" cy="69" r="5" fill="#f8fafc" />
        <circle cx="98" cy="69" r="5" fill="#f8fafc" />
        <circle cx="42" cy="69" r="2.3" fill="#fde68a" />
        <circle cx="98" cy="69" r="2.3" fill="#fde68a" />
        <rect x="57" y="74" width="26" height="8" rx="4" fill="#fff" opacity="0.25" />
        <path d="M34 86 C52 80 89 80 106 86" stroke="#0f172a" strokeOpacity="0.18" strokeWidth="4" fill="none" />
        {bot && (
          <g transform="translate(55 4)">
            <rect width="30" height="21" rx="8" fill="#fff" opacity="0.95" />
            <circle cx="9" cy="10" r="2.2" fill="#6366f1" />
            <circle cx="21" cy="10" r="2.2" fill="#6366f1" />
            <path d="M9 15 Q15 19 21 15" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

function lanePercent(lane: Lane) { return 18 + lane * 32; }

export default function RacingGameV2({ soundOn = true, onDone }: Props) {
  const [playerLane, setPlayerLane] = useState<Lane>(1);
  const [bots, setBots] = useState<Bot[]>([
    { id: 1, lane: 0, y: -10, variant: 'red' },
    { id: 2, lane: 2, y: -230, variant: 'yellow' },
  ]);
  const [distance, setDistance] = useState(0);
  const [boost, setBoost] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [muted, setMuted] = useState(!soundOn);
  const recordedRef = useRef(false);
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

  const move = useCallback((direction: -1 | 1) => {
    if (ended) return;
    setPlayerLane((current) => {
      const next = Math.max(0, Math.min(2, current + direction)) as Lane;
      if (next !== current) tone(sound, direction < 0 ? 420 : 540);
      return next;
    });
  }, [ended, sound]);

  useEffect(() => {
    if (ended) return;
    const timer = window.setInterval(() => {
      setDistance((value) => value + 1);
      setSpeed((value) => Math.min(5.5, value + 0.0025));
      setBots((current) => {
        const moved = current.map((bot) => ({ ...bot, y: bot.y + 4.2 + speed * 1.1 }));
        const next = moved.map((bot) => bot.y > HEIGHT + 40 ? { ...bot, y: -110 - Math.random() * 180, lane: lanes[Math.floor(Math.random() * lanes.length)] } : bot);
        const collision = next.some((bot) => bot.lane === playerLane && bot.y + 65 >= PLAYER_TOP && bot.y <= PLAYER_TOP + 75);
        if (collision) {
          setCrashed(true);
          setEnded(true);
          void persistResult(1, Math.floor(distance / 8));
          tone(sound, 150, 0.17);
        }
        return next;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [ended, playerLane, sound, speed, distance, persistResult]);

  useEffect(() => {
    if (ended) return;
    const recharge = window.setInterval(() => setBoost((value) => Math.min(100, value + 1)), 260);
    return () => window.clearInterval(recharge);
  }, [ended]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
      if (event.code === 'Space' && !ended && boost >= 12) {
        setBoost((value) => Math.max(0, value - 12));
        setSpeed((value) => Math.min(7, value + 0.8));
        tone(sound, 900, 0.1);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [boost, ended, move, sound]);

  useEffect(() => {
    if (ended || distance < 1800) return;
    setEnded(true);
    finishTone(sound);
    void persistResult(3, Math.floor(distance / 8));
  }, [distance, ended, sound, persistResult]);

  const reset = () => {
    setPlayerLane(1);
    setBots([
      { id: 1, lane: 0, y: -10, variant: 'red' },
      { id: 2, lane: 2, y: -230, variant: 'yellow' },
    ]);
    setDistance(0);
    setBoost(100);
    setSpeed(1);
    setEnded(false);
    setCrashed(false);
    recordedRef.current = false;
  };

  const meters = Math.floor(distance / 8);
  const place = useMemo(() => distance > 1350 ? '1st — Champion' : distance > 850 ? '2nd — Speed Star' : '3rd — Rookie Racer', [distance]);

  return (
    <div className="px-1 pb-2 pt-2 sm:px-4 sm:pt-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500">Turbo Track</span>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-display font-bold text-lavender-400">🤖 2 BOT RACERS</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-bold text-lavender-500">Turbo Kids Racing</h3>
          <p className="text-sm text-lavender-400">Race the bots and take the finish line!</p>
        </div>
        <button type="button" onClick={() => setMuted((value) => !value)} className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/80 bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-500 shadow-sm">
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />} {muted ? 'Sound off' : 'Sound on'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat icon="🏁" label="Distance" value={`${meters} m`} />
        <Stat icon="⚡" label="Boost" value={`${Math.round(boost)}%`} />
        <Stat icon="🏆" label="Position" value={place} />
      </div>

      <div className="mt-5 flex justify-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-b from-sky-100 via-white to-mint-100 p-3 shadow-soft-lg">
          <div className="relative overflow-hidden rounded-[1.55rem] border-4 border-white/85 bg-gradient-to-b from-slate-300 to-slate-700" style={{ width: ROAD, height: HEIGHT }}>
            <motion.div className="absolute inset-0 opacity-75" animate={{ backgroundPositionY: ['0px', '84px'] }} transition={{ duration: 0.36, repeat: Infinity, ease: 'linear' }} style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 42px, rgba(255,255,255,0.82) 42px, rgba(255,255,255,0.82) 84px)', backgroundSize: '8px 84px', backgroundRepeat: 'repeat-y' }} />
            <div className="absolute inset-y-0 left-0 w-3 bg-white/10" />
            <div className="absolute inset-y-0 right-0 w-3 bg-white/10" />
            <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent" />

            <div className="absolute inset-x-3 top-3 z-40 flex justify-between gap-2">
              <span className="rounded-full bg-white/82 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-500 shadow-sm">🤖 BOT A</span>
              <span className="rounded-full bg-white/82 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-500 shadow-sm">🤖 BOT B</span>
            </div>

            {bots.map((bot) => (
              <motion.div key={bot.id} className="absolute z-20 -translate-x-1/2" style={{ left: `${lanePercent(bot.lane)}%`, top: bot.y }}>
                <CarSvg variant={bot.variant} bot />
              </motion.div>
            ))}

            <motion.div className="absolute z-30 -translate-x-1/2" style={{ top: PLAYER_TOP }} animate={{ left: `${lanePercent(playerLane)}%` }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
              <CarSvg variant="player" />
            </motion.div>

            <motion.div className="absolute left-0 right-0 top-[42%] z-10 flex justify-center" animate={{ y: [0, 3, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
              <span className="rounded-full border border-white/75 bg-white/80 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500 shadow-sm"><Flag size={12} className="mr-1 inline" /> Finish 225 m</span>
            </motion.div>

            {ended && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[1.75rem] border border-white/90 bg-white/92 p-6 text-center shadow-[0_25px_90px_rgba(15,23,42,0.3)]">
                  <div className="text-6xl">{crashed ? '💥' : '🏁'}</div>
                  <h4 className="mt-2 font-display text-2xl font-bold text-lavender-500">{crashed ? 'Nice try, racer!' : 'Finish line!'}</h4>
                  <p className="mt-1 text-sm text-lavender-400">{crashed ? 'Watch the bots and try another lane.' : 'You made it to the finish!'}</p>
                  <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-display font-bold text-lavender-500">Distance: {meters} m</div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-2xl bg-lavender-400 px-4 py-3 font-display font-bold text-white shadow-soft"><Gauge size={16} /> Race again</button>
                    <button type="button" onClick={onDone} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-display font-bold text-lavender-500 shadow-soft border border-lavender-100"><Flag size={16} /> Back to Games</button>
                  </div>
                </motion.div>
              </div>
            )}

            {!ended && (
              <div className="absolute inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3">
                <button type="button" onClick={() => move(-1)} className="h-12 w-12 rounded-2xl bg-white/85 text-2xl shadow-soft" aria-label="Move left">←</button>
                <button type="button" onClick={() => { if (boost < 12) return; setBoost((value) => Math.max(0, value - 12)); setSpeed((value) => Math.min(7, value + 0.8)); tone(sound, 900, 0.1); }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-lemon-300 to-peach-300 px-4 py-3 font-display font-black text-lavender-500 shadow-soft"><Zap size={16} fill="currentColor" /> Turbo</button>
                <button type="button" onClick={() => move(1)} className="h-12 w-12 rounded-2xl bg-white/85 text-2xl shadow-soft" aria-label="Move right">→</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/80 bg-white/65 px-3 py-2 shadow-sm"><div className="flex items-center gap-2 text-xs font-display font-bold text-lavender-400"><span>{icon}</span>{label}</div><p className="mt-1 font-display text-lg font-bold text-lavender-500">{value}</p></div>;
}
