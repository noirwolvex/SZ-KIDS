import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eraser, Palette, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { saveDrawing } from '@/lib/db';
import { showToast } from '@/components/ui';

type TemplateId = 'fox' | 'dino' | 'bunny' | 'unicorn';

type Props = {
  templateId: TemplateId;
  onBack: () => void;
};

const COLORS = ['#ff7fbf', '#ff8f63', '#ffd24d', '#34c187', '#38bdf8', '#9d7ce6', '#ff5fb0', '#10b981', '#0ea5e9', '#8b5cf6', '#ffc9e3', '#c4f5e0'];
const LABELS: Record<TemplateId, string> = { fox: 'Happy Fox', dino: 'Dino Buddy', bunny: 'Bunny Hop', unicorn: 'Magic Unicorn' };

function StaticPicture({ templateId }: { templateId: TemplateId }) {
  const common = { fill: '#fffdf8', stroke: '#4a3a6b', strokeWidth: 7, strokeLinejoin: 'round' as const };

  if (templateId === 'dino') {
    return (
      <svg viewBox="0 0 900 680" className="absolute inset-0 h-full w-full" aria-label="Dino coloring picture" role="img">
        <path {...common} d="M270 505 Q205 445 260 350 Q310 270 430 290 Q490 225 575 260 Q650 280 630 360 Q705 385 665 445 Q625 490 550 475 L510 550 L445 545 L435 480 Q370 555 315 545 Z" />
        <circle cx="565" cy="325" r="17" fill="#4a3a6b" /><circle cx="600" cy="405" r="20" fill="#c4f5e0" stroke="#4a3a6b" strokeWidth="6" />
        <path d="M305 320 L255 275 L290 268 L330 300 M390 270 L375 215 L410 235 L435 270 M480 255 L485 200 L520 235" fill="none" stroke="#4a3a6b" strokeWidth="10" strokeLinecap="round" />
      </svg>
    );
  }

  if (templateId === 'bunny') {
    return (
      <svg viewBox="0 0 900 680" className="absolute inset-0 h-full w-full" aria-label="Bunny coloring picture" role="img">
        <ellipse {...common} cx="450" cy="430" rx="245" ry="180" />
        <ellipse {...common} cx="345" cy="210" rx="82" ry="180" transform="rotate(-12 345 210)" />
        <ellipse {...common} cx="555" cy="210" rx="82" ry="180" transform="rotate(12 555 210)" />
        <circle cx="380" cy="400" r="20" fill="#4a3a6b" /><circle cx="520" cy="400" r="20" fill="#4a3a6b" />
        <path d="M425 450 Q450 475 475 450 M450 465 L450 485" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round" />
        <circle {...common} cx="270" cy="515" r="70" />
      </svg>
    );
  }

  if (templateId === 'unicorn') {
    return (
      <svg viewBox="0 0 900 680" className="absolute inset-0 h-full w-full" aria-label="Unicorn coloring picture" role="img">
        <path {...common} d="M230 510 Q190 400 260 330 Q330 260 440 305 Q500 275 570 315 Q610 335 590 380 Q660 405 610 465 Q555 520 470 495 Q405 555 315 545 Z" />
        <path {...common} d="M460 315 L520 175 L555 320 Z" />
        <path d="M285 335 Q230 295 260 220 Q315 270 330 325" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="7" />
        <circle cx="510" cy="375" r="17" fill="#4a3a6b" />
        <path d="M445 405 Q475 435 505 405 M385 320 Q330 270 320 205" fill="none" stroke="#4a3a6b" strokeWidth="9" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 900 680" className="absolute inset-0 h-full w-full" aria-label="Fox coloring picture" role="img">
      <path {...common} d="M220 520 Q180 450 230 390 Q280 320 360 330 Q405 270 485 285 Q555 295 575 350 Q650 375 610 450 Q570 505 485 485 Q430 555 335 535 Z" />
      <path {...common} d="M290 345 Q240 295 255 220 Q315 255 330 325 M350 320 Q340 250 395 220 Q430 275 410 325" />
      <circle cx="405" cy="365" r="19" fill="#4a3a6b" /><circle cx="495" cy="365" r="19" fill="#4a3a6b" />
      <path d="M435 415 Q450 432 465 415" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round" />
      <path d="M240 425 Q195 420 185 455 Q205 480 250 465" fill="none" stroke="#4a3a6b" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export default function ColoringStudio({ templateId, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(18);
  const [isEraser, setIsEraser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 900;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setReady(true);
  }, [templateId]);

  const point = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const source = 'touches' in event ? event.touches[0] : event;
    return { x: ((source.clientX - rect.left) / rect.width) * canvas.width, y: ((source.clientY - rect.top) / rect.height) * canvas.height };
  };

  const start = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!ready) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = isEraser ? '#fffdf8' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !ready) return;
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    ctx.strokeStyle = isEraser ? '#fffdf8' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.4 : brushSize;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const stop = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const serializePicture = () => {
    const drawing = canvasRef.current?.toDataURL('image/png') ?? '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680"><rect width="900" height="680" fill="#fffdf8"/><g>${pictureMarkup(templateId)}</g>${drawing ? `<image href="${drawing}" width="900" height="680"/>` : ''}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const saveCloud = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveDrawing(LABELS[templateId], templateId, serializePicture());
      showToast('Picture saved to your gallery!', 'success', '🎨');
    } catch (error) {
      console.error('[ColoringStudio] save failed:', error);
      showToast('Could not save picture. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = `${templateId}-wonderkids.svg`;
    link.href = serializePicture();
    link.click();
  };

  return (
    <div className="relative min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute left-[8%] top-20 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl" /><div className="absolute right-[8%] top-40 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl" /></div>
      <div className="relative mx-auto max-w-6xl">
        <motion.button type="button" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/75 px-4 py-2.5 font-display text-sm font-bold text-lavender-500 shadow-soft backdrop-blur-xl"><ArrowLeft size={17} /> Back to Games</motion.button>
        <div className="mt-5 rounded-[2rem] border border-white/90 bg-white/55 p-4 shadow-[0_30px_90px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div><div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500"><Palette size={14} /> Color &amp; Draw Studio</div><div className="mt-3 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-soft">🎨</span><div><h1 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">{LABELS[templateId]}</h1><p className="text-sm text-lavender-400">Color the picture, add your own touches, and save your masterpiece.</p></div></div></div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-400"><Sparkles size={14} /> {ready ? 'Ready to color' : 'Loading picture...'}</div>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="relative aspect-[900/680] overflow-hidden rounded-[1.7rem] border border-white/90 bg-[#fffdf8] shadow-soft">
                <StaticPicture templateId={templateId} />
                <canvas ref={canvasRef} width={900} height={680} onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} className="absolute inset-0 h-full w-full touch-none cursor-crosshair" aria-label="Drawing layer" />
                {!ready && <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm"><div className="rounded-2xl bg-white px-4 py-3 font-display text-sm font-bold text-lavender-500 shadow-soft">Preparing your picture… ✨</div></div>}
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft"><h2 className="font-display font-bold text-lavender-500">Colors</h2><div className="mt-3 grid grid-cols-4 gap-2.5">{COLORS.map((item) => <motion.button key={item} type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => { setColor(item); setIsEraser(false); }} className={`h-11 w-11 rounded-full border-4 shadow-soft ${color === item && !isEraser ? 'border-lavender-500' : 'border-white'}`} style={{ backgroundColor: item }} aria-label={`Choose color ${item}`} />)}</div></div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft"><h2 className="font-display font-bold text-lavender-500">Brush</h2><div className="mt-3 grid grid-cols-3 gap-2">{[10,18,28].map((size) => <button key={size} type="button" onClick={() => setBrushSize(size)} className={`rounded-xl p-3 ${brushSize === size ? 'bg-lavender-200' : 'bg-lavender-50'}`}><span className="mx-auto block rounded-full bg-lavender-400" style={{ width: size, height: size }} /></button>)}</div></div>
                <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setIsEraser((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-display text-sm font-bold ${isEraser ? 'bg-lavender-400 text-white' : 'bg-white/80 text-lavender-500'}`}><Eraser size={17} /> Eraser</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-3 py-3 font-display text-sm font-bold text-lavender-500"><RotateCcw size={17} /> Reset</button></div>
                <div className="grid gap-2"><motion.button type="button" onClick={saveCloud} disabled={saving || !ready} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mint-400 via-sky-400 to-lavender-400 px-4 py-3.5 font-display font-bold text-white shadow-soft-lg disabled:cursor-not-allowed disabled:opacity-60"><Save size={17} /> {saving ? 'Saving...' : 'Save to Gallery'}</motion.button><motion.button type="button" onClick={download} disabled={!ready} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-3.5 font-display font-bold text-lavender-500 shadow-soft disabled:cursor-not-allowed disabled:opacity-60"><Download size={17} /> Save to Device</motion.button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pictureMarkup(templateId: TemplateId) {
  const stroke = 'stroke="#4a3a6b" stroke-width="7" stroke-linejoin="round"';
  if (templateId === 'dino') return `<path fill="#fffdf8" ${stroke} d="M270 505 Q205 445 260 350 Q310 270 430 290 Q490 225 575 260 Q650 280 630 360 Q705 385 665 445 Q625 490 550 475 L510 550 L445 545 L435 480 Q370 555 315 545 Z"/><circle cx="565" cy="325" r="17" fill="#4a3a6b"/><circle cx="600" cy="405" r="20" fill="#c4f5e0" ${stroke}/>`;
  if (templateId === 'bunny') return `<ellipse fill="#fffdf8" ${stroke} cx="450" cy="430" rx="245" ry="180"/><ellipse fill="#fffdf8" ${stroke} cx="345" cy="210" rx="82" ry="180" transform="rotate(-12 345 210)"/><ellipse fill="#fffdf8" ${stroke} cx="555" cy="210" rx="82" ry="180" transform="rotate(12 555 210)"/><circle cx="380" cy="400" r="20" fill="#4a3a6b"/><circle cx="520" cy="400" r="20" fill="#4a3a6b"/>`;
  if (templateId === 'unicorn') return `<path fill="#fffdf8" ${stroke} d="M230 510 Q190 400 260 330 Q330 260 440 305 Q500 275 570 315 Q610 335 590 380 Q660 405 610 465 Q555 520 470 495 Q405 555 315 545 Z"/><path fill="#fffdf8" ${stroke} d="M460 315 L520 175 L555 320 Z"/><circle cx="510" cy="375" r="17" fill="#4a3a6b"/>`;
  return `<path fill="#fffdf8" ${stroke} d="M220 520 Q180 450 230 390 Q280 320 360 330 Q405 270 485 285 Q555 295 575 350 Q650 375 610 450 Q570 505 485 485 Q430 555 335 535 Z"/><path fill="#fffdf8" ${stroke} d="M290 345 Q240 295 255 220 Q315 255 330 325 M350 320 Q340 250 395 220 Q430 275 410 325"/><circle cx="405" cy="365" r="19" fill="#4a3a6b"/><circle cx="495" cy="365" r="19" fill="#4a3a6b"/>`;
}
