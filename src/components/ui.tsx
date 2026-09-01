import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled,
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blush-400 via-coral-400 to-sunny-400 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-0',
    secondary: 'bg-gradient-to-r from-sky-200 to-mint-200 text-lavender-600 border-2 border-sky-300 hover:from-sky-300 hover:to-mint-300 font-semibold',
    ghost: 'text-blush-500 hover:bg-blush-100 hover:scale-105 active:scale-95 font-semibold',
    success: 'bg-gradient-to-r from-mint-400 to-forest-400 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border-0',
  };
  const sizes = {
    sm: 'px-4 py-2.5 text-sm touch-target-sm rounded-xl',
    md: 'px-5 sm:px-6 py-3 text-base touch-target-sm rounded-2xl font-semibold',
    lg: 'px-6 sm:px-8 py-3.5 sm:py-4 text-lg touch-target-sm rounded-3xl font-semibold',
  };
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -3 }}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-display transition-all relative overflow-hidden ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {icon && <ArrowRight size={size === 'lg' ? 22 : 18} className="relative z-10" />}
    </motion.button>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
};

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`bg-white rounded-3xl shadow-lg border-2 border-white/80 overflow-hidden backdrop-blur-sm hover:border-sky-200 hover:shadow-2xl transition-all cursor-pointer relative ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,240,245,0.8))',
      }}
    >
      {children}
    </motion.div>
  );
}

type BadgeProps = {
  children: ReactNode;
  color?: 'sky' | 'blush' | 'mint' | 'lemon' | 'lavender' | 'peach' | 'coral' | 'sunny' | 'forest' | 'ocean';
  className?: string;
};

export function Badge({ children, color = 'lavender', className = '' }: BadgeProps) {
  const colors = {
    sky: 'bg-sky-200 text-sky-700 border border-sky-300 font-bold',
    blush: 'bg-blush-200 text-blush-700 border border-blush-300 font-bold',
    mint: 'bg-mint-200 text-mint-700 border border-mint-300 font-bold',
    lemon: 'bg-lemon-200 text-lemon-700 border border-lemon-300 font-bold',
    lavender: 'bg-lavender-200 text-lavender-700 border border-lavender-300 font-bold',
    peach: 'bg-peach-200 text-peach-700 border border-peach-300 font-bold',
    coral: 'bg-coral-200 text-coral-700 border border-coral-300 font-bold',
    sunny: 'bg-sunny-200 text-sunny-700 border border-sunny-300 font-bold',
    forest: 'bg-forest-200 text-forest-700 border border-forest-300 font-bold',
    ocean: 'bg-ocean-200 text-ocean-700 border border-ocean-300 font-bold',
  };
  return (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-bold shadow-md hover:shadow-lg transition-all ${colors[color]} ${className}`}
    >
      {children}
    </motion.span>
  );
}

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
};

export function ProgressRing({ value, size = 80, stroke = 8, color = '#ff1493', label }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ - (clamped / 100) * circ;
  const displayValue = Math.round(clamped);
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e0e7ff" strokeWidth={stroke} opacity="0.5" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          filter="drop-shadow(0 2px 8px rgba(255, 20, 147, 0.3))"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
        <span className="font-display font-bold leading-none truncate" style={{ color, fontSize: size >= 100 ? '1.25rem' : '1.0625rem' }}>
          {displayValue}%
        </span>
        {label && <span className="text-[10px] text-blush-400 font-semibold mt-0.5 truncate max-w-full">{label}</span>}
      </div>
    </div>
  );
}

export function Spinner({ size = 28, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="text-blush-400" size={size} style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 20, 147, 0.3))' }} />
      </motion.div>
      {label && <p className="text-blush-500 font-display text-sm font-semibold">{label}</p>}
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blush-50 to-mint-50">
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-500 shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)' }}
        />
        {label && <p className="text-blush-500 font-display font-bold text-lg">{label}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
}: {
  emoji: string;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blush-300 to-coral-300 blur-2xl" 
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-blush-50 flex items-center justify-center text-5xl shadow-lg border-2 border-white">
          {emoji}
        </div>
      </motion.div>
      {title && <p className="font-display font-bold text-blush-600 mb-2 text-xl">{title}</p>}
      <p className="text-sm text-blush-500 font-medium max-w-xs leading-relaxed mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button size="md" onClick={onAction} icon variant="success">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-6">
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0], y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="text-6xl"
      >
        😵
      </motion.div>
      <div>
        <p className="text-coral-600 font-display font-bold text-lg mb-2">Oops!</p>
        <p className="text-coral-500 font-medium text-base max-w-sm">{message}</p>
      </div>
      {onRetry && <Button onClick={onRetry} variant="primary">Try Again</Button>}
    </div>
  );
}

// ─── Skeleton loading placeholder ───
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

// ─── Section title with consistent styling ───
export function SectionTitle({
  title,
  subtitle,
  action,
  actionLabel = 'See all',
}: {
  title: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3">
      <div className="min-w-0">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-fluid-h2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blush-600 via-coral-600 to-sunny-600 leading-tight"
        >
          {title}
        </motion.h2>
        {subtitle && <p className="text-blush-500 mt-2 text-sm sm:text-base font-semibold">{subtitle}</p>}
      </div>
      {action && (
        <motion.button
          onClick={action}
          whileHover={{ x: 4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 text-blush-600 font-display font-bold hover:text-coral-600 transition-all text-sm sm:text-base shrink-0 touch-target-sm"
        >
          <span className="hidden sm:inline">{actionLabel}</span>
          <span className="sm:hidden">All</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      )}
    </div>
  );
}

// ─── Toast notification system ───
type Toast = { id: number; message: string; type: 'success' | 'info' | 'error'; emoji?: string };
let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: 'success' | 'info' | 'error' = 'success', emoji?: string) {
  const toast: Toast = { id: ++toastId, message, type, emoji };
  toastListeners.forEach((l) => l(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((t) => [...t, toast]);
      setTimeout(() => remove(toast.id), 3000);
    };
    toastListeners.push(listener);
    return () => {
      const idx = toastListeners.indexOf(listener);
      if (idx > -1) toastListeners.splice(idx, 1);
    };
  }, [remove]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-xl font-display font-bold text-sm pointer-events-auto ${
              t.type === 'success' ? 'bg-gradient-to-r from-mint-400 to-forest-400 text-white' :
              t.type === 'error' ? 'bg-gradient-to-r from-coral-400 to-blush-400 text-white' :
              'bg-gradient-to-r from-sky-400 to-ocean-400 text-white'
            }`}
            style={{
              boxShadow: t.type === 'success' ? '0 8px 24px rgba(26, 215, 215, 0.4)' :
                         t.type === 'error' ? '0 8px 24px rgba(255, 20, 147, 0.4)' :
                         '0 8px 24px rgba(3, 169, 244, 0.4)'
            }}
          >
            {t.emoji && <span className="text-xl animate-bounce-in">{t.emoji}</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Stagger container for list animations ───
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};
