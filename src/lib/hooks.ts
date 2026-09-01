import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import {
  getProfile, updateProfile, getGameProgress, getAllGameProgress, recordGamePlay,
  getGameStats, getAllGameStats, rateGame, getAchievements, getBadges, addBadge,
  getDailyChallenges, completeDailyChallenge, getFavorites, toggleFavorite,
  getSettings, updateSettings, getActivityLog, addActivityLog, getTestimonials,
  getShopPurchases, purchaseShopItem, equipAvatar, equipTheme,
} from './db';
import type {
  Profile, GameProgress, GameStat, Achievement, Badge, DailyChallenge,
  Favorite, Settings, ActivityLog, Testimonial,
} from './db';

function useSessionReady() {
  const { session } = useAuth();
  return session;
}

// ─── Profile ───
export function useProfile() {
  const session = useSessionReady();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      console.error('[useProfile] failed to load profile:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setProfile(null); setLoading(false); }
  }, [session, refresh]);

  const save = useCallback(async (updates: Partial<Profile>) => {
    await updateProfile(updates);
    await refresh();
  }, [refresh]);

  return { profile, loading, error, refresh, save };
}

// ─── Game Progress ───
export function useGameProgress() {
  const session = useSessionReady();
  const [progress, setProgress] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const p = await getAllGameProgress();
      setProgress(p);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setProgress([]); setLoading(false); }
  }, [session, refresh]);

  const recordPlay = useCallback(async (gameId: string, stars: number, score: number | null, gameTitle: string, gameIcon: string) => {
    await recordGamePlay(gameId, stars, score);
    await addActivityLog(gameId, gameTitle, gameIcon, stars > 0 ? `Earned ${stars} star${stars !== 1 ? 's' : ''}` : 'Played');
    await refresh();
  }, [refresh]);

  return { progress, loading, error, refresh, recordPlay };
}

// ─── Game Stats ───
export function useGameStats() {
  const session = useSessionReady();
  const [stats, setStats] = useState<Map<string, GameStat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const s = await getAllGameStats();
      setStats(new Map(s.map((stat) => [stat.game_id, stat])));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setStats(new Map()); setLoading(false); }
  }, [session, refresh]);

  const rate = useCallback(async (gameId: string, rating: number) => {
    await rateGame(gameId, rating);
    await refresh();
  }, [refresh]);

  return { stats, loading, error, refresh, rate };
}

// ─── Achievements ───
export function useAchievements() {
  const session = useSessionReady();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const a = await getAchievements();
      setAchievements(a);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setAchievements([]); setLoading(false); }
  }, [session, refresh]);

  return { achievements, loading, error, refresh };
}

// ─── Badges ───
export function useBadges() {
  const session = useSessionReady();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const b = await getBadges();
      setBadges(b);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setBadges([]); setLoading(false); }
  }, [session, refresh]);

  const add = useCallback(async (key: string, label: string, icon: string, color: string) => {
    await addBadge(key, label, icon, color);
    await refresh();
  }, [refresh]);

  return { badges, loading, error, refresh, add };
}

// ─── Daily Challenges ───
export function useDailyChallenges() {
  const session = useSessionReady();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const c = await getDailyChallenges();
      setChallenges(c);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setChallenges([]); setLoading(false); }
  }, [session, refresh]);

  const complete = useCallback(async (key: string) => {
    await completeDailyChallenge(key);
    await refresh();
  }, [refresh]);

  return { challenges, loading, error, refresh, complete };
}

// ─── Favorites ───
export function useFavorites() {
  const session = useSessionReady();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const favs = await getFavorites();
      setFavorites(new Set(favs.map((f) => f.game_id)));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setFavorites(new Set()); setLoading(false); }
  }, [session, refresh]);

  const toggle = useCallback(async (gameId: string) => {
    const isFav = await toggleFavorite(gameId);
    await refresh();
    return isFav;
  }, [refresh]);

  return { favorites, loading, error, refresh, toggle };
}

// ─── Settings ───
export function useSettings() {
  const session = useSessionReady();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const s = await getSettings();
      setSettings(s);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setSettings(null); setLoading(false); }
  }, [session, refresh]);

  const save = useCallback(async (updates: Partial<Settings>) => {
    await updateSettings(updates);
    await refresh();
  }, [refresh]);

  return { settings, loading, error, refresh, save };
}

// ─── Activity Log ───
export function useActivityLog(limit: number = 10) {
  const session = useSessionReady();
  const [log, setLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const l = await getActivityLog(limit);
      setLog(l);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (session) refresh();
    else { setLog([]); setLoading(false); }
  }, [session, refresh]);

  return { log, loading, error, refresh };
}

// ─── Shop ───
export function useShop() {
  const session = useSessionReady();
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getShopPurchases();
      setPurchases(new Set(p.map((x) => x.item_key)));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setPurchases(new Set()); setLoading(false); }
  }, [session, refresh]);

  const purchase = useCallback(async (itemKey: string) => {
    const result = await purchaseShopItem(itemKey);
    if (result.success) await refresh();
    return result;
  }, [refresh]);

  const equip = useCallback(async (itemKey: string, type: string) => {
    if (type === 'avatar') await equipAvatar(itemKey);
    else if (type === 'theme') await equipTheme(itemKey);
  }, []);

  return { purchases, loading, refresh, purchase, equip };
}

// ─── Testimonials ───
export function useTestimonials() {
  const session = useSessionReady();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const t = await getTestimonials();
      setTestimonials(t);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setTestimonials([]); setLoading(false); }
  }, [session, refresh]);

  return { testimonials, loading, error, refresh };
}
