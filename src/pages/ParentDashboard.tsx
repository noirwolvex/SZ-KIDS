import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useCallback } from 'react';
import { Shield, Clock, TrendingUp, BarChart3, Lock, Bell, Star, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, Badge, ProgressRing, Button, EmptyState } from '@/components/ui';
import { useProfile, useGameProgress, useActivityLog, useSettings } from '@/lib/hooks';
import { getGameById, games } from '@/data/content';
import type { LucideIcon } from 'lucide-react';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Category display config: icon + color keyed by the `category` string on a Game.
const CATEGORY_META: Record<string, { icon: LucideIcon; color: string }> = {
  Math: { icon: BarChart3, color: '#34c187' },
  Numbers: { icon: BarChart3, color: '#ff7fbf' },
  Logic: { icon: Zap, color: '#ffd24d' },
  Memory: { icon: Zap, color: '#ff7fbf' },
  Science: { icon: Zap, color: '#ffd24d' },
  Space: { icon: Zap, color: '#9d7ce6' },
  Colors: { icon: Zap, color: '#ff8f63' },
  Shapes: { icon: Zap, color: '#9d7ce6' },
  Animals: { icon: Zap, color: '#34c187' },
  Geography: { icon: Zap, color: '#38bdf8' },
  Music: { icon: Zap, color: '#ff8f63' },
  Stories: { icon: Zap, color: '#38bdf8' },
  Alphabet: { icon: Zap, color: '#38bdf8' },
  Spelling: { icon: Zap, color: '#38bdf8' },
  Coding: { icon: Zap, color: '#34c187' },
  Typing: { icon: Zap, color: '#38bdf8' },
};
const DEFAULT_CATEGORY_META = { icon: Zap, color: '#9d7ce6' };

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatRelativeTime(iso: string): string {
  const then = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - then) / dayMs);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export default function ParentDashboard() {
  const { settings, loading: settingsLoading, error: settingsError, save: saveSettings } = useSettings();
  const { progress, loading: progressLoading, error: progressError } = useGameProgress();
  const { log, loading: logLoading, error: logError } = useActivityLog(100);
  const { profile, error: profileError } = useProfile();

  const [locked, setLocked] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const dbError = settingsError && progressError && logError && profileError;
  const loading = (settingsLoading || progressLoading || logLoading) && !dbError;

  // ── Derived: weekly activity (last 7 days, Mon..Sun of current week) ──
  const weeklyActivity = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    // ISO weekday: 1=Mon..7=Sun
    const todayIdx = (now.getDay() + 6) % 7;
    const weekStart = startOfDay(now);
    weekStart.setDate(weekStart.getDate() - todayIdx);
    const weekStartMs = weekStart.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const a of log) {
      const t = startOfDay(new Date(a.created_at)).getTime();
      const offset = Math.round((t - weekStartMs) / dayMs);
      if (offset >= 0 && offset < 7) counts[offset]++;
    }
    return counts;
  }, [log]);

  // ── Derived: subjects grouped by category, completion % from progress ──
  const subjects = useMemo(() => {
    // Map category -> { played, total, stars }
    const byCat = new Map<string, { played: number; total: number; stars: number }>();
    for (const g of games) {
      const entry = byCat.get(g.category) ?? { played: 0, total: 0, stars: 0 };
      entry.total++;
      byCat.set(g.category, entry);
    }
    for (const p of progress) {
      const g = getGameById(p.game_id);
      if (!g) continue;
      const entry = byCat.get(g.category);
      if (!entry) continue;
      if (p.times_played > 0) entry.played++;
      entry.stars += p.stars_earned;
    }
    // completion % = played games / total games in that category (0..100)
    const result = [];
    for (const [name, e] of byCat) {
      if (e.played === 0) continue; // only show categories with at least one played game
      const value = e.total > 0 ? Math.round((e.played / e.total) * 100) : 0;
      const meta = CATEGORY_META[name] ?? DEFAULT_CATEGORY_META;
      result.push({ name, value, icon: meta.icon, color: meta.color });
    }
    // Sort by completion desc, take top 4
    result.sort((a, b) => b.value - a.value);
    return result.slice(0, 4);
  }, [progress]);

  // ── Derived: screen time today (count of today's activities) ──
  const screenTimeUsedToday = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return log.filter((a) => startOfDay(new Date(a.created_at)).getTime() === today).length;
  }, [log]);

  const screenTimeLimit = settings?.screen_time_limit ?? 60;
  const screenTimePct = screenTimeLimit > 0 ? Math.min(100, Math.round((screenTimeUsedToday / screenTimeLimit) * 100)) : 0;

  // Debounced screen-time slider save
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSave = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveSettings({ screen_time_limit: val }), 500);
  }, [saveSettings]);

  // ── Derived: stars this week vs last week ──
  const { starsThisWeek, starsLastWeek } = useMemo(() => {
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7;
    const thisWeekStart = startOfDay(now);
    thisWeekStart.setDate(thisWeekStart.getDate() - todayIdx);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const thisMs = thisWeekStart.getTime();
    const lastMs = lastWeekStart.getTime();

    let thisWeek = 0;
    let lastWeek = 0;
    for (const p of progress) {
      if (!p.last_played_at) continue;
      const t = startOfDay(new Date(p.last_played_at)).getTime();
      if (t >= thisMs) thisWeek += p.stars_earned;
      else if (t >= lastMs && t < thisMs) lastWeek += p.stars_earned;
    }
    return { starsThisWeek: thisWeek, starsLastWeek: lastWeek };
  }, [progress]);

  const starsDelta = starsThisWeek - starsLastWeek;

  // ── Derived: skills improved (distinct categories with >=1 played game) ──
  const skillsImproved = useMemo(() => {
    const playedCats = new Set<string>();
    for (const p of progress) {
      if (p.times_played > 0) {
        const g = getGameById(p.game_id);
        if (g) playedCats.add(g.category);
      }
    }
    return Array.from(playedCats);
  }, [progress]);

  // ── Derived: games played this week (count of activities in current week) ──
  const gamesPlayedThisWeek = useMemo(() => {
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7;
    const weekStart = startOfDay(now);
    weekStart.setDate(weekStart.getDate() - todayIdx);
    const weekStartMs = weekStart.getTime();
    return log.filter((a) => startOfDay(new Date(a.created_at)).getTime() >= weekStartMs).length;
  }, [log]);

  // ── PIN gating ──
  const hasPin = settings?.pin != null && settings.pin !== '';
  const showLock = hasPin && locked;

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground density="low" />
        <div className="relative flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-lavender-200 border-t-lavender-500"
          />
          <p className="text-lavender-400 font-display font-semibold">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (showLock) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <AnimatedBackground density="low" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-md w-full">
          <Card className="p-8 text-center">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-lavender-200 to-sky-200 items-center justify-center mb-5"
            >
              <Lock className="text-lavender-500" size={36} />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-lavender-500">Parents Only</h1>
            <p className="text-lavender-400 mt-2 mb-6">Enter your 4-digit PIN to access the dashboard.</p>
            <PinPad onUnlock={() => setLocked(false)} expectedPin={settings!.pin!} />
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-20 md:pb-8 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender-200 to-sky-200 flex items-center justify-center">
              <Shield className="text-lavender-500" size={24} />
            </div>
            <div>
              <h1 className="font-display text-fluid-h2 font-bold text-lavender-500">Parent Dashboard</h1>
              <p className="text-lavender-400 text-fluid-body">Monitor progress, set limits, and keep learning safe.</p>
            </div>
          </motion.div>

          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender-400 mb-1">
                <Clock size={16} /> <span className="text-xs font-semibold">Screen Time Today</span>
              </div>
              <p className="font-display text-2xl font-bold text-lavender-500">
                {screenTimeUsedToday}<span className="text-base text-lavender-300">/{screenTimeLimit} activities</span>
              </p>
              <div className="h-2 rounded-full bg-lavender-100 mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lavender-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${screenTimePct}%` }}
                />
              </div>
            </Card>
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender-400 mb-1">
                <Star size={16} /> <span className="text-xs font-semibold">Stars This Week</span>
              </div>
              <p className="font-display text-2xl font-bold text-lemon-500">{starsThisWeek}</p>
              {starsLastWeek > 0 && (
                <p className={`text-xs font-semibold mt-2 ${starsDelta >= 0 ? 'text-mint-500' : 'text-blush-500'}`}>
                  {starsDelta >= 0 ? '+' : ''}{starsDelta} from last week
                </p>
              )}
            </Card>
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender-400 mb-1">
                <TrendingUp size={16} /> <span className="text-xs font-semibold">Skills Improved</span>
              </div>
              <p className="font-display text-2xl font-bold text-mint-500">{skillsImproved.length}</p>
              <p className="text-xs text-lavender-400 mt-2">
                {skillsImproved.length > 0 ? skillsImproved.slice(0, 3).join(', ') : 'No skills yet'}
              </p>
            </Card>
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-lavender-400 mb-1">
                <Zap size={16} /> <span className="text-xs font-semibold">Games Played</span>
              </div>
              <p className="font-display text-2xl font-bold text-sky-500">{gamesPlayedThisWeek}</p>
              <p className="text-xs text-lavender-400 mt-2">This week</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Subject progress */}
            <Card className="p-4 sm:p-6 lg:col-span-2">
              <h2 className="font-display text-xl font-bold text-lavender-500 mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Learning Progress
              </h2>
              {subjects.length === 0 ? (
                <EmptyState
                  emoji="📊"
                  title="No progress yet"
                  message="Start playing games to see learning progress by subject here!"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {subjects.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.name} className="text-center">
                        <ProgressRing value={s.value} color={s.color} label={s.name} size={90} />
                        <div className="flex items-center justify-center gap-1 mt-2 text-lavender-400">
                          <Icon size={14} />
                          <span className="text-xs font-semibold">{s.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Weekly chart */}
              <h3 className="font-display font-bold text-lavender-500 mt-6 mb-3">Weekly Activity</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklyActivity.map((v, i) => {
                  const max = Math.max(...weeklyActivity, 1);
                  const pct = v > 0 ? Math.max(8, Math.round((v / max) * 100)) : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-lavender-400 font-semibold">{v > 0 ? v : ''}</span>
                      <motion.div
                        className="w-full rounded-t-xl bg-gradient-to-t from-sky-300 to-lavender-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                        style={{ minHeight: v > 0 ? 4 : 0 }}
                      />
                      <span className="text-xs text-lavender-400 font-semibold">{DAY_LABELS[i]}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Controls */}
            <div className="space-y-4">
              <Card className="p-4 sm:p-6">
                <h2 className="font-display text-xl font-bold text-lavender-500 mb-4">Controls</h2>
                <div className="space-y-4">
                  {/* Screen time slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-display font-semibold text-lavender-500 flex items-center gap-1.5">
                        <Clock size={16} /> Daily Limit
                      </span>
                      <span className="font-display font-bold text-lavender-500">{screenTimeLimit} min</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={120}
                      step={5}
                      value={screenTimeLimit}
                      onChange={debouncedSave}
                      className="w-full accent-lavender-400"
                    />
                  </div>
                  {/* Safe mode */}
                  <Toggle
                    label="Safe Mode"
                    desc="Filtered content only"
                    icon={<Shield size={16} />}
                    value={settings?.safe_mode ?? false}
                    onChange={(v) => saveSettings({ safe_mode: v })}
                  />
                  <Toggle
                    label="Notifications"
                    desc="Daily progress emails"
                    icon={<Bell size={16} />}
                    value={settings?.notifications ?? false}
                    onChange={(v) => saveSettings({ notifications: v })}
                  />
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="font-display text-xl font-bold text-lavender-500 mb-3">Security</h2>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-semibold text-lavender-500 flex items-center gap-1.5">
                    <Lock size={16} /> Parental PIN
                  </span>
                  <Badge color={hasPin ? 'mint' : 'blush'}>{hasPin ? 'Set' : 'Not Set'}</Badge>
                </div>
                <Button variant="secondary" size="sm" className="touch-target-sm w-full mt-3" onClick={() => setPinModalOpen(true)}>
                  {hasPin ? 'Change PIN' : 'Set PIN'}
                </Button>
              </Card>
            </div>
          </div>

          {/* Recent activity */}
          <Card className="p-4 sm:p-6 mt-6">
            <h2 className="font-display text-xl font-bold text-lavender-500 mb-4">Recent Activity</h2>
            {log.length === 0 ? (
              <EmptyState
                emoji="🎮"
                title="No activity yet"
                message="Start playing to see progress here!"
              />
            ) : (
              <div className="space-y-3">
                {log.slice(0, 8).map((a, i) => (
                  <motion.div
                    key={a.id ?? i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl">
                      {a.game_icon || '🎮'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-lavender-500 truncate">{a.game_title}</p>
                      <p className="text-xs text-lavender-400 line-clamp-2">{a.detail}</p>
                    </div>
                    <span className="text-xs text-lavender-300">{formatRelativeTime(a.created_at)}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {pinModalOpen && (
        <PinModal
          hasPin={hasPin}
          onClose={() => setPinModalOpen(false)}
          onSave={(newPin) => {
            saveSettings({ pin: newPin || null });
            setPinModalOpen(false);
          }}
        />
      )}
    </div>
  );
}



function Toggle({ label, desc, icon, value, onChange }: { label: string; desc: string; icon: React.ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-display font-semibold text-lavender-500 flex items-center gap-1.5">{icon} {label}</p>
        <p className="text-xs text-lavender-400">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-mint-400' : 'bg-lavender-200'}`}
        aria-label={label}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-soft"
          animate={{ left: value ? '26px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function PinPad({ onUnlock, expectedPin }: { onUnlock: () => void; expectedPin: string }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (n: string) => {
    if (pin.length >= 4) return;
    const np = pin + n;
    setPin(np);
    if (np.length === 4) {
      if (np === expectedPin) {
        setTimeout(onUnlock, 200);
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 500);
      }
    }
  };

  return (
    <div className="max-w-xs mx-auto">
      <div className={`flex justify-center gap-3 mb-6 ${error ? 'animate-wiggle' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-display text-2xl font-bold transition-colors ${
              error ? 'border-blush-400 bg-blush-100' : i < pin.length ? 'border-lavender-400 bg-lavender-100 text-lavender-500' : 'border-lavender-100 bg-white'
            }`}
          >
            {i < pin.length ? '•' : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((n, i) => (
          n === '' ? <div key={i} /> :
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => n === '⌫' ? setPin(pin.slice(0, -1)) : press(n)}
            className="h-16 rounded-2xl bg-lavender-100 text-lavender-500 font-display text-xl font-bold hover:bg-lavender-200"
          >
            {n}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function PinModal({ hasPin, onClose, onSave }: { hasPin: boolean; onClose: () => void; onSave: (pin: string) => void }) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const press = (which: 'new' | 'confirm', n: string) => {
    const setter = which === 'new' ? setNewPin : setConfirmPin;
    const current = which === 'new' ? newPin : confirmPin;
    if (current.length >= 4) return;
    setter(current + n);
    setError('');
  };

  const handleSave = () => {
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    onSave(newPin);
  };

  const handleClear = () => {
    onSave('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-lavender-500 mb-1">
            {hasPin ? 'Change PIN' : 'Set PIN'}
          </h2>
          <p className="text-sm text-lavender-400 mb-4">Choose a 4-digit PIN to lock the parent dashboard.</p>

          <PinEntryField label="New PIN" value={newPin} onPress={(n) => press('new', n)} />
          <PinEntryField label="Confirm PIN" value={confirmPin} onPress={(n) => press('confirm', n)} />

          {error && <p className="text-sm text-blush-500 mb-3">{error}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            {hasPin && (
              <Button variant="secondary" size="sm" className="flex-1" onClick={handleClear}>Remove PIN</Button>
            )}
            <Button size="sm" className="flex-1" onClick={handleSave}>Save</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function PinEntryField({ label, value, onPress }: { label: string; value: string; onPress: (n: string) => void }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-lavender-400 mb-2">{label}</p>
      <div className="flex justify-center gap-3 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-display text-2xl font-bold transition-colors ${
              i < value.length ? 'border-lavender-400 bg-lavender-100 text-lavender-500' : 'border-lavender-100 bg-white'
            }`}
          >
            {i < value.length ? '•' : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((n, i) => (
          n === '' ? <div key={i} /> :
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => n === '⌫' ? onPress('') : onPress(n)}
            className="h-14 rounded-2xl bg-lavender-100 text-lavender-500 font-display text-xl font-bold hover:bg-lavender-200"
          >
            {n}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
