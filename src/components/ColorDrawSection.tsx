import { motion } from 'framer-motion';
import { ArrowRight, Brush, Palette, Sparkles } from 'lucide-react';

type Props = { onOpenColoring: () => void };

type ColoringCard = {
  title: string;
  subtitle: string;
  preview: string;
  gradient: string;
  kind: 'fox' | 'dino' | 'bunny' | 'unicorn';
};

const cards: ColoringCard[] = [
  { title: 'Happy Fox', subtitle: 'Cute forest friend', preview: '🦊', gradient: 'from-peach-100 via-lemon-100 to-white', kind: 'fox' },
  { title: 'Dino Buddy', subtitle: 'Roar into color!', preview: '🦕', gradient: 'from-mint-100 via-sky-100 to-white', kind: 'dino' },
  { title: 'Bunny Hop', subtitle: 'Soft & playful', preview: '🐰', gradient: 'from-blush-100 via-lavender-100 to-white', kind: 'bunny' },
  { title: 'Magic Unicorn', subtitle: 'Make it magical', preview: '🦄', gradient: 'from-lavender-100 via-blush-100 to-white', kind: 'unicorn' },
];

export default function ColorDrawSection({ onOpenColoring }: Props) {
  return (
    <section className="relative mx-4 mt-10 overflow-hidden rounded-[2.35rem] border border-white/90 bg-white/50 p-4 shadow-[0_25px_80px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-7xl lg:p-7">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blush-200/30 blur-3xl" />
      <div className="absolute -bottom-28 left-[30%] h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
        <motion.div className="absolute right-[8%] top-[10%] text-3xl" animate={{ y: [0, -9, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3.2, repeat: Infinity }}>🎨</motion.div>
        <motion.div className="absolute left-[44%] bottom-[8%] text-2xl" animate={{ y: [0, 8, 0], rotate: [6, -6, 6] }} transition={{ duration: 3.8, repeat: Infinity }}>✨</motion.div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm">
              <Palette size={14} /> Color &amp; Draw
            </div>
            <div className="mt-4 flex items-start gap-3">
              <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/80 text-3xl shadow-soft" animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }} transition={{ duration: 2.8, repeat: Infinity }}>🖍️</motion.div>
              <div>
                <h2 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">Pick a picture and make it yours!</h2>
                <p className="mt-2 text-sm leading-relaxed text-lavender-400 sm:text-base">Big cartoon characters to color, with a tiny finished preview beside each one for inspiration.</p>
              </div>
            </div>
          </div>

          <motion.button type="button" onClick={onOpenColoring} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.97 }} className="inline-flex w-fit items-center gap-3 rounded-2xl bg-gradient-to-r from-peach-400 via-blush-400 to-lavender-500 px-5 py-3.5 font-display font-bold text-white shadow-soft-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Brush size={17} /></span>
            Open Drawing Studio
            <ArrowRight size={17} />
          </motion.button>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <ColorCard key={card.title} card={card} index={index} onOpenColoring={onOpenColoring} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ColorCard({ card, index, onOpenColoring }: { card: ColoringCard; index: number; onOpenColoring: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpenColoring}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.7 : 0.7 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br ${card.gradient} p-3 text-left shadow-soft-lg`}
    >
      <div className="relative overflow-hidden rounded-[1.4rem] bg-white/55 p-3 backdrop-blur-md">
        <div className="absolute right-3 top-3 rounded-full bg-white/75 px-2 py-1 text-[10px] font-display font-bold text-lavender-400">Color me!</div>
        <div className="relative h-52 sm:h-56">
          <CartoonOutline kind={card.kind} />
          <motion.div className="absolute -right-1 bottom-1 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/90 bg-white shadow-[0_10px_25px_rgba(86,74,148,0.15)] text-4xl" initial={{ scale: 0.88, rotate: 5 }} animate={{ scale: [0.96, 1.03, 0.96], rotate: [4, -3, 4] }} transition={{ duration: 3.8 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }} aria-label={`${card.title} colored preview`}>{card.preview}</motion.div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div><h3 className="font-display text-xl font-bold text-lavender-500">{card.title}</h3><p className="text-xs text-lavender-400">{card.subtitle}</p></div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-lavender-400 transition-transform group-hover:translate-x-1"><ArrowRight size={16} /></span>
        </div>
      </div>
    </motion.button>
  );
}

function CartoonOutline({ kind }: { kind: ColoringCard['kind'] }) {
  if (kind === 'dino') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M63 172 Q40 146 60 113 Q83 76 136 77 Q164 44 204 61 Q239 76 226 112 Q252 125 231 149 Q215 167 188 162 L170 190 L141 188 L136 158 Q108 190 82 188 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><circle cx="194" cy="92" r="6" fill="#4a3a6b"/><circle cx="205" cy="132" r="7" fill="#c4f5e0" stroke="#4a3a6b" strokeWidth="5"/><path d="M77 100 L56 82 L71 79 L85 88 M113 72 L105 47 L121 55 L133 73 M149 65 L151 39 L166 56" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === 'bunny') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse cx="151" cy="140" rx="83" ry="62" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/><ellipse cx="115" cy="63" rx="28" ry="60" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" transform="rotate(-12 115 63)"/><ellipse cx="185" cy="63" rx="28" ry="60" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" transform="rotate(12 185 63)"/><circle cx="125" cy="130" r="7" fill="#4a3a6b"/><circle cx="176" cy="130" r="7" fill="#4a3a6b"/><path d="M143 145 Q151 151 159 145 M151 149 L151 158" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><circle cx="85" cy="169" r="25" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/></svg>;
  if (kind === 'unicorn') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M74 167 Q57 120 89 94 Q119 68 169 82 Q197 66 224 84 Q241 97 230 116 Q251 127 231 148 Q211 169 174 163 Q146 191 106 185 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M179 84 L201 33 L214 86" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M91 99 Q67 82 83 53 Q108 74 115 92" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8"/><circle cx="191" cy="108" r="6" fill="#4a3a6b"/><path d="M168 118 Q178 128 189 118" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><path d="M137 92 Q113 68 108 44" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path d="M68 174 Q52 146 70 121 Q89 95 129 98 Q151 68 188 76 Q223 82 232 111 Q251 125 232 149 Q214 171 179 164 Q154 193 112 185 Z" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><path d="M92 103 Q73 82 80 57 Q105 67 112 95 M113 96 Q106 62 127 49 Q142 73 135 99" fill="#fffdf8" stroke="#4a3a6b" strokeWidth="8" strokeLinejoin="round"/><circle cx="151" cy="114" r="7" fill="#4a3a6b"/><circle cx="193" cy="114" r="7" fill="#4a3a6b"/><path d="M168 128 Q178 139 188 128" fill="none" stroke="#4a3a6b" strokeWidth="5" strokeLinecap="round"/><path d="M82 143 Q61 139 57 153 Q64 164 84 160" fill="none" stroke="#4a3a6b" strokeWidth="8" strokeLinecap="round"/></svg>;
}
