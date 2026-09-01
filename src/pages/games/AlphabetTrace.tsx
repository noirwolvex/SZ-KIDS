import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Check } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7', '#EC4899', '#14B8A6', '#F59E0B'];

type Mode = 'uppercase' | 'lowercase';

type Stroke = { points: { x: number; y: number }[]; color: string };

// Letter stroke paths (normalized 0-100 coordinate space, drawn on a 100x100 canvas)
// Each letter is a set of strokes; each stroke is a polyline of points
const STROKE_PATHS: Record<string, { x: number; y: number }[][]> = {
  A: [[{ x: 10, y: 90 }, { x: 50, y: 10 }, { x: 90, y: 90 }], [{ x: 28, y: 55 }, { x: 72, y: 55 }]],
  B: [[{ x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 15, y: 10 }, { x: 65, y: 10 }, { x: 80, y: 25 }, { x: 80, y: 42 }, { x: 65, y: 50 }, { x: 15, y: 50 }], [{ x: 15, y: 50 }, { x: 70, y: 50 }, { x: 85, y: 62 }, { x: 85, y: 78 }, { x: 70, y: 90 }, { x: 15, y: 90 }]],
  C: [[{ x: 85, y: 20 }, { x: 60, y: 10 }, { x: 40, y: 10 }, { x: 20, y: 25 }, { x: 15, y: 50 }, { x: 20, y: 75 }, { x: 40, y: 90 }, { x: 60, y: 90 }, { x: 85, y: 80 }]],
  D: [[{ x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 15, y: 10 }, { x: 60, y: 15 }, { x: 80, y: 30 }, { x: 85, y: 50 }, { x: 80, y: 70 }, { x: 60, y: 85 }, { x: 15, y: 90 }]],
  E: [[{ x: 80, y: 10 }, { x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 15, y: 50 }, { x: 70, y: 50 }], [{ x: 15, y: 90 }, { x: 80, y: 90 }]],
  F: [[{ x: 80, y: 10 }, { x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 15, y: 50 }, { x: 65, y: 50 }]],
  G: [[{ x: 85, y: 20 }, { x: 60, y: 10 }, { x: 40, y: 10 }, { x: 20, y: 25 }, { x: 15, y: 50 }, { x: 20, y: 75 }, { x: 40, y: 90 }, { x: 60, y: 90 }, { x: 85, y: 80 }, { x: 85, y: 55 }, { x: 55, y: 55 }]],
  H: [[{ x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 85, y: 10 }, { x: 85, y: 90 }], [{ x: 15, y: 50 }, { x: 85, y: 50 }]],
  I: [[{ x: 50, y: 10 }, { x: 50, y: 90 }], [{ x: 30, y: 10 }, { x: 70, y: 10 }], [{ x: 30, y: 90 }, { x: 70, y: 90 }]],
  J: [[{ x: 30, y: 10 }, { x: 70, y: 10 }], [{ x: 55, y: 10 }, { x: 55, y: 75 }, { x: 45, y: 90 }, { x: 25, y: 90 }, { x: 15, y: 75 }]],
  K: [[{ x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 80, y: 15 }, { x: 15, y: 55 }], [{ x: 15, y: 55 }, { x: 80, y: 90 }]],
  L: [[{ x: 15, y: 10 }, { x: 15, y: 90 }], [{ x: 15, y: 90 }, { x: 80, y: 90 }]],
  M: [[{ x: 10, y: 90 }, { x: 10, y: 10 }], [{ x: 10, y: 10 }, { x: 50, y: 55 }], [{ x: 50, y: 55 }, { x: 90, y: 10 }], [{ x: 90, y: 10 }, { x: 90, y: 90 }]],
  N: [[{ x: 15, y: 90 }, { x: 15, y: 10 }], [{ x: 15, y: 10 }, { x: 85, y: 90 }], [{ x: 85, y: 90 }, { x: 85, y: 10 }]],
  O: [[{ x: 50, y: 10 }, { x: 75, y: 20 }, { x: 85, y: 50 }, { x: 75, y: 80 }, { x: 50, y: 90 }, { x: 25, y: 80 }, { x: 15, y: 50 }, { x: 25, y: 20 }, { x: 50, y: 10 }]],
  P: [[{ x: 15, y: 90 }, { x: 15, y: 10 }], [{ x: 15, y: 10 }, { x: 65, y: 10 }, { x: 82, y: 25 }, { x: 82, y: 42 }, { x: 65, y: 50 }, { x: 15, y: 50 }]],
  Q: [[{ x: 50, y: 10 }, { x: 75, y: 20 }, { x: 85, y: 50 }, { x: 75, y: 80 }, { x: 50, y: 90 }, { x: 25, y: 80 }, { x: 15, y: 50 }, { x: 25, y: 20 }, { x: 50, y: 10 }], [{ x: 60, y: 60 }, { x: 90, y: 95 }]],
  R: [[{ x: 15, y: 90 }, { x: 15, y: 10 }], [{ x: 15, y: 10 }, { x: 65, y: 10 }, { x: 82, y: 25 }, { x: 82, y: 42 }, { x: 65, y: 50 }, { x: 15, y: 50 }], [{ x: 15, y: 50 }, { x: 80, y: 90 }]],
  S: [[{ x: 82, y: 22 }, { x: 65, y: 10 }, { x: 35, y: 10 }, { x: 18, y: 22 }, { x: 18, y: 38 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 82, y: 62 }, { x: 82, y: 78 }, { x: 65, y: 90 }, { x: 35, y: 90 }, { x: 18, y: 78 }]],
  T: [[{ x: 10, y: 10 }, { x: 90, y: 10 }], [{ x: 50, y: 10 }, { x: 50, y: 90 }]],
  U: [[{ x: 15, y: 10 }, { x: 15, y: 75 }, { x: 25, y: 88 }, { x: 50, y: 90 }, { x: 75, y: 88 }, { x: 85, y: 75 }, { x: 85, y: 10 }]],
  V: [[{ x: 10, y: 10 }, { x: 50, y: 90 }], [{ x: 50, y: 90 }, { x: 90, y: 10 }]],
  W: [[{ x: 5, y: 10 }, { x: 25, y: 90 }], [{ x: 25, y: 90 }, { x: 40, y: 50 }], [{ x: 40, y: 50 }, { x: 55, y: 90 }], [{ x: 55, y: 90 }, { x: 95, y: 10 }]],
  X: [[{ x: 15, y: 10 }, { x: 85, y: 90 }], [{ x: 85, y: 10 }, { x: 15, y: 90 }]],
  Y: [[{ x: 10, y: 10 }, { x: 50, y: 55 }], [{ x: 90, y: 10 }, { x: 50, y: 55 }], [{ x: 50, y: 55 }, { x: 50, y: 90 }]],
  Z: [[{ x: 10, y: 10 }, { x: 90, y: 10 }], [{ x: 90, y: 10 }, { x: 10, y: 90 }], [{ x: 10, y: 90 }, { x: 90, y: 90 }]],
};

// Lowercase paths (simplified — positioned in lower portion of canvas)
const STROKE_PATHS_LOWER: Record<string, { x: number; y: number }[][]> = {
  a: [[{ x: 70, y: 50 }, { x: 50, y: 45 }, { x: 25, y: 52 }, { x: 18, y: 68 }, { x: 25, y: 82 }, { x: 50, y: 88 }, { x: 72, y: 82 }, { x: 72, y: 50 }], [{ x: 72, y: 50 }, { x: 72, y: 90 }]],
  b: [[{ x: 20, y: 10 }, { x: 20, y: 90 }], [{ x: 20, y: 45 }, { x: 50, y: 45 }, { x: 72, y: 55 }, { x: 72, y: 75 }, { x: 50, y: 88 }, { x: 20, y: 88 }]],
  c: [[{ x: 72, y: 55 }, { x: 50, y: 45 }, { x: 25, y: 55 }, { x: 18, y: 68 }, { x: 25, y: 82 }, { x: 50, y: 88 }, { x: 72, y: 78 }]],
  d: [[{ x: 72, y: 10 }, { x: 72, y: 90 }], [{ x: 72, y: 45 }, { x: 50, y: 45 }, { x: 25, y: 55 }, { x: 25, y: 75 }, { x: 50, y: 88 }, { x: 72, y: 88 }]],
  e: [[{ x: 72, y: 50 }, { x: 20, y: 50 }], [{ x: 20, y: 50 }, { x: 18, y: 68 }, { x: 25, y: 82 }, { x: 50, y: 88 }, { x: 72, y: 78 }, { x: 72, y: 68 }]],
  f: [[{ x: 60, y: 10 }, { x: 40, y: 10 }, { x: 25, y: 25 }], [{ x: 25, y: 25 }, { x: 25, y: 90 }], [{ x: 15, y: 50 }, { x: 55, y: 50 }]],
  g: [[{ x: 72, y: 45 }, { x: 50, y: 45 }, { x: 25, y: 55 }, { x: 25, y: 75 }, { x: 50, y: 88 }, { x: 72, y: 88 }], [{ x: 72, y: 45 }, { x: 72, y: 95 }, { x: 60, y: 105 }, { x: 40, y: 105 }]],
  h: [[{ x: 20, y: 10 }, { x: 20, y: 90 }], [{ x: 20, y: 50 }, { x: 50, y: 45 }, { x: 72, y: 50 }], [{ x: 72, y: 50 }, { x: 72, y: 90 }]],
  i: [[{ x: 40, y: 10 }, { x: 40, y: 15 }], [{ x: 40, y: 25 }, { x: 40, y: 90 }]],
  j: [[{ x: 45, y: 10 }, { x: 45, y: 15 }], [{ x: 45, y: 25 }, { x: 45, y: 80 }, { x: 35, y: 95 }, { x: 20, y: 95 }]],
  k: [[{ x: 20, y: 10 }, { x: 20, y: 90 }], [{ x: 60, y: 35 }, { x: 20, y: 60 }], [{ x: 20, y: 60 }, { x: 65, y: 90 }]],
  l: [[{ x: 35, y: 10 }, { x: 35, y: 90 }]],
  m: [[{ x: 15, y: 90 }, { x: 15, y: 50 }], [{ x: 15, y: 50 }, { x: 30, y: 42 }, { x: 45, y: 50 }], [{ x: 45, y: 50 }, { x: 60, y: 42 }, { x: 75, y: 50 }], [{ x: 75, y: 50 }, { x: 75, y: 90 }]],
  n: [[{ x: 20, y: 90 }, { x: 20, y: 50 }], [{ x: 20, y: 50 }, { x: 50, y: 42 }, { x: 72, y: 50 }], [{ x: 72, y: 50 }, { x: 72, y: 90 }]],
  o: [[{ x: 50, y: 45 }, { x: 72, y: 55 }, { x: 72, y: 75 }, { x: 50, y: 88 }, { x: 28, y: 75 }, { x: 28, y: 55 }, { x: 50, y: 45 }]],
  p: [[{ x: 20, y: 45 }, { x: 20, y: 100 }], [{ x: 20, y: 45 }, { x: 50, y: 45 }, { x: 72, y: 55 }, { x: 72, y: 75 }, { x: 50, y: 88 }, { x: 20, y: 88 }]],
  q: [[{ x: 72, y: 45 }, { x: 72, y: 100 }], [{ x: 72, y: 45 }, { x: 50, y: 45 }, { x: 25, y: 55 }, { x: 25, y: 75 }, { x: 50, y: 88 }, { x: 72, y: 88 }]],
  r: [[{ x: 20, y: 90 }, { x: 20, y: 50 }], [{ x: 20, y: 50 }, { x: 50, y: 45 }, { x: 60, y: 50 }]],
  s: [[{ x: 68, y: 55 }, { x: 50, y: 45 }, { x: 30, y: 55 }, { x: 30, y: 68 }, { x: 50, y: 75 }, { x: 68, y: 82 }, { x: 68, y: 92 }, { x: 50, y: 98 }, { x: 30, y: 92 }]],
  t: [[{ x: 25, y: 15 }, { x: 55, y: 15 }], [{ x: 40, y: 15 }, { x: 40, y: 90 }]],
  u: [[{ x: 20, y: 50 }, { x: 20, y: 80 }, { x: 30, y: 88 }, { x: 50, y: 88 }, { x: 70, y: 80 }, { x: 70, y: 50 }]],
  v: [[{ x: 20, y: 50 }, { x: 45, y: 90 }], [{ x: 45, y: 90 }, { x: 70, y: 50 }]],
  w: [[{ x: 15, y: 50 }, { x: 30, y: 90 }], [{ x: 30, y: 90 }, { x: 42, y: 65 }], [{ x: 42, y: 65 }, { x: 55, y: 90 }], [{ x: 55, y: 90 }, { x: 70, y: 50 }]],
  x: [[{ x: 22, y: 50 }, { x: 68, y: 90 }], [{ x: 68, y: 50 }, { x: 22, y: 90 }]],
  y: [[{ x: 20, y: 50 }, { x: 45, y: 70 }], [{ x: 70, y: 50 }, { x: 45, y: 70 }], [{ x: 45, y: 70 }, { x: 45, y: 95 }]],
  z: [[{ x: 22, y: 50 }, { x: 68, y: 50 }], [{ x: 68, y: 50 }, { x: 22, y: 90 }], [{ x: 22, y: 90 }, { x: 68, y: 90 }]],
};

function getStrokes(letter: string, mode: Mode): { x: number; y: number }[][] {
  if (mode === 'lowercase') {
    const lower = letter.toLowerCase();
    return STROKE_PATHS_LOWER[lower] || STROKE_PATHS[letter] || [];
  }
  return STROKE_PATHS[letter] || [];
}

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.7;
  u.pitch = 1.3;
  window.speechSynthesis.speak(u);
};

// Distance from point to line segment
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Check how well the user's strokes match the template
function evaluateAccuracy(userStrokes: Stroke[], template: { x: number; y: number }[][]): number {
  if (userStrokes.length === 0) return 0;
  let totalDist = 0;
  let totalPoints = 0;

  for (const stroke of userStrokes) {
    for (const pt of stroke.points) {
      let minDist = Infinity;
      for (const tmplStroke of template) {
        for (let i = 0; i < tmplStroke.length - 1; i++) {
          const d = distToSegment(pt.x, pt.y, tmplStroke[i].x, tmplStroke[i].y, tmplStroke[i + 1].x, tmplStroke[i + 1].y);
          if (d < minDist) minDist = d;
        }
      }
      totalDist += minDist;
      totalPoints++;
    }
  }

  if (totalPoints === 0) return 0;
  const avgDist = totalDist / totalPoints;
  // Convert distance to accuracy: 15px = perfect, 40px = poor
  const accuracy = Math.max(0, Math.min(100, 100 - (avgDist - 8) * 3));
  return Math.round(accuracy);
}

export default function AlphabetTrace({ onClose, onWin }: GameProps) {
  const [mode, setMode] = useState<Mode>('uppercase');
  const [letterIdx, setLetterIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [colorIdx, setColorIdx] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);
  const canvasSize = 280;

  const totalRounds = 10;
  const letter = LETTERS[letterIdx];
  const displayChar = mode === 'lowercase' ? letter.toLowerCase() : letter;
  const template = getStrokes(letter, mode);

  const reset = useCallback((m: Mode) => {
    setMode(m);
    setLetterIdx(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setColorIdx(0);
    setStrokes([]);
    setAccuracy(null);
    setShowResult(false);
    setCompleted([]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (status === 'playing') speak(displayChar);
  }, [letterIdx, mode, status]);

  // Draw template guide + user strokes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw dashed template guide
    ctx.strokeStyle = `${COLORS[colorIdx]}25`;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([6, 8]);

    for (const stroke of template) {
      ctx.beginPath();
      for (let i = 0; i < stroke.length; i++) {
        const x = (stroke[i].x / 100) * canvasSize;
        const y = (stroke[i].y / 100) * canvasSize;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw directional arrows on template
    ctx.fillStyle = `${COLORS[colorIdx]}40`;
    for (const stroke of template) {
      if (stroke.length < 2) continue;
      const x = (stroke[0].x / 100) * canvasSize;
      const y = (stroke[0].y / 100) * canvasSize;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw user strokes
    for (const stroke of strokes) {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }, [strokes, template, colorIdx, canvasSize]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasSize,
      y: ((e.clientY - rect.top) / rect.height) * canvasSize,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== 'playing' || showResult) return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    currentStroke.current = { points: [pos], color: COLORS[colorIdx] };
    setStrokes((prev) => [...prev, currentStroke.current!]);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    currentStroke.current.points.push(pos);
    // Force re-render by creating a new array reference
    setStrokes((prev) => [...prev]);
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
    currentStroke.current = null;
  };

  const clearCanvas = () => {
    setStrokes([]);
    setAccuracy(null);
  };

  const checkTracing = () => {
    if (strokes.length === 0) return;
    // Convert user strokes to 0-100 coordinate space
    const normalized = strokes.map((s) => ({
      ...s,
      points: s.points.map((p) => ({ x: (p.x / canvasSize) * 100, y: (p.y / canvasSize) * 100 })),
    }));
    const acc = evaluateAccuracy(normalized, template);
    setAccuracy(acc);

    if (acc >= 55) {
      // Success
      setShowResult(true);
      setCompleted((c) => [...c, displayChar]);
      setTimeout(() => {
        if (letterIdx + 1 >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setLetterIdx((i) => i + 1);
          setColorIdx((c) => (c + 1) % COLORS.length);
          setStrokes([]);
          setAccuracy(null);
          setShowResult(false);
        }
      }, 1400);
    } else {
      // Poor tracing — lose a life
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) {
          setStatus('lost');
          setRunning(false);
        }
        return nl;
      });
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setStrokes([]);
        setAccuracy(null);
      }, 1200);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Alphabet Trace"
      gradient="from-sky-200 to-lavender-200"
      emoji="✏️"
      onClose={onClose}
      onRestart={() => reset(mode)}
      status={status}
      stars={stars}
      winMessage="Alphabet Ace!"
      winDetail={`You traced ${completed.length} letters in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${letterIdx + 1}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
      difficultySelector={
        (['uppercase', 'lowercase'] as const).map((m) => (
          <button
            key={m}
            onClick={() => reset(m)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all capitalize ${
              mode === m ? 'bg-lavender-400 text-white shadow-soft' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
            }`}
          >
            {m === 'uppercase' ? 'A B C' : 'a b c'}
          </button>
        ))
      }
    >
      <div className="flex flex-col items-center">
        {/* Letter display + canvas */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-base sm:text-lg text-lavender-400 mb-2"
        >
          Trace the letter {displayChar}!
        </motion.p>

        <div className="relative">
          {/* Background letter hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="font-display font-bold text-[180px] leading-none opacity-8"
              style={{ color: COLORS[colorIdx], opacity: 0.08 }}
            >
              {displayChar}
            </span>
          </div>

          {/* Canvas */}
          <motion.div
            key={letterIdx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              className="rounded-3xl bg-white shadow-soft-lg cursor-crosshair touch-none"
              style={{ width: canvasSize, height: canvasSize }}
            />
          </motion.div>

          {/* Result overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm ${
                  accuracy !== null && accuracy >= 55 ? 'bg-mint-400/30' : 'bg-blush-400/30'
                }`}
              >
                {accuracy !== null && accuracy >= 55 ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                      <Check size={64} className="text-mint-500" strokeWidth={3} />
                    </motion.div>
                    <p className="font-display font-bold text-2xl text-mint-500 mt-2">Great!</p>
                    <p className="font-display text-sm text-mint-400">{accuracy}% accurate</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ x: [-6, 6, -6, 6, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-5xl">✏️</span>
                    </motion.div>
                    <p className="font-display font-bold text-xl text-blush-500 mt-2">Try again!</p>
                    <p className="font-display text-sm text-blush-400">{accuracy !== null ? `${accuracy}% — follow the dots!` : 'Follow the dotted lines!'}</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accuracy meter */}
        {accuracy !== null && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2"
          >
            <div className="w-32 h-2.5 rounded-full bg-lavender-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${accuracy >= 55 ? 'bg-mint-400' : 'bg-blush-400'}`}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className={`font-display font-bold text-sm ${accuracy >= 55 ? 'text-mint-500' : 'text-blush-500'}`}>{accuracy}%</span>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak(displayChar)}
            className="px-4 py-2.5 rounded-2xl bg-sky-100 text-sky-500 font-display font-semibold text-sm shadow-soft flex items-center gap-1.5 touch-target-sm"
          >
            <Volume2 size={16} /> Hear it
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            disabled={strokes.length === 0 || showResult}
            className="px-4 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-semibold text-sm shadow-soft flex items-center gap-1.5 disabled:opacity-50 touch-target-sm"
          >
            <RotateCcw size={16} /> Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={checkTracing}
            disabled={strokes.length === 0 || showResult || status !== 'playing'}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-mint-300 to-mint-400 text-white font-display font-bold text-sm shadow-soft flex items-center gap-1.5 disabled:opacity-50 touch-target-sm"
          >
            <Check size={16} /> Check
          </motion.button>
        </div>

        {/* Completed letters progress */}
        <div className="mt-5 flex flex-wrap gap-1.5 justify-center max-w-xs">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                i < completed.length
                  ? 'bg-mint-200 text-mint-500'
                  : i === letterIdx
                  ? 'bg-sky-200 text-sky-500 ring-2 ring-sky-300'
                  : 'bg-lavender-50 text-lavender-300'
              }`}
            >
              {i < completed.length ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
