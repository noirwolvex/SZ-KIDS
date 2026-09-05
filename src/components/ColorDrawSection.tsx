import { motion } from 'framer-motion';
import { ArrowRight, Brush, Check, Palette, Shuffle, Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

type TemplateId = 'fox' | 'dino' | 'bunny' | 'unicorn';
type Props = { onOpenColoring: (templateId: TemplateId) => void };

type ColoringCard = {
  title: string;
  subtitle: string;
  preview: string;
  gradient: string;
  kind: TemplateId;
  skill: string;
  colors: string[];
};

const cards: ColoringCard[] = [
  { title: 'Happy Fox', subtitle: 'Cute forest friend', preview: '🦊', gradient: 'from-peach-100 via-lemon-100 to-white', kind: 'fox', skill: 'Creativity', colors: ['#ff9b72', '#ffd24d', '#34c187'] },
  { title: 'Dino Buddy', subtitle: 'Roar into color!', preview: '🦕', gradient: 'from-mint-100 via-sky-100 to-white', kind: 'dino', skill: 'Color matching', colors: ['#7dd3a8', '#38bdf8', '#ffd24d'] },
  { title: 'Bunny Hop', subtitle: 'Soft & playful', preview: '🐰', gradient: 'from-blush-100 via-lavender-100 to-white', kind: 'bunny', skill: 'Fine motor', colors: ['#ff9bc8', '#c4a7ff', '#fff4e6'] },
  { title: 'Magic Unicorn', subtitle: 'Make it magical', preview: '🦄', gradient: 'from-lavender-100 via-blush-100 to-white', kind: 'unicorn', skill: 'Imagination', colors: ['#9d7ce6', '#ff7fbf', '#38bdf8'] },
];

export default function ColorDrawSection({ onOpenColoring }: Props) {
  const [selected, setSelected] = useState<TemplateId>('fox');
  const selectedCard = useMemo(() => cards.find((card) => card.kind === selected) ?? cards[0], [selected]);

  const surpriseMe = () => {
    const choices = cards.filter((card) => card.kind !== selected);
    const next = choices[Math.floor(Math.random() * choices.length)] ?? cards[0];
    setSelected(next.kind);
  };

  return (
    <section className="relative mx-4 mt-10 overflow-hidden rounded-[2.35rem] border border-white/90 bg-white/50 p-3 shadow-[0_25px_80px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-7xl lg:p-7">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blush-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[18%] h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute left-[54%] top-[24%] h-44 w-44 rounded-full bg-lemon-200/25 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
        <motion.div className="absolute right-[8%] top-[10%] text-3xl" animate={{ y: [0, -10, 0], rotate: [-8, 8, -8], scale: [1, 1.08, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>🎨</motion.div>
        <motion.div className="absolute bottom-[8%] left-[42%] text-2xl" animate={{ y: [0, 8, 0], rotate: [6, -6, 6] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}>✨</motion.div>
        <motion.div className="absolute right-[30%] top-[34%] text-lg" animate={{ y: [0, -6, 0], x: [0, 5, 0], opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.6, repeat: Infinity }}>✦</motion.div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm">
                <Palette size={14} /> Color &amp; Draw
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400 backdrop-blur-md">
                <Sparkles size={13} /> Create &amp; explore
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/90 bg-white/80 text-3xl shadow-soft" animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>🖍️</motion.div>
              <div>
                <h2 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">Pick a picture and make it yours!</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lavender-400 sm:text-base">Choose a character, preview the finished look, then jump into the studio and turn the outline into your own colorful masterpiece.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button type="button" onClick={surpriseMe} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/75 px-4 py-3 font-display text-sm font-bold text-lavender-500 shadow-soft backdrop-blur-md">
              <Shuffle size={17} /> Surprise me
            </motion.button>
            <motion.button type="button" onClick={() => onOpenColoring(selectedCard.kind)} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-peach-400 via-blush-400 to-lavender-500 px-4 py-3 font-display font-bold text-white shadow-soft-lg sm:px-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Brush size={17} /></span>
              Open Drawing Studio
              <ArrowRight size={17} />
            </motion.button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <ColorCard key={card.title} card={card} index={index} selected={selected === card.kind} onSelect={() => setSelected(card.kind)} onOpenColoring={onOpenColoring} />
          ))}
        </div>

        <motion.div layout className="relative mt-5 flex flex-col gap-3 overflow-hidden rounded-[1.6rem] border border-white/90 bg-white/65 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lemon-200 to-blush-200 text-xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>🌟</motion.div>
            <div>
              <p className="text-[10px] font-display font-bold uppercase tracking-[0.16em] text-lavender-400">Ready to create</p>
              <p className="font-display font-bold text-lavender-500">{selectedCard.title} · {selectedCard.skill}</p>
            </div>
          </div>
          <button type="button" onClick={() => onOpenColoring(selectedCard.kind)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/85 px-3.5 py-2.5 font-display text-sm font-bold text-lavender-500 transition-transform hover:-translate-y-0.5 active:scale-95">
            Color this one <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function ColorCard({ card, index, selected, onSelect, onOpenColoring }: { card: ColoringCard; index: number; selected: boolean; onSelect: () => void; onOpenColoring: (templateId: TemplateId) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => { onSelect(); onOpenColoring(card.kind); }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -9, rotate: index % 2 === 0 ? -0.7 : 0.7, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border-2 bg-gradient-to-br p-3 text-left shadow-soft-lg transition-colors ${card.gradient} ${selected ? 'border-lavender-300' : 'border-white/90'}`}
    >
      <div className="absolute right-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-display font-bold text-lavender-400 shadow-sm backdrop-blur-md">{selected ? 'Picked for you' : 'Color me!'}</div>
      <div className="relative overflow-hidden rounded-[1.4rem] bg-white/60 p-3 backdrop-blur-md">
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] font-display font-bold text-lavender-400">
          <Star size={11} fill="currentColor" /> {card.skill}
        </div>
        <div className="relative h-52 sm:h-56">
          <motion.div className="absolute inset-x-3 bottom-1 top-6 rounded-[1.6rem] border border-white/70 bg-white/45" animate={{ opacity: [0.45, 0.7, 0.45] }} transition={{ duration: 2.8 + index * 0.2, repeat: Infinity }} />
          <div className="relative z-[1] h-full pt-5"><CartoonOutline kind={card.kind} /></div>
          <motion.div className="absolute -right-1 bottom-1 z-[2] flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/90 bg-white shadow-[0_10px_25px_rgba(86,74,148,0.15)] text-4xl" initial={{ scale: 0.88, rotate: 5 }} animate={{ scale: [0.96, 1.04, 0.96], rotate: [4, -3, 4] }} transition={{ duration: 3.8 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }} aria-label={`${card.title} colored preview`}>{card.preview}</motion.div>
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-lavender-500">{card.title}</h3>
            <p className="text-xs text-lavender-400">{card.subtitle}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {card.colors.map((color) => <span key={color} className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />)}
              <span className="ml-1 text-[10px] font-display font-bold text-lavender-400">Try these colors</span>
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/85 text-lavender-400 transition-transform group-hover:translate-x-1"><ArrowRight size={16} /></span>
        </div>
      </div>
      {selected && <motion.div layoutId="selected-mark" className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-lavender-400 text-white shadow-sm"><Check size={15} strokeWidth={3} /></motion.div>}
    </motion.button>
  );
}

function CartoonOutline({ kind }: { kind: TemplateId }) {
  if (kind === 'dino') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M63 172 Q40 146 60 113 Q83 76 136 77 Q164 44 204 61 Q239 76 226 112 Q252 125 231 149 Q215 167 188 162 L170 190 L141 188 L136 158 Q108 190 82 188 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><circle cx="194" cy="92" r="6" fill="#4a3a6b"/><circle cx="205" cy="132" r="7" fill="#c4f5e0" stroke="#4a3a6b" strokeWidth="5"/><path d="M77 100 L56 82 L71 79 L85 88 M113 72 L105 47 L121 55 L133 73 M149 65 L151 39 L166 56" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === 'bunny') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse cx="151" cy="140" rx="83" ry="62" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/><ellipse cx="115" cy="63" rx="28" ry="60" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" transform="rotate(-12 115 63)"/><ellipse cx="185" cy="63" rx="28" ry="60" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" transform="rotate(12 185 63)"/><circle cx="125" cy="130" r="7" fill="#4a3a6b"/><circle cx="176" cy="130" r="7" fill="#4a3a6b"/><path d="M143 145 Q151 151 159 145 M151 149 L151 158" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><circle cx="85" cy="169" r="25" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/></svg>;
  if (kind === 'unicorn') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M74 167 Q57 120 89 94 Q119 68 169 82 Q197 66 224 84 Q241 97 230 116 Q251 127 231 148 Q211 169 174 163 Q146 191 106 185 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M179 84 L201 33 L214 86" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M91 99 Q67 82 83 53 Q108 74 115 92" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/><circle cx="191" cy="108" r="6" fill="#4a3a6b"/><path d="M168 118 Q178 128 189 118" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><path d="M137 92 Q113 68 108 44" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M68 174 Q52 146 70 121 Q89 95 129 98 Q151 68 188 76 Q223 82 232 111 Q251 125 232 149 Q214 171 179 164 Q154 193 112 185 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M92 103 Q73 82 80 57 Q105 67 112 95 M113 96 Q106 62 127 49 Q142 73 135 99" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><circle cx="151" cy="114" r="7" fill="#4a3a6b"/><circle cx="193" cy="114" r="7" fill="#4a3a6b"/><path d="M168 128 Q178 139 188 128" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><path d="M82 143 Q61 139 57 153 Q64 164 84 160" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round"/></svg>;
}
