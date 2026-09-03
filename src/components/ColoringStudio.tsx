import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eraser, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

export default function ColoringStudio({ templateId, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(16);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    drawTemplate(templateId);
  }, [templateId]);

  const drawTemplate = (id: TemplateId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 900;
    canvas.height = 680;
    ctx.fillStyle = '#fffbf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(100, 40);
    ctx.scale(2.3, 2.3);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#4a3a6b';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    renderOutline(ctx, id);
    ctx.restore();
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#fffbf5' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = isEraser ? '#fffbf5' : color;
    ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  const clear = () => drawTemplate(templateId);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${templateId}-wonderkids.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-20 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute right-[8%] top-40 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.button type="button" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/75 px-4 py-2.5 font-display text-sm font-bold text-lavender-500 shadow-soft backdrop-blur-xl">
          <ArrowLeft size={17} /> Back to Games
        </motion.button>

        <div className="mt-5 rounded-[2rem] border border-white/90 bg-white/55 p-4 shadow-[0_30px_90px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500">
                  <Palette size={14} /> Color &amp; Draw Studio
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-soft">🎨</span>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">{LABELS[templateId]}</h1>
                    <p className="text-sm text-lavender-400">Color the big picture, then save your masterpiece.</p>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-400">
                <Sparkles size={14} /> New character canvas
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="rounded-[1.7rem] border border-white/90 bg-white/75 p-3 shadow-soft backdrop-blur-xl sm:p-5">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full rounded-[1.25rem] bg-[#fffbf5] shadow-inner touch-none cursor-crosshair"
                  style={{ aspectRatio: '900 / 680' }}
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft">
                  <h2 className="font-display font-bold text-lavender-500">Colors</h2>
                  <div className="mt-3 grid grid-cols-4 gap-2.5">
                    {COLORS.map((item) => (
                      <motion.button key={item} type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => { setColor(item); setIsEraser(false); }} className={`h-11 w-11 rounded-full border-4 shadow-soft ${color === item && !isEraser ? 'border-lavender-500' : 'border-white'}`} style={{ backgroundColor: item }} aria-label={`Choose color ${item}`} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft">
                  <h2 className="font-display font-bold text-lavender-500">Brush</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[10, 16, 24].map((size) => (
                      <button key={size} type="button" onClick={() => setBrushSize(size)} className={`rounded-xl p-3 ${brushSize === size ? 'bg-lavender-200' : 'bg-lavender-50'}`}>
                        <span className="mx-auto block rounded-full bg-lavender-400" style={{ width: size, height: size }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIsEraser((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-display text-sm font-bold ${isEraser ? 'bg-lavender-400 text-white' : 'bg-white/80 text-lavender-500'}`}>
                    <Eraser size={17} /> Eraser
                  </button>
                  <button type="button" onClick={clear} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-3 py-3 font-display text-sm font-bold text-lavender-500">
                    <RotateCcw size={17} /> Reset
                  </button>
                </div>

                <motion.button type="button" onClick={download} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-lavender-400 to-blush-400 px-4 py-3.5 font-display font-bold text-white shadow-soft-lg">
                  <Download size={17} /> Save Picture
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderOutline(ctx: CanvasRenderingContext2D, kind: TemplateId) {
  if (kind === 'dino') {
    ctx.beginPath();
    ctx.moveTo(63, 172);
    ctx.quadraticCurveTo(40, 146, 60, 113);
    ctx.quadraticCurveTo(83, 76, 136, 77);
    ctx.quadraticCurveTo(164, 44, 204, 61);
    ctx.quadraticCurveTo(239, 76, 226, 112);
    ctx.quadraticCurveTo(252, 125, 231, 149);
    ctx.quadraticCurveTo(215, 167, 188, 162);
    ctx.lineTo(170, 190);
    ctx.lineTo(141, 188);
    ctx.lineTo(136, 158);
    ctx.quadraticCurveTo(108, 190, 82, 188);
    ctx.closePath();
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(194, 92, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3a6b';
    ctx.fill();
    return;
  }

  if (kind === 'bunny') {
    ctx.beginPath();
    ctx.ellipse(151, 140, 83, 62, 0, 0, Math.PI * 2);
    ctx.ellipse(115, 63, 28, 60, -0.2, 0, Math.PI * 2);
    ctx.ellipse(185, 63, 28, 60, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(125, 130, 7, 0, Math.PI * 2);
    ctx.arc(176, 130, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3a6b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(85, 169, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (kind === 'unicorn') {
    ctx.beginPath();
    ctx.moveTo(74, 167);
    ctx.quadraticCurveTo(57, 120, 89, 94);
    ctx.quadraticCurveTo(119, 68, 169, 82);
    ctx.quadraticCurveTo(197, 66, 224, 84);
    ctx.quadraticCurveTo(241, 97, 230, 116);
    ctx.quadraticCurveTo(251, 127, 231, 148);
    ctx.quadraticCurveTo(211, 169, 174, 163);
    ctx.quadraticCurveTo(146, 191, 106, 185);
    ctx.closePath();
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(179, 84);
    ctx.lineTo(201, 33);
    ctx.lineTo(214, 86);
    ctx.closePath();
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(191, 108, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3a6b';
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(68, 174);
  ctx.quadraticCurveTo(52, 146, 70, 121);
  ctx.quadraticCurveTo(89, 95, 129, 98);
  ctx.quadraticCurveTo(151, 68, 188, 76);
  ctx.quadraticCurveTo(223, 82, 232, 111);
  ctx.quadraticCurveTo(251, 125, 232, 149);
  ctx.quadraticCurveTo(214, 171, 179, 164);
  ctx.quadraticCurveTo(154, 193, 112, 185);
  ctx.closePath();
  ctx.fillStyle = '#fffdf8';
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(151, 114, 7, 0, Math.PI * 2);
  ctx.arc(193, 114, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#4a3a6b';
  ctx.fill();
}
