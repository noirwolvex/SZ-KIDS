import { motion } from 'framer-motion';
import { useMemo } from 'react';

type Props = {
  density?: 'low' | 'medium' | 'high';
  className?: string;
};

export default function AnimatedBackground({ density = 'medium', className = '' }: Props) {
  const count = density === 'low' ? 12 : density === 'high' ? 30 : 20;

  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 8 + Math.random() * 20,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        emoji: ['⭐', '✨', '💫', '🌟', '💥'][Math.floor(Math.random() * 5)],
      })),
    [count],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: density === 'low' ? 15 : density === 'high' ? 40 : 25 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        colors: [
          'from-sky-400 to-ocean-400',
          'from-blush-400 to-coral-400',
          'from-mint-400 to-forest-400',
          'from-lemon-400 to-sunny-400',
          'from-lavender-400 to-blush-400',
          'from-ocean-400 to-sky-400',
          'from-sunny-400 to-coral-400',
        ][i % 7],
      })),
    [density],
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        top: 10 + Math.random() * 50,
        delay: i * 5 + Math.random() * 3,
        duration: 1.2 + Math.random() * 0.8,
      })),
    [],
  );

  const blobs = useMemo(
    () => [
      { color: 'bg-sky-300', size: 400, top: '-8%', left: '-10%', delay: 0, emoji: '🌤️' },
      { color: 'bg-blush-300', size: 320, top: '50%', left: '65%', delay: 1.5, emoji: '🎀' },
      { color: 'bg-mint-300', size: 280, top: '20%', left: '80%', delay: 0.8, emoji: '🍃' },
      { color: 'bg-lemon-300', size: 250, top: '75%', left: '5%', delay: 2, emoji: '☀️' },
      { color: 'bg-lavender-300', size: 220, top: '5%', left: '48%', delay: 1, emoji: '🎨' },
      { color: 'bg-coral-300', size: 280, top: '35%', left: '15%', delay: 1.2, emoji: '🌸' },
      { color: 'bg-forest-300', size: 240, top: '65%', left: '85%', delay: 0.5, emoji: '🌳' },
    ],
    [],
  );

  const floatingEmojis = ['🎈', '🎉', '🎊', '🎁', '�', '🎭', '�🎨', '🚀', '🌈', '💖', '🦋', '🐝'];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Vibrant base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blush-50 to-mint-50 opacity-80" />
      
      {/* Secondary gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tl from-lemon-50 via-transparent to-lavender-50 opacity-60" />

      {/* Rainbow mesh animation */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-25"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(255, 20, 147, 0.4), rgba(255, 107, 91, 0.35), rgba(255, 221, 0, 0.3), rgba(26, 215, 215, 0.35), rgba(156, 39, 176, 0.4), rgba(255, 20, 147, 0.4))',
          filter: 'blur(80px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Secondary aurora mesh */}
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 w-[140%] h-[140%] opacity-20"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, rgba(255, 107, 91, 0.3), rgba(156, 39, 176, 0.25), rgba(26, 215, 215, 0.3), rgba(75, 175, 80, 0.25), rgba(255, 221, 0, 0.3))',
          filter: 'blur(70px)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      />

      {/* Vibrant drifting blobs with enhanced animation */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${b.color} opacity-50 blur-3xl`}
          style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
          animate={{ scale: [1, 1.25, 1], x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 16 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(156, 39, 176, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(156, 39, 176, 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Enhanced twinkling stars with emojis */}
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ top: `${s.top}%`, left: `${s.left}%`, fontSize: `${s.size}px` }}
          animate={{ 
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.4, 0.5],
            rotate: [0, 360, 0],
            y: [0, -8, 0],
          }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          {s.emoji}
        </motion.div>
      ))}

      {/* Floating colorful particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute bottom-0 rounded-full bg-gradient-to-br ${p.colors} blur-sm shadow-lg`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -window.innerHeight * 0.9, -window.innerHeight * 1.2], opacity: [0, 0.8, 0], x: [0, p.drift, p.drift * 1.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
        />
      ))}

      {/* Shooting stars with glow */}
      {shootingStars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ top: `${s.top}%`, left: '-10%' }}
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: ['0vw', '120vw'], opacity: [0, 1, 0.8, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeIn', repeatDelay: 5 }}
        >
          <div className="relative">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-300 via-pink-300 to-transparent rounded-full shadow-lg" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-200 shadow-[0_0_16px_6px_rgba(255,221,0,0.8)]" />
          </div>
        </motion.div>
      ))}

      {/* Floating emoji decorations */}
      {floatingEmojis.map((emoji, idx) => (
        <FloatingEmoji key={idx} emoji={emoji} delay={idx * 0.5} />
      ))}

      {/* Floating clouds */}
      <FloatingCloud top="8%" scale={1.1} duration={32} delay={0} />
      <FloatingCloud top="38%" scale={0.75} duration={40} delay={8} />
      <FloatingCloud top="70%" scale={1.3} duration={28} delay={12} />
    </div>
  );
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  return (
    <motion.div
      className="absolute text-3xl opacity-0"
      style={{ 
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: [-20, -window.innerHeight * 0.8, -window.innerHeight],
        opacity: [0, 0.6, 0],
        x: [0, (Math.random() - 0.5) * 80, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: 8 + Math.random() * 6,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

function FloatingCloud({ top, scale, duration, delay }: { top: string; scale: number; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ top }}
      initial={{ x: '-30%' }}
      animate={{ x: '130%' }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width={130 * scale} height={80 * scale} viewBox="0 0 120 70" fill="white" opacity="0.65" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.1))">
        <ellipse cx="35" cy="45" rx="30" ry="22" />
        <ellipse cx="65" cy="38" rx="35" ry="28" />
        <ellipse cx="90" cy="48" rx="26" ry="20" />
        <rect x="20" y="45" width="80" height="20" rx="10" />
      </svg>
    </motion.div>
  );
}
