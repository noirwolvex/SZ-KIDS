import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Volume2, Eye, Globe, Bell, Shield, Moon, HelpCircle, Loader2, Check,
  LogOut, RotateCcw, ChevronRight, Sparkles, Music, Type, Contrast,
  Languages, Mail, Lock, Info, Heart, Star, Smile,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, Button, showToast } from '@/components/ui';
import { useSettings } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese'];

type SettingsData = {
  sound: boolean;
  music: boolean;
  large_text: boolean;
  high_contrast: boolean;
  notifications: boolean;
  dark_mode: boolean;
  language: string;
  safe_mode: boolean;
};

const DEFAULTS: SettingsData = {
  sound: true,
  music: true,
  large_text: false,
  high_contrast: false,
  notifications: true,
  dark_mode: false,
  language: 'English',
  safe_mode: true,
};

export default function Settings() {
  const { settings, loading, error, save } = useSettings();
  const { signOut } = useAuth();

  const [form, setForm] = useState<SettingsData>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        sound: settings.sound,
        music: settings.music,
        large_text: settings.large_text,
        high_contrast: settings.high_contrast,
        notifications: settings.notifications,
        dark_mode: settings.dark_mode,
        language: settings.language,
        safe_mode: settings.safe_mode,
      });
    }
  }, [settings]);

  const dirty = useMemo(() => {
    if (!settings) return false;
    return (
      form.sound !== settings.sound ||
      form.music !== settings.music ||
      form.large_text !== settings.large_text ||
      form.high_contrast !== settings.high_contrast ||
      form.notifications !== settings.notifications ||
      form.dark_mode !== settings.dark_mode ||
      form.language !== settings.language ||
      form.safe_mode !== settings.safe_mode
    );
  }, [form, settings]);

  const update = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      showToast('Could not save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setForm(DEFAULTS);
    try {
      await save(DEFAULTS);
      setSaved(true);
      setConfirmReset(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      showToast('Could not reset settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground density="low" />
        <Loader2 className="animate-spin text-lavender-400" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-32 md:pb-12 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-300 to-sky-300 flex items-center justify-center shadow-soft">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="text-white" size={26} />
                </motion.div>
              </div>
              <div>
                <h1 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
                  Settings
                </h1>
                <p className="text-lavender-400 text-sm">Make Wonder Kids just right for you.</p>
              </div>
            </div>
          </motion.div>

          {/* Sound */}
          <Section
            title="Sound"
            subtitle="Audio experience"
            icon={<Volume2 size={20} />}
            gradient="from-sky-200 to-lavender-200"
          >
            <Toggle
              label="Sound Effects"
              desc="Pops, stars, and rewards"
              value={form.sound}
              onChange={(v) => update('sound', v)}
              icon={<Volume2 size={18} />}
            />
            <Toggle
              label="Background Music"
              desc="Cheerful tunes while playing"
              value={form.music}
              onChange={(v) => update('music', v)}
              icon={<Music size={18} />}
            />
          </Section>

          {/* Accessibility */}
          <Section
            title="Accessibility"
            subtitle="Reading & visibility"
            icon={<Eye size={20} />}
            gradient="from-mint-200 to-sky-200"
          >
            <Toggle
              label="Large Text"
              desc="Bigger, easier-to-read text"
              value={form.large_text}
              onChange={(v) => update('large_text', v)}
              icon={<Type size={18} />}
            />
            <Toggle
              label="High Contrast"
              desc="Stronger colors for visibility"
              value={form.high_contrast}
              onChange={(v) => update('high_contrast', v)}
              icon={<Contrast size={18} />}
            />
          </Section>

          {/* Preferences */}
          <Section
            title="Preferences"
            subtitle="Personalization"
            icon={<Globe size={20} />}
            gradient="from-peach-200 to-lemon-200"
          >
            <div className="flex items-center justify-between py-3.5 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Languages size={18} className="text-lavender-400 shrink-0" />
                <div>
                  <p className="text-sm font-display font-semibold text-lavender-500">Language</p>
                  <p className="text-xs text-lavender-400">App display language</p>
                </div>
              </div>
              <div className="relative shrink-0">
                <select
                  value={form.language}
                  onChange={(e) => update('language', e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-semibold focus:outline-none cursor-pointer text-sm touch-target-sm border border-lavender-200"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-lavender-400 pointer-events-none" />
              </div>
            </div>
            <Toggle
              label="Notifications"
              desc="Daily reminders to learn"
              value={form.notifications}
              onChange={(v) => update('notifications', v)}
              icon={<Bell size={18} />}
            />
            <Toggle
              label="Dark Mode"
              desc="Easier on eyes at night"
              value={form.dark_mode}
              onChange={(v) => update('dark_mode', v)}
              icon={<Moon size={18} />}
            />
          </Section>

          {/* Safety */}
          <Section
            title="Safety"
            subtitle="Kid-friendly protections"
            icon={<Shield size={20} />}
            gradient="from-mint-200 to-lemon-200"
          >
            <Toggle
              label="Safe Mode"
              desc="Filtered, age-appropriate content only"
              value={form.safe_mode}
              onChange={(v) => update('safe_mode', v)}
              icon={<Shield size={18} />}
            />
            <div className="flex items-start gap-2.5 pt-3 pb-1">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-mint-100 flex items-center justify-center">
                <Heart size={16} className="text-mint-500" />
              </div>
              <p className="text-xs text-lavender-400 leading-relaxed">
                Wonder Kids is COPPA-friendly, ad-free, and never tracks or shares your child's data.
                Safe Mode ensures only age-appropriate games and lessons appear.
              </p>
            </div>
          </Section>

          {/* Help */}
          <Section
            title="Help & Support"
            subtitle="Guides and contact"
            icon={<HelpCircle size={20} />}
            gradient="from-blush-200 to-peach-200"
          >
            <div className="space-y-2 pt-1">
              {[
                { label: 'How to play games', icon: <Star size={18} />, emoji: '🎮' },
                { label: 'Change my avatar', icon: <Smile size={18} />, emoji: '🎭' },
                { label: 'Parent dashboard guide', icon: <Info size={18} />, emoji: '📊' },
                { label: 'Contact support', icon: <Mail size={18} />, emoji: '✉️' },
              ].map((h) => (
                <button
                  key={h.label}
                  onClick={() => showToast('Coming soon!', 'info', h.emoji)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-lavender-50 hover:bg-lavender-100 active:scale-[0.98] text-left touch-target-sm transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lavender-400 shadow-sm group-hover:text-lavender-500 transition-colors">
                      {h.icon}
                    </span>
                    <span className="text-sm font-display font-semibold text-lavender-500">{h.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-lavender-300 shrink-0 group-hover:text-lavender-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Section>

          {/* Account */}
          <Section
            title="Account"
            subtitle="Session management"
            icon={<Lock size={20} />}
            gradient="from-lavender-200 to-blush-200"
          >
            <AnimatePresence mode="wait">
              {confirmSignOut ? (
                <motion.div
                  key="confirm-signout"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="py-3 space-y-3">
                    <p className="text-sm text-lavender-500 font-display font-semibold text-center">
                      Are you sure you want to sign out?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConfirmSignOut(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" variant="success" onClick={() => signOut()}>
                        <LogOut size={16} /> Sign Out
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signout-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-3"
                >
                  <button
                    onClick={() => setConfirmSignOut(true)}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-blush-50 hover:bg-blush-100 text-blush-500 font-display font-semibold text-sm transition-all active:scale-[0.98] touch-target-sm"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>
        </div>
      </div>

      {/* Sticky save bar */}
      <AnimatePresence>
        {dirty && !confirmReset && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
          >
            <div className="mx-auto max-w-3xl px-4 pb-4">
              <div className="glass-strong rounded-3xl shadow-soft-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-lemon-200 to-peach-200 flex items-center justify-center"
                    >
                      <Sparkles size={18} className="text-peach-500" />
                    </motion.div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-lavender-500 truncate">
                      Unsaved changes
                    </p>
                    <p className="text-xs text-lavender-400">Save to keep your settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AnimatePresence>
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 text-mint-500 font-display font-semibold text-sm"
                      >
                        <Check size={16} /> Saved!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-lavender-500/20 backdrop-blur-sm"
            onClick={() => setConfirmReset(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-4xl shadow-soft-lg p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-peach-100 flex items-center justify-center">
                  <RotateCcw size={22} className="text-peach-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lavender-500">Reset all settings?</h3>
                  <p className="text-xs text-lavender-400">This will restore the defaults.</p>
                </div>
              </div>
              <p className="text-sm text-lavender-400 mb-5 leading-relaxed">
                Your sound, accessibility, preferences, and safety settings will all go back to their original values.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
                <Button variant="secondary" size="sm" onClick={handleReset} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  Reset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button — floating, only when no dirty changes */}
      <AnimatePresence>
        {!dirty && !confirmReset && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setConfirmReset(true)}
            disabled={saving}
            className="fixed bottom-6 right-4 sm:right-6 z-40 w-12 h-12 rounded-2xl bg-white shadow-soft border border-lavender-100 flex items-center justify-center text-lavender-400 hover:text-lavender-500 hover:shadow-glow transition-all active:scale-95 touch-target"
            aria-label="Reset settings to default"
          >
            <RotateCcw size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  title,
  subtitle,
  icon,
  gradient,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card className="mt-4 sm:mt-5 overflow-hidden" hover={false}>
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-lavender-50">
          <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}>
            <div className="text-lavender-500">{icon}</div>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-lavender-500 leading-tight">{title}</h2>
            <p className="text-xs text-lavender-400">{subtitle}</p>
          </div>
        </div>
        {/* Section body */}
        <div className="px-5 sm:px-6 py-2 divide-y divide-lavender-50">{children}</div>
      </Card>
    </motion.div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
  icon,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${value ? 'bg-mint-100 text-mint-500' : 'bg-lavender-100 text-lavender-400'}`}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-display font-semibold text-lavender-500">{label}</p>
          <p className="text-xs text-lavender-400">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`relative w-12 h-7 rounded-full transition-colors touch-target-sm shrink-0 ${value ? 'bg-mint-400' : 'bg-lavender-200'}`}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-soft"
          animate={{ left: value ? '26px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        {value && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 -translate-y-1/2 left-1.5 text-white"
          >
            <Check size={12} strokeWidth={3} />
          </motion.div>
        )}
      </button>
    </div>
  );
}
