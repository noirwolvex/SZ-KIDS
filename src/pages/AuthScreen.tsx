import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = mode === 'signup'
      ? await signUp(email, password, name || 'Young Learner')
      : await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground density="medium" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-strong rounded-4xl shadow-soft-lg p-6 sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-300 to-lavender-400 flex items-center justify-center shadow-soft mb-3"
            >
              <span className="text-3xl">🦉</span>
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-lavender-500">
              Wonder<span className="text-blush-400">Kids</span>
            </h1>
            <p className="text-lavender-400 text-sm mt-1 font-medium">
              {mode === 'signup' ? 'Create your learning adventure' : 'Welcome back, explorer!'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 p-1 rounded-2xl bg-lavender-100 mb-5">
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                mode === 'signup' ? 'bg-white text-lavender-500 shadow-soft' : 'text-lavender-400'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                mode === 'signin' ? 'bg-white text-lavender-500 shadow-soft' : 'text-lavender-400'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-display font-semibold text-lavender-500 mb-1.5">
                  Child's Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lavender-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-lavender-100 focus:border-lavender-300 focus:outline-none text-lavender-500 font-medium placeholder:text-lavender-200 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-display font-semibold text-lavender-500 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lavender-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-lavender-100 focus:border-lavender-300 focus:outline-none text-lavender-500 font-medium placeholder:text-lavender-200 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-display font-semibold text-lavender-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lavender-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-lavender-100 focus:border-lavender-300 focus:outline-none text-lavender-500 font-medium placeholder:text-lavender-200 transition-colors"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blush-50 border border-blush-100"
                >
                  <AlertCircle size={18} className="text-blush-500 shrink-0" />
                  <span className="text-sm text-blush-500 font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <Sparkles size={18} />
                  Start Learning
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-lavender-300 mt-5 font-medium">
            {mode === 'signup'
              ? 'Parents: create an account for your child to save progress across devices.'
              : 'Sign in to continue your learning journey.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
