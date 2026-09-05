import { motion } from 'framer-motion';
import { ArrowRight, Brush, Check, Palette, Search, Shuffle, Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

type TemplateId = 'fox' | 'dino' | 'bunny' | 'unicorn' | 'kitten' | 'puppy' | 'panda' | 'lion' | 'penguin' | 'elephant' | 'monkey' | 'koala';
type Category = 'All' | 'Animals' | 'Cute Friends' | 'Fantasy';
type Props = { onOpenColoring: (templateId: TemplateId) => void };

type ColoringCard = {
  title: string;
  subtitle: string;
  preview: string;
  gradient: string;
  kind: TemplateId;
  skill: string;
  category: Exclude<Category, 'All'>;
  colors: string[];
};

export const COLORING_CARDS: ColoringCard[] = [
  { title: 'Happy Fox', subtitle: 'Cute forest friend', preview: '🦊', gradient: 'from-peach-100 via-lemon-100 to-white', kind: 'fox', skill: 'Creativity', category: 'Animals', colors: ['#ff9b72', '#ffd24d', '#34c187'] },
  { title: 'Dino Buddy', subtitle: 'Roar into color!', preview: '🦕', gradient: 'from-mint-100 via-sky-100 to-white', kind: 'dino', skill: 'Color matching', category: 'Animals', colors: ['#7dd3a8', '#38bdf8', '#ffd24d'] },
  { title: 'Bunny Hop', subtitle: 'Soft & playful', preview: '🐰', gradient: 'from-blush-100 via-lavender-100 to-white', kind: 'bunny', skill: 'Fine motor', category: 'Cute Friends', colors: ['#ff9bc8', '#c4a7ff', '#fff4e6'] },
  { title: 'Magic Unicorn', subtitle: 'Make it magical', preview: '🦄', gradient: 'from-lavender-100 via-blush-100 to-white', kind: 'unicorn', skill: 'Imagination', category: 'Fantasy', colors: ['#9d7ce6', '#ff7fbf', '#38bdf8'] },
  { title: 'Sweet Kitten', subtitle: 'Tiny whiskers & big smiles', preview: '🐱', gradient: 'from-sky-100 via-white to-blush-100', kind: 'kitten', skill: 'Focus', category: 'Cute Friends', colors: ['#ff9bc8', '#9db8ff', '#ffd24d'] },
  { title: 'Playful Puppy', subtitle: 'Ready for a colorful walk', preview: '🐶', gradient: 'from-lemon-100 via-peach-100 to-white', kind: 'puppy', skill: 'Hand control', category: 'Cute Friends', colors: ['#c78b5d', '#ff9b72', '#34c187'] },
  { title: 'Happy Panda', subtitle: 'Bamboo-loving buddy', preview: '🐼', gradient: 'from-mint-100 via-white to-sky-100', kind: 'panda', skill: 'Pattern play', category: 'Animals', colors: ['#4a3a6b', '#34c187', '#ffd24d'] },
  { title: 'Lion Cub', subtitle: 'Little roar, lots of fun', preview: '🦁', gradient: 'from-lemon-100 via-white to-peach-100', kind: 'lion', skill: 'Color matching', category: 'Animals', colors: ['#ffd24d', '#ff9b72', '#8b6a43'] },
  { title: 'Cool Penguin', subtitle: 'Waddle into winter fun', preview: '🐧', gradient: 'from-sky-100 via-white to-lavender-100', kind: 'penguin', skill: 'Fine motor', category: 'Animals', colors: ['#4a3a6b', '#38bdf8', '#fffdf8'] },
  { title: 'Gentle Elephant', subtitle: 'Big ears, big imagination', preview: '🐘', gradient: 'from-lavender-100 via-sky-100 to-white', kind: 'elephant', skill: 'Creativity', category: 'Animals', colors: ['#9d7ce6', '#38bdf8', '#c4a7ff'] },
  { title: 'Cheeky Monkey', subtitle: 'Swing into something fun', preview: '🐵', gradient: 'from-peach-100 via-lemon-100 to-white', kind: 'monkey', skill: 'Control & detail', category: 'Cute Friends', colors: ['#c78b5d', '#ffd24d', '#34c187'] },
  { title: 'Cuddly Koala', subtitle: 'Sleepy, sweet & ready to color', preview: '🐨', gradient: 'from-mint-100 via-lavender-100 to-white', kind: 'koala', skill: 'Calm focus', category: 'Cute Friends', colors: ['#94a3b8', '#c4a7ff', '#34c187'] },
];

export default function ColorDrawSection({ onOpenColoring }: Props) {
  const [selected, setSelected] = useState<TemplateId>('fox');
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const selectedCard = useMemo(() => COLORING_CARDS.find((card) => card.kind === selected) ?? COLORING_CARDS[0], [selected]);

  const visibleCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COLORING_CARDS.filter((card) => {
      const matchesCategory = category === 'All' || card.category === category;
      const matchesQuery = !q || `${card.title} ${card.subtitle} ${card.skill}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const surpriseMe = () => {
    const pool = visibleCards.filter((card) => card.kind !== selected);
    const next = (pool.length ? pool : visibleCards)[Math.floor(Math.random() * Math.max(pool.length, visibleCards.length))];
    if (next) setSelected(next.kind);
  };

  return (
    <section className="relative mx-4 mt-10 overflow-hidden rounded-[2.35rem] border border-white/90 bg-white/50 p-3 shadow-[0_25px_80px_rgba(86,74,148,0.12)] backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-7xl lg:p-7">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blush-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[18%] h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lemon-50 via-white to-blush-50 p-5 sm:p-7">
        <motion.div className="absolute right-[8%] top-[10%] text-3xl" animate={{ y: [0, -10, 0], rotate: [-8, 8, -8], scale: [1, 1.08, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>🎨</motion.div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-lavender-500 shadow-sm"><Palette size={14} /> Color &amp; Draw</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-display font-bold text-lavender-400"><Sparkles size={13} /> {COLORING_CARDS.length} coloring pages</span>
            </div>
            <div className="mt-4 flex items-start gap-3.5">
              <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/90 bg-white/80 text-3xl shadow-soft" animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>🖍️</motion.div>
              <div><h2 className="font-display text-2xl font-bold text-lavender-500 sm:text-3xl">Pick a picture and make it yours!</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-lavender-400 sm:text-base">Browse cute animals, friendly characters and magical creatures, then open any page in the drawing studio.</p></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2"><motion.button type="button" onClick={surpriseMe} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/75 px-4 py-3 font-display text-sm font-bold text-lavender-500 shadow-soft"><Shuffle size={17} /> Surprise me</motion.button></div>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['All', 'Animals', 'Cute Friends', 'Fantasy'] as Category[]).map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3.5 py-2 text-xs font-display font-bold transition-transform hover:-translate-y-0.5 ${category === item ? 'bg-lavender-400 text-white shadow-soft' : 'bg-white/75 text-lavender-400'}`}>{item}</button>)}
          </div>
          <label className="relative block w-full max-w-xs"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lavender-300" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a character..." className="w-full rounded-2xl border border-white/90 bg-white/75 py-2.5 pl-9 pr-3 text-sm text-lavender-500 outline-none placeholder:text-lavender-300 focus:ring-4 focus:ring-lavender-200/50" /></label>
        </div>

        <div className="relative mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleCards.map((card, index) => <ColorCard key={card.kind} card={card} index={index} selected={selected === card.kind} onSelect={() => setSelected(card.kind)} onOpenColoring={onOpenColoring} />)}
        </div>

        {!visibleCards.length && <div className="rounded-3xl border border-dashed border-lavender-200 bg-white/55 p-10 text-center"><p className="font-display text-lg font-bold text-lavender-500">No coloring pages found</p><p className="mt-1 text-sm text-lavender-400">Try another character or category.</p></div>}

        <motion.div layout className="relative mt-5 flex flex-col gap-3 overflow-hidden rounded-[1.6rem] border border-white/90 bg-white/65 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><motion.div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lemon-200 to-blush-200 text-xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>🌟</motion.div><div><p className="text-[10px] font-display font-bold uppercase tracking-[0.16em] text-lavender-400">Ready to create</p><p className="font-display font-bold text-lavender-500">{selectedCard.title} · {selectedCard.skill}</p></div></div>
          <button type="button" onClick={() => onOpenColoring(selectedCard.kind)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/85 px-3.5 py-2.5 font-display text-sm font-bold text-lavender-500 transition-transform hover:-translate-y-0.5 active:scale-95">Color this one <ArrowRight size={15} /></button>
        </motion.div>
      </div>
    </section>
  );
}

function ColorCard({ card, index, selected, onSelect, onOpenColoring }: { card: ColoringCard; index: number; selected: boolean; onSelect: () => void; onOpenColoring: (templateId: TemplateId) => void }) {
  return (
    <motion.button type="button" onClick={() => { onSelect(); onOpenColoring(card.kind); }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.04, duration: 0.35 }} whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.6 : 0.6, scale: 1.01 }} whileTap={{ scale: 0.985 }} className={`group relative overflow-hidden rounded-[1.75rem] border-2 bg-gradient-to-br p-3 text-left shadow-soft-lg transition-colors ${card.gradient} ${selected ? 'border-lavender-300' : 'border-white/90'}`}>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-display font-bold text-lavender-400 shadow-sm">{selected ? 'Picked for you' : 'Color me!'}</div>
      <div className="relative overflow-hidden rounded-[1.4rem] bg-white/60 p-3 backdrop-blur-md">
        <div className="relative h-52 sm:h-56"><div className="absolute inset-x-3 bottom-1 top-3 rounded-[1.6rem] border border-white/70 bg-white/55" /><div className="relative z-[1] h-full pt-2"><CartoonOutline kind={card.kind} /></div><motion.div className="absolute -right-1 bottom-1 z-[2] flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/90 bg-white shadow-[0_10px_25px_rgba(86,74,148,0.15)] text-4xl" animate={{ scale: [0.96, 1.04, 0.96], rotate: [4, -3, 4] }} transition={{ duration: 3.8 + index * 0.15, repeat: Infinity, ease: 'easeInOut' }} aria-label={`${card.title} preview`}>{card.preview}</motion.div></div>
        <div className="mt-2 flex items-end justify-between gap-3"><div><p className="text-[10px] font-display font-bold uppercase tracking-wider text-lavender-300">{card.category} · {card.skill}</p><h3 className="font-display text-xl font-bold text-lavender-500">{card.title}</h3><p className="text-xs text-lavender-400">{card.subtitle}</p><div className="mt-2 flex items-center gap-1.5">{card.colors.map((color) => <span key={color} className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />)}</div></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/85 text-lavender-400 transition-transform group-hover:translate-x-1"><ArrowRight size={16} /></span></div>
      </div>
      {selected && <motion.div layoutId="selected-mark" className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-lavender-400 text-white shadow-sm"><Check size={15} strokeWidth={3} /></motion.div>}
    </motion.button>
  );
}

function CartoonOutline({ kind }: { kind: TemplateId }) {
  const stroke = '#4a3a6b';
  const common = { fill: '#fffdf8', stroke, strokeWidth: 8, strokeLinejoin: 'round' as const };
  if (kind === 'fox') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path {...common} d="M78 166Q55 122 88 94Q116 68 164 81Q192 67 220 85Q241 100 229 119Q248 129 229 149Q209 169 173 163Q145 191 106 185Z"/><path {...common} d="M90 98Q62 64 75 34Q111 57 125 89M125 88Q127 52 160 36Q184 69 167 92Z"/><circle cx="133" cy="123" r="7" fill={stroke}/><circle cx="181" cy="123" r="7" fill={stroke}/><path d="M153 141Q160 148 167 141" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === 'dino') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path {...common} d="M63 172Q40 146 60 113Q83 76 136 77Q164 44 204 61Q239 76 226 112Q252 125 231 149Q215 167 188 162L170 190L141 188L136 158Q108 190 82 188Z"/><circle cx="194" cy="92" r="6" fill={stroke}/><path d="M77 100L56 82L71 79L85 88M113 72L105 47L121 55L133 73M149 65L151 39L166 56" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"/></svg>;
  if (kind === 'bunny') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse {...common} cx="151" cy="140" rx="83" ry="62"/><ellipse {...common} cx="115" cy="63" rx="28" ry="60" transform="rotate(-12 115 63)"/><ellipse {...common} cx="185" cy="63" rx="28" ry="60" transform="rotate(12 185 63)"/><circle cx="125" cy="130" r="7" fill={stroke}/><circle cx="176" cy="130" r="7" fill={stroke}/><path d="M143 145Q151 151 159 145M151 149V158" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === 'unicorn') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path {...common} d="M74 167Q57 120 89 94Q119 68 169 82Q197 66 224 84Q241 97 230 116Q251 127 231 148Q211 169 174 163Q146 191 106 185Z"/><path {...common} d="M179 84L201 33L214 86Z"/><circle cx="189" cy="114" r="6" fill={stroke}/><path d="M161 130Q181 144 198 128" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round"/></svg>;
  const eye = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="6" fill={stroke}/>;
  if (kind === 'kitten') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path {...common} d="M76 168Q58 126 82 102Q105 80 150 88Q194 80 218 102Q242 126 224 168Q202 188 150 188Q98 188 76 168Z"/><path {...common} d="M84 105L75 45L126 82M216 105L225 45L174 82"/>{eye(127,120)}{eye(173,120)}<path d="M140 137Q150 146 160 137M150 143V154" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/><path d="M99 137L67 132M99 147L65 151M201 137L233 132M201 147L235 151" stroke={stroke} strokeWidth="4" strokeLinecap="round"/></svg>;
  if (kind === 'puppy') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><path {...common} d="M74 168Q58 124 85 96Q111 70 150 88Q189 70 215 96Q242 124 226 168Q202 188 150 188Q98 188 74 168Z"/><path {...common} d="M88 103Q48 91 62 48Q93 52 113 84M212 103Q252 91 238 48Q207 52 187 84"/>{eye(128,121)}{eye(172,121)}<ellipse cx="150" cy="141" rx="16" ry="11" fill="#fffdf8" stroke={stroke} strokeWidth="5"/><circle cx="150" cy="139" r="5" fill={stroke}/><path d="M135 155Q150 166 165 155" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === 'panda') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><circle {...common} cx="150" cy="126" r="76"/><circle cx="92" cy="72" r="26" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="208" cy="72" r="26" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="123" cy="116" rx="16" ry="22" fill={stroke} transform="rotate(-25 123 116)"/><ellipse cx="177" cy="116" rx="16" ry="22" fill={stroke} transform="rotate(25 177 116)"/>{eye(128,116)}{eye(172,116)}<path d="M141 145Q150 153 159 145" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === 'lion') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><circle cx="150" cy="118" r="83" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="150" cy="123" r="60" fill="#fffdf8" stroke={stroke} strokeWidth="8"/>{eye(129,118)}{eye(171,118)}<path d="M141 140Q150 150 159 140M150 146V156" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/><path d="M99 88L76 72M201 88L224 72M91 145L65 151M209 145L235 151" stroke={stroke} strokeWidth="7" strokeLinecap="round"/></svg>;
  if (kind === 'penguin') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse {...common} cx="150" cy="128" rx="65" ry="78"/><ellipse cx="150" cy="139" rx="44" ry="54" fill="#fffdf8" stroke={stroke} strokeWidth="7"/>{eye(130,112)}{eye(170,112)}<path d="M139 125L150 137L161 125Z" fill="#ffd24d" stroke={stroke} strokeWidth="5"/><path d="M87 124L58 145M213 124L242 145" stroke={stroke} strokeWidth="8" strokeLinecap="round"/></svg>;
  if (kind === 'elephant') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse {...common} cx="150" cy="132" rx="68" ry="64"/><ellipse {...common} cx="79" cy="115" rx="32" ry="42"/><ellipse {...common} cx="221" cy="115" rx="32" ry="42"/><path d="M150 120Q128 145 150 170Q172 145 150 120Z" fill="#fffdf8" stroke={stroke} strokeWidth="8"/>{eye(128,113)}{eye(172,113)}<path d="M135 148Q150 157 165 148" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === 'monkey') return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><circle {...common} cx="150" cy="120" r="70"/><circle cx="75" cy="120" r="30" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><circle cx="225" cy="120" r="30" fill="#fffdf8" stroke={stroke} strokeWidth="8"/><ellipse cx="150" cy="144" rx="40" ry="30" fill="#fffdf8" stroke={stroke} strokeWidth="7"/>{eye(127,112)}{eye(173,112)}<path d="M135 150Q150 162 165 150" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden="true"><ellipse {...common} cx="150" cy="128" rx="72" ry="62"/><circle {...common} cx="82" cy="80" r="28"/><circle {...common} cx="218" cy="80" r="28"/>{eye(128,120)}{eye(172,120)}<ellipse cx="150" cy="145" rx="18" ry="13" fill="#fffdf8" stroke={stroke} strokeWidth="5"/><circle cx="150" cy="142" r="5" fill={stroke}/></svg>;
}
