import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Undo, Redo, Download, Trash2, Palette, Sparkles, Brush, Save, Heart, X } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button, Card, Badge } from '@/components/ui';
import { getSavedDrawings, saveDrawing, deleteDrawing } from '@/lib/db';
import type { SavedDrawing } from '@/lib/db';
import { showToast } from '@/components/ui';

const COLORS = [
  '#ff7fbf', '#ff8f63', '#ffd24d', '#34c187', '#38bdf8', '#9d7ce6',
  '#ff5fb0', '#ff6b6b', '#fbbf24', '#10b981', '#0ea5e9', '#8b5cf6',
  '#ffc9e3', '#ffe2cc', '#fff0bf', '#c4f5e0', '#bae6fd', '#d4c5f6',
];

const BRUSH_SIZES = [6, 12, 20, 30];

const TEMPLATES = [
  { id: 'star', label: 'Star', render: (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    const cx = 250, cy = 200, spikes = 5, outer = 120, inner = 50;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4a3a6b';
    ctx.stroke();
  }},
  { id: 'heart', label: 'Heart', render: (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(250, 320);
    ctx.bezierCurveTo(100, 200, 100, 80, 250, 160);
    ctx.bezierCurveTo(400, 80, 400, 200, 250, 320);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4a3a6b';
    ctx.stroke();
  }},
  { id: 'flower', label: 'Flower', render: (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.ellipse(250 + Math.cos(a) * 70, 200 + Math.sin(a) * 70, 45, 70, a, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#4a3a6b';
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(250, 200, 35, 0, Math.PI * 2);
    ctx.stroke();
  }},
];

export default function Coloring() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [activeTemplate, setActiveTemplate] = useState('star');
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 500;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffbf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
    drawTemplate('star');
    loadDrawings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDrawings = useCallback(async () => {
    try {
      const drawings = await getSavedDrawings();
      setSavedDrawings(drawings);
    } catch (e) {
      console.error('Failed to load saved drawings:', e);
    }
  }, []);

  const drawTemplate = (id: string) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = '#fffbf5';
    ctx.fillRect(0, 0, 500, 400);
    const t = TEMPLATES.find((x) => x.id === id);
    if (t) t.render(ctx);
    setActiveTemplate(id);
    saveState();
  };

  const saveState = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((h) => {
      const newH = [...h.slice(0, historyIdx + 1), data];
      return newH.slice(-20);
    });
    setHistoryIdx((i) => Math.min(i + 1, 19));
  };

  const restore = (idx: number) => {
    const ctx = ctxRef.current;
    if (!ctx || !history[idx]) return;
    ctx.putImageData(history[idx], 0, 0);
    setHistoryIdx(idx);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = isEraser ? '#fffbf5' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = isEraser ? '#fffbf5' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stop = () => {
    if (!drawing) return;
    setDrawing(false);
    ctxRef.current?.beginPath();
    saveState();
  };

  const clear = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = '#fffbf5';
    ctx.fillRect(0, 0, 500, 400);
    drawTemplate(activeTemplate);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-wonderkids-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const saveToCloud = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const imageData = canvas.toDataURL('image/png');
      await saveDrawing('My Art', activeTemplate, imageData);
      showToast('Drawing saved to your gallery!', 'success', '🎨');
      await loadDrawings();
    } catch (e) {
      console.error('Failed to save drawing:', e);
      showToast('Could not save drawing. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteSaved = async (id: string) => {
    try {
      await deleteDrawing(id);
      await loadDrawings();
      showToast('Drawing deleted', 'info');
    } catch (e) {
      console.error('Failed to delete drawing:', e);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-20 md:pb-8 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge color="peach" className="mb-3"><Sparkles size={14} /> Magic Canvas</Badge>
            <h1 className="font-display text-fluid-h2 font-bold text-lavender-500">Rainbow Coloring</h1>
            <p className="text-lavender-400 mt-2 text-fluid-body">Pick a template, choose your colors, and create something wonderful!</p>
          </motion.div>

          <div className="mt-6 sm:mt-8 grid lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">
            {/* Canvas */}
            <Card className="p-4 sm:p-6">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={start}
                  onMouseMove={draw}
                  onMouseUp={stop}
                  onMouseLeave={stop}
                  onTouchStart={start}
                  onTouchMove={draw}
                  onTouchEnd={stop}
                  className="rounded-3xl shadow-soft touch-none cursor-crosshair max-w-full"
                  style={{ aspectRatio: '5/4', width: '100%', maxWidth: 500 }}
                />
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <ToolBtn onClick={() => setIsEraser(false)} active={!isEraser} icon={<Brush size={18} />} label="Brush" />
                <ToolBtn onClick={() => setIsEraser(true)} active={isEraser} icon={<Eraser size={18} />} label="Eraser" />
                <ToolBtn onClick={() => restore(Math.max(0, historyIdx - 1))} icon={<Undo size={18} />} label="Undo" />
                <ToolBtn onClick={() => restore(Math.min(history.length - 1, historyIdx + 1))} icon={<Redo size={18} />} label="Redo" />
                <ToolBtn onClick={clear} icon={<Trash2 size={18} />} label="Clear" />
                <ToolBtn onClick={download} icon={<Download size={18} />} label="Save" />
                <ToolBtn onClick={saveToCloud} icon={<Save size={18} />} label="Cloud" />
                <ToolBtn onClick={() => setShowGallery(true)} icon={<Heart size={18} />} label="Gallery" />
              </div>
            </Card>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Templates */}
              <Card className="p-4 sm:p-5">
                <h3 className="font-display font-bold text-lavender-500 mb-3">Templates</h3>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => drawTemplate(t.id)}
                      className={`p-3 rounded-2xl font-display font-semibold text-sm transition-all ${
                        activeTemplate === t.id ? 'bg-gradient-to-r from-sky-300 to-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Colors */}
              <Card className="p-4 sm:p-5">
                <h3 className="font-display font-bold text-lavender-500 mb-3 flex items-center gap-1.5">
                  <Palette size={18} /> Colors
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((c) => (
                    <motion.button
                      key={c}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setColor(c); setIsEraser(false); }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-soft border-2 touch-target-sm ${color === c && !isEraser ? 'border-lavender-500 scale-110' : 'border-white'}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </Card>

              {/* Brush size */}
              <Card className="p-4 sm:p-5">
                <h3 className="font-display font-bold text-lavender-500 mb-3">Brush Size</h3>
                <div className="flex items-center justify-between gap-2">
                  {BRUSH_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setBrushSize(s)}
                      className={`flex-1 flex items-center justify-center p-2 rounded-2xl transition-all touch-target-sm ${brushSize === s ? 'bg-lavender-200' : 'bg-lavender-50'}`}
                    >
                      <div className="rounded-full bg-lavender-400" style={{ width: s, height: s }} />
                    </button>
                  ))}
                </div>
              </Card>

              <Button onClick={saveToCloud} className="w-full" icon disabled={saving}>
                {saving ? 'Saving...' : 'Save to Gallery'}
              </Button>
              <Button onClick={() => setShowGallery(true)} variant="secondary" className="w-full">
                My Gallery ({savedDrawings.length})
              </Button>
            </div>
          </div>
        </div>

      {/* Gallery Modal */}
      {showGallery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowGallery(false)}
          className="fixed inset-0 z-[200] bg-lavender-500/30 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-4xl shadow-soft-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-lavender-500">My Gallery</h3>
              <button onClick={() => setShowGallery(false)} className="p-2 rounded-2xl hover:bg-lavender-100">
                <X size={20} className="text-lavender-400" />
              </button>
            </div>
            {savedDrawings.length === 0 ? (
              <p className="text-center text-lavender-400 py-8">No saved drawings yet. Create and save your first masterpiece!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {savedDrawings.map((d) => (
                  <div key={d.id} className="relative group rounded-2xl overflow-hidden bg-white shadow-soft aspect-[5/4]">
                    <img src={d.image_data} alt={d.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteSaved(d.id)}
                      className="absolute top-1 right-1 p-1.5 rounded-xl bg-blush-400 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
    </div>
  );
}

function ToolBtn({ onClick, active, icon, label }: { onClick: () => void; active?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-display font-semibold text-sm transition-colors touch-target-sm ${
        active ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
