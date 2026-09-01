import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import {
  getAllLessonProgress, getLessonProgressById, startLesson, updateLessonStep,
  completeLesson, getTodayDailyGoal, getRecentDailyGoals, getAllSkillProgress,
} from './db';
import type { LessonProgress, DailyGoal, SkillProgress } from './db';

function useSessionReady() {
  const { session } = useAuth();
  return session;
}

// ─── Lesson Progress (all) ───
export function useLessonProgress() {
  const session = useSessionReady();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const p = await getAllLessonProgress();
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

  const start = useCallback(async (lessonId: string, totalSteps: number) => {
    await startLesson(lessonId, totalSteps);
    await refresh();
  }, [refresh]);

  const updateStep = useCallback(async (lessonId: string, stepIndex: number, stepsCompleted: number) => {
    await updateLessonStep(lessonId, stepIndex, stepsCompleted);
  }, []);

  const complete = useCallback(async (lessonId: string, score: number, xpEarned: number, totalSteps: number) => {
    await completeLesson(lessonId, score, xpEarned, totalSteps);
    await refresh();
  }, [refresh]);

  const isCompleted = useCallback((lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.status === 'completed');
  }, [progress]);

  const isInProgress = useCallback((lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.status === 'in-progress');
  }, [progress]);

  const getProgress = useCallback((lessonId: string) => {
    return progress.find((p) => p.lesson_id === lessonId) || null;
  }, [progress]);

  return { progress, loading, error, refresh, start, updateStep, complete, isCompleted, isInProgress, getProgress };
}

// ─── Single Lesson Progress ───
export function useSingleLessonProgress(lessonId: string | null) {
  const session = useSessionReady();
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!lessonId) { setProgress(null); setLoading(false); return; }
    setLoading(true);
    try {
      const p = await getLessonProgressById(lessonId);
      setProgress(p);
    } catch {
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (session) refresh();
    else { setProgress(null); setLoading(false); }
  }, [session, refresh]);

  return { progress, loading, refresh };
}

// ─── Daily Goal ───
export function useDailyGoal() {
  const session = useSessionReady();
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const g = await getTodayDailyGoal();
      setGoal(g);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setGoal(null); setLoading(false); }
  }, [session, refresh]);

  return { goal, loading, error, refresh };
}

// ─── Recent Daily Goals (history) ───
export function useRecentDailyGoals(limit: number = 7) {
  const session = useSessionReady();
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const g = await getRecentDailyGoals(limit);
      setGoals(g);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (session) refresh();
    else { setGoals([]); setLoading(false); }
  }, [session, refresh]);

  return { goals, loading, refresh };
}

// ─── Skill Progress ───
export function useSkillProgress() {
  const session = useSessionReady();
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const s = await getAllSkillProgress();
      setSkills(s);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
    else { setSkills([]); setLoading(false); }
  }, [session, refresh]);

  const getSkill = useCallback((key: string) => {
    return skills.find((s) => s.skill_key === key) || null;
  }, [skills]);

  return { skills, loading, error, refresh, getSkill };
}
