import { motion } from 'framer-motion';
import { ArrowLeft, Brush, Download, Eraser, Palette, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { saveDrawing } from '@/lib/db';
import { showToast } from '@/components/ui';

type TemplateId = 'fox' | 'dino' | 'bunny' | 'unicorn';

type Props = {
  templateId: TemplateId;
  onBack: () => void;
};

const COLORS = ['#ff7fbf', '#ff8f63', '#ffd24d', '#34c187', '#38bdf8', '#9d7ce6', '#ff5fb0', '#10b981', '#0ea5e9', '#8b5cf6', '#ffc9e3', '#c4f5e0'];

const LABELS: Record<TemplateId, string> = {
  fox: 'Happy Fox',
  dino: 'Dino Buddy',
  bunny: 'Bunny Hop',
  unicorn: 'Magic Unicorn',
};

const BRUSH_SIZES = [10, 18, 28];

function Picture({ templateId }: { templateId: TemplateId }) {
  const stroke = '#4a3a6b';

  if (templateId === 'dino') {
    return (
      <svg viewBox="0 0 900 680" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label="Dino coloring picture">
        <defs><linearGradient id="dinoFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fffdf8" /><stop offset="1" stopColor="#f8fbff" /></linearGradient></defs>
        <path d="M270 505 Q205 445 260 350 Q310 270 430 290 Q490 225 575 260 Q650 280 630 360 Q705 385 665 445 Q625 490 550 475 L510 550 L445 545 L435 480 Q370 555 315 545 Z" fill="url(#dinoFill)" stroke={stroke} strokeWidth="9" strokeLinejoin="round" />
        <circle cx="565" cy="325" r="18" fill={stroke} />
        <path d="M305 320 L255 275 L290 268 L330 300 M390 270 L375 215 L410 235 L435 270 M480 255 L485 200 L520 235" fill="none" stroke={stroke} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="600" cy="405" r="20" fill="#c4f5e0" stroke={stroke} strokeWidth="7" />
      </svg>
    );
  }

  if (templateId === 'bunny') {
    return (
      <svg viewBox="0 0 900 680" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label="Bunny coloring picture">
        <ellipse cx="450" cy="430" rx="245" ry="180" fill="#fffdf8" stroke={stroke} strokeWidth="9" />
        <ellipse cx="345" cy="210" rx="82" ry="180" transform="rotate(-12 345 210)" fill="#fffdf8" stroke={stroke} strokeWidth="9" />
        <ellipse cx="555" cy="210" rx="82" ry="180" transform="rotate(12 555 210)" fill="#fffdf8" stroke={stroke} strokeWidth="9" />
        <circle cx="380" cy="400" r="20" fill={stroke} />
        <circle cx="520" cy="400" r="20" fill={stroke} />
        <path d="M425 450 Q450 475 475 450 M450 465 L450 485" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
        <circle cx="270" cy="515" r="70" fill="#fffdf8" stroke={stroke} strokeWidth="9" />
      </svg>
    );
  }

  if (templateId === 'unicorn') {
    return (
      <svg viewBox="0 0 900 680" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label="Unicorn coloring picture">
        <path d="M230 510 Q190 400 260 330 Q330 260 440 305 Q500 275 570 315 Q610 335 590 380 Q660 405 610 465 Q555 520 470 495 Q405 555 315 545 Z" fill="#fffdf8" stroke={stroke} strokeWidth="9" strokeLinejoin="round" />
        <path d="M460 315 L520 175 L555 320 Z" fill="#fffdf8" stroke={stroke} strokeWidth="9" strokeLinejoin="round" />
        <path d="M285 335 Q230 295 260 220 Q315 270 330 325" fill="#fffdf8" stroke={stroke} strokeWidth="8" />
        <circle cx="510" cy="375" r="18" fill={stroke} />
        <path d="M445 405 Q475 435 505 405 M385 320 Q330 270 320 205" fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 900 680" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label="Fox coloring picture">
      <path d="M220 520 Q180 450 230 390 Q280 320 360 330 Q405 270 485 285 Q555 295 575 350 Q650 375 610 450 Q570 505 485 485 Q430 555 335 535 Z" fill="#fffdf8" stroke={stroke} strokeWidth="9" strokeLinejoin="round" />
      <path d="M290 345 Q240 295 255 220 Q315 255 330 325 M350 320 Q340 250 395 220 Q430 275 410 325" fill="#fffdf8" stroke={stroke} strokeWidth="9" strokeLinejoin="round" />
      <circle cx="405" cy="365" r="19" fill={stroke} />
      <circle cx="495" cy="365" r="19" fill={stroke} />
      <path d="M435 415 Q450 432 465 415" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
      <path d="M240 425 Q195 420 185 455 Q205 480 250 465" fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export default function ColoringStudio({ templateId, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(18);
  const [eraser, setEraser] = useState(false);
  const [saving, setSaving] = useState(false);

  const getPoint = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const source = 'touches' in event ? event.touches[0] : event;
    return {
      x: ((source.clientX - rect.left) / Math.max(rect.width, 1)) * canvas.width,
      y: ((source.clientY - rect.top) / Math.max(rect.height, 1)) * canvas.height,
    };
  };

  const begin = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.strokeStyle = eraser ? '#fffdf8' : color;
    ctx.lineWidth = eraser ? brushSize * 2.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const move = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const point = getPoint(event);
    ctx.strokeStyle = eraser ? '#fffdf8' : color;
    ctx.lineWidth = eraser ? brushSize * 2.5 : brushSize;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const end = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${templateId}-wonderkids.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const saveCloud = async () => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return;
    setSaving(true);
    try {
      await saveDrawing(LABELS[templateId], templateId, canvas.toDataURL('image/png'));
      showToast('Picture saved to your gallery!', 'success', '🎨');
    } catch (error) {
      console.error('[ColoringStudio] save failed:', error);
      showToast('Could not save picture. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-20 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-[8%] top-40 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.button type="button" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 font-display text-sm font-bold text-lavender-500 shadow-soft backdrop-blur-xl">
          <ArrowLeft size={17} /> Back to Games
        </motion.button>

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/90 bg-white/55 p-4 shadow-[0_30px_90px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm"><Palette size={14} /> Color &amp; Draw Studio</span>
                <div className="mt-3 flex items-center gap-3">
                  <motion.span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-soft" animate={{ y: [0, -5, 0], rotate: [-4, 4, -4] }} transition={{ duration: 2.6, repeat: Infinity }}>🎨</motion.span>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">{LABELS[templateId]}</h1>
                    <p className="text-sm text-lavender-400">Color the character, add your own details, and make it yours.</p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-400"><Sparkles size={14} /> Ready to create</span>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="relative aspect-[900/680] overflow-hidden rounded-[1.7rem] border border-white/90 bg-[#fffdf8] shadow-inner">
                <Picture templateId={templateId} />
                <canvas ref={canvasRef} width={900} height={680} onMouseDown={begin} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={begin} onTouchMove={move} onTouchEnd={end} className="absolute inset-0 h-full w-full touch-none cursor-crosshair" aria-label="Drawing layer" />
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-display font-bold text-lavender-400 shadow-sm backdrop-blur-md">Draw over the picture ✨</div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft">
                  <h2 className="font-display font-bold text-lavender-500">Colors</h2>
                  <div className="mt-3 grid grid-cols-4 gap-2.5">
                    {COLORS.map((item) => (
                      <motion.button key={item} type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setColor(item); setEraser(false); }} className={`h-11 w-11 rounded-full border-4 shadow-soft ${color === item && !eraser ? 'border-lavender-500' : 'border-white'}`} style={{ backgroundColor: item }} aria-label={`Choose color ${item}`} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft">
                  <h2 className="font-display font-bold text-lavender-500">Brush size</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {BRUSH_SIZES.map((size) => (
                      <button key={size} type="button" onClick={() => setBrushSize(size)} className={`rounded-xl p-3 ${brushSize === size ? 'bg-lavender-200' : 'bg-lavender-50'}`} aria-label={`Brush size ${size}`}>
                        <span className="mx-auto block rounded-full bg-lavender-400" style={{ width: size, height: size }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setEraser((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-display text-sm font-bold ${eraser ? 'bg-lavender-400 text-white' : 'bg-white/80 text-lavender-500'}`}><Eraser size={17} /> Eraser</button>
                  <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-3 py-3 font-display text-sm font-bold text-lavender-500"><RotateCcw size={17} /> Reset</button>
                </div>

                <div className="grid gap-2">
                  <motion.button type="button" onClick={saveCloud} disabled={saving} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint-400 via-sky-400 to-lavender-400 px-4 py-3.5 font-display font-bold text-white shadow-soft-lg disabled:opacity-60"><Save size={17} /> {saving ? 'Saving...' : 'Save to Gallery'}</motion.button>
                  <motion.button type="button" onClick={exportImage} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-3.5 font-display font-bold text-lavender-500 shadow-soft"><Download size={17} /> Save to Device</motion.button>
                  <button type="button" onClick={() => setEraser(false)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/65 px-4 py-3 text-sm font-display font-bold text-lavender-400"><Brush size={16} /> Back to brush</button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
