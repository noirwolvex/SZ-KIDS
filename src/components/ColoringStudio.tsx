import { motion } from 'framer-motion';
import { ArrowLeft, Brush, Download, Eraser, Palette, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { saveDrawing } from '@/lib/db';
import { showToast } from '@/components/ui';

type TemplateId = 'fox' | 'dino' | 'bunny' | 'unicorn' | 'kitten' | 'puppy' | 'panda' | 'lion' | 'penguin' | 'elephant' | 'monkey' | 'koala';
type Props = { templateId: TemplateId; onBack: () => void };

const COLORS = ['#ff7fbf', '#ff8f63', '#ffd24d', '#34c187', '#38bdf8', '#9d7ce6', '#ff5fb0', '#10b981', '#0ea5e9', '#8b5cf6', '#ffc9e3', '#c4f5e0'];
const LABELS: Record<TemplateId, string> = { fox: 'Happy Fox', dino: 'Dino Buddy', bunny: 'Bunny Hop', unicorn: 'Magic Unicorn', kitten: 'Sweet Kitten', puppy: 'Playful Puppy', panda: 'Happy Panda', lion: 'Lion Cub', penguin: 'Cool Penguin', elephant: 'Gentle Elephant', monkey: 'Cheeky Monkey', koala: 'Cuddly Koala' };
const BRUSH_SIZES = [10, 18, 28];

const FACE: Record<TemplateId, string> = {
  fox: 'M78 166Q55 122 88 94Q116 68 164 81Q192 67 220 85Q241 100 229 119Q248 129 229 149Q209 169 173 163Q145 191 106 185Z',
  dino: 'M63 172Q40 146 60 113Q83 76 136 77Q164 44 204 61Q239 76 226 112Q252 125 231 149Q215 167 188 162L170 190L141 188L136 158Q108 190 82 188Z',
  bunny: 'M68 165Q55 120 88 94Q116 72 151 84Q186 72 214 94Q247 121 232 165Q209 188 151 188Q92 188 68 165Z',
  unicorn: 'M74 167Q57 120 89 94Q119 68 169 82Q197 66 224 84Q241 97 230 116Q251 127 231 148Q211 169 174 163Q146 191 106 185Z',
  kitten: 'M76 168Q58 126 82 102Q105 80 150 88Q194 80 218 102Q242 126 224 168Q202 188 150 188Q98 188 76 168Z',
  puppy: 'M74 168Q58 124 85 96Q111 70 150 88Q189 70 215 96Q242 124 226 168Q202 188 150 188Q98 188 74 168Z',
  panda: 'M150 53Q216 53 232 118Q242 181 150 194Q58 181 68 118Q84 53 150 53Z',
  lion: 'M69 121Q63 56 150 45Q237 56 231 121Q223 190 150 194Q77 190 69 121Z',
  penguin: 'M150 50Q215 50 220 129Q214 195 150 201Q86 195 80 129Q85 50 150 50Z',
  elephant: 'M82 108Q82 60 150 57Q218 60 218 108Q218 184 150 190Q82 184 82 108Z',
  monkey: 'M77 117Q77 55 150 48Q223 55 223 117Q219 188 150 193Q81 188 77 117Z',
  koala: 'M76 123Q76 62 150 53Q224 62 224 123Q218 188 150 193Q82 188 76 123Z',
};

function Picture({ templateId }: { templateId: TemplateId }) {
  const stroke = '#4a3a6b';
  const body = FACE[templateId];
  const eye = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="7" fill={stroke} />;

  return (
    <svg viewBox="0 0 300 220" className="pointer-events-none absolute inset-0 h-full w-full" role="img" aria-label={`${LABELS[templateId]} coloring picture`}>
      {templateId === 'bunny' && <><ellipse cx="112" cy="67" rx="28" ry="60" fill="#fffdf8" stroke={stroke} strokeWidth="8" transform="rotate(-12 112 67)"/><ellipse cx="188" cy="67" rx="28" ry="60" fill="#fffdf8" stroke={stroke} strokeWidth="8" transform="rotate(12 188 67)"/></>}
      {templateId === 'fox' && <><path d="M90 98Q62 64 75 34Q111 57 125 89" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><path d="M125 88Q127 52 160 36Q184 69 167 92" fill="#fffdf8" stroke={stroke} strokeWidth="8"/></>}
      {templateId === 'unicorn' && <path d="M179 84L201 33L214 86Z" fill="#fffdf8" stroke={stroke} strokeWidth="8" strokeLinejoin="round"/>}
      {templateId === 'kitten' && <><path d="M84 105L75 45L126 82" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><path d="M216 105L225 45L174 82" fill="#fffdf8" stroke={stroke} strokeWidth="8"/></>}
      {templateId === 'puppy' && <><path d="M88 103Q48 91 62 48Q93 52 113 84" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><path d="M212 103Q252 91 238 48Q207 52 187 84" fill="#fffdf8" stroke={stroke} strokeWidth="8"/></>}
      {templateId === 'panda' && <><circle cx="92" cy="72" r="26" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="208" cy="72" r="26" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="123" cy="116" rx="16" ry="22" fill={stroke} transform="rotate(-25 123 116)"/><ellipse cx="177" cy="116" rx="16" ry="22" fill={stroke} transform="rotate(25 177 116)"/></>}
      {templateId === 'lion' && <><path d="M99 82L76 64M201 82L224 64M89 145L62 151M211 145L238 151" stroke={stroke} strokeWidth="9" strokeLinecap="round"/></>}
      {templateId === 'penguin' && <ellipse cx="150" cy="139" rx="44" ry="54" fill="#fffdf8" stroke={stroke} strokeWidth="7"/>}
      {templateId === 'elephant' && <><ellipse cx="79" cy="115" rx="32" ry="42" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="221" cy="115" rx="32" ry="42" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><path d="M150 120Q128 145 150 170Q172 145 150 120Z" fill="#fffdf8" stroke={stroke} strokeWidth="8"/></>}
      {templateId === 'monkey' && <><circle cx="75" cy="120" r="30" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="225" cy="120" r="30" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="150" cy="144" rx="40" ry="30" fill="#fffdf8" stroke={stroke} strokeWidth="7"/></>}
      {templateId === 'koala' && <><circle cx="82" cy="80" r="28" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="218" cy="80" r="28" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="150" cy="145" rx="18" ry="13" fill="#fffdf8" stroke={stroke} strokeWidth="5"/></>}
      <path d={body} fill="#fffdf8" stroke={stroke} strokeWidth="8" strokeLinejoin="round" />
      {templateId === 'penguin' && <path d="M139 125L150 137L161 125Z" fill="#ffd24d" stroke={stroke} strokeWidth="5"/>}
      {templateId === 'puppy' && <ellipse cx="150" cy="141" rx="16" ry="11" fill="#fffdf8" stroke={stroke} strokeWidth="5"/>}
      {templateId === 'panda' ? <>{eye(128,116)}{eye(172,116)}</> : <>{eye(128,120)}{eye(172,120)}</>}
      {templateId !== 'penguin' && templateId !== 'elephant' && <path d="M139 145Q150 154 161 145M150 150V158" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/>}
      {templateId === 'kitten' && <path d="M99 137L67 132M99 147L65 151M201 137L233 132M201 147L235 151" stroke={stroke} strokeWidth="4" strokeLinecap="round"/>}
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
    return { x: ((source.clientX - rect.left) / Math.max(rect.width, 1)) * canvas.width, y: ((source.clientY - rect.top) / Math.max(rect.height, 1)) * canvas.height };
  };

  const begin = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const point = getPoint(event);
    ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.strokeStyle = eraser ? '#fffdf8' : color; ctx.lineWidth = eraser ? brushSize * 2.5 : brushSize; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };
  const move = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const point = getPoint(event); ctx.strokeStyle = eraser ? '#fffdf8' : color; ctx.lineWidth = eraser ? brushSize * 2.5 : brushSize; ctx.lineTo(point.x, point.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(point.x, point.y);
  };
  const end = () => { drawingRef.current = false; canvasRef.current?.getContext('2d')?.beginPath(); };
  const reset = () => { const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); };
  const exportImage = () => { const canvas = canvasRef.current; if (!canvas) return; const link = document.createElement('a'); link.download = `${templateId}-wonderkids.png`; link.href = canvas.toDataURL('image/png'); link.click(); };
  const saveCloud = async () => { const canvas = canvasRef.current; if (!canvas || saving) return; setSaving(true); try { await saveDrawing(LABELS[templateId], templateId, canvas.toDataURL('image/png')); showToast('Picture saved to your gallery!', 'success', '🎨'); } catch (error) { console.error('[ColoringStudio] save failed:', error); showToast('Could not save picture. Please try again.', 'error'); } finally { setSaving(false); } };

  return (
    <div className="relative min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute left-[8%] top-20 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl"/><div className="absolute right-[8%] top-40 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl"/></div>
      <div className="relative mx-auto max-w-6xl">
        <motion.button type="button" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 font-display text-sm font-bold text-lavender-500 shadow-soft backdrop-blur-xl"><ArrowLeft size={17}/> Back to Games</motion.button>
        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/90 bg-white/55 p-4 shadow-[0_30px_90px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm"><Palette size={14}/> Color &amp; Draw Studio</span><div className="mt-3 flex items-center gap-3"><motion.span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-soft" animate={{ y:[0,-5,0], rotate:[-4,4,-4] }} transition={{ duration:2.6, repeat:Infinity }}>🎨</motion.span><div><h1 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">{LABELS[templateId]}</h1><p className="text-sm text-lavender-400">Color the character, add your own details, and make it yours.</p></div></div></div><span className="inline-flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2 text-xs font-display font-bold text-lavender-400"><Sparkles size={14}/> Ready to create</span></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="relative aspect-[900/680] overflow-hidden rounded-[1.7rem] border border-white/90 bg-[#fffdf8] shadow-inner"><Picture templateId={templateId}/><canvas ref={canvasRef} width={900} height={680} onMouseDown={begin} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={begin} onTouchMove={move} onTouchEnd={end} className="absolute inset-0 h-full w-full touch-none cursor-crosshair" aria-label="Drawing layer"/></div>
              <aside className="space-y-4"><div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft"><h2 className="font-display font-bold text-lavender-500">Colors</h2><div className="mt-3 grid grid-cols-4 gap-2.5">{COLORS.map((item)=><motion.button key={item} type="button" whileHover={{scale:1.1}} whileTap={{scale:0.9}} onClick={()=>{setColor(item);setEraser(false);}} className={`h-11 w-11 rounded-full border-4 shadow-soft ${color===item&&!eraser?'border-lavender-500':'border-white'}`} style={{backgroundColor:item}} aria-label={`Choose color ${item}`}/>)}</div></div>
              <div className="rounded-[1.5rem] border border-white/90 bg-white/75 p-4 shadow-soft"><h2 className="font-display font-bold text-lavender-500">Brush size</h2><div className="mt-3 grid grid-cols-3 gap-2">{BRUSH_SIZES.map((size)=><button key={size} type="button" onClick={()=>setBrushSize(size)} className={`rounded-xl p-3 ${brushSize===size?'bg-lavender-200':'bg-lavender-50'}`} aria-label={`Brush size ${size}`}><span className="mx-auto block rounded-full bg-lavender-400" style={{width:size,height:size}}/></button>)}</div></div>
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setEraser((value)=>!value)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-display text-sm font-bold ${eraser?'bg-lavender-400 text-white':'bg-white/80 text-lavender-500'}`}><Eraser size={17}/> Eraser</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-3 py-3 font-display text-sm font-bold text-lavender-500"><RotateCcw size={17}/> Reset</button></div>
              <div className="grid gap-2"><motion.button type="button" onClick={saveCloud} disabled={saving} whileTap={{scale:0.98}} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-lavender-500 px-3 py-3 font-display text-sm font-bold text-white shadow-soft disabled:opacity-60"><Save size={17}/> {saving?'Saving...':'Save picture'}</motion.button><button type="button" onClick={exportImage} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/85 px-3 py-3 font-display text-sm font-bold text-lavender-500"><Download size={17}/> Download</button></div></aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
