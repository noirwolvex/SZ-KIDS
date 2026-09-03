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
  screen_time_limit: number;
  pin: string;
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
  screen_time_limit: 60,
  pin: '',
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
        screen_time_limit: settings.screen_time_limit,
        pin: settings.pin ?? '',
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
      form.safe_mode !== settings.safe_mode ||
      form.screen_time_limit !== settings.screen_time_limit ||
      form.pin !== (settings.pin ?? '')
    );
  }, [form, settings]);

  const update = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ ...form, pin: form.pin.trim() || null });
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
      await save({ ...DEFAULTS, pin: null });
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-300 to-sky-300 flex items-center justify-center shadow-soft">
                <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <Sparkles className="text-white" size={26} />
                </motion.div>
              </div>
              <div>
                <h1 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">Settings</h1>
                <p className="text-lavender-400 text-sm">Make Wonder Kids just right for you.</p>
              </div>
            </div>
          </motion.div>

          <Section title="Sound" subtitle="Audio experience" icon={<Volume2 size={20} />} gradient="from-sky-200 to-lavender-200">
            <Toggle label="Sound Effects" desc="Pops, stars, and rewards" value={form.sound} onChange={(v) => update('sound', v)} icon={<Volume2 size={18} />} />
            <Toggle label="Background Music" desc="Cheerful tunes while playing" value={form.music} onChange={(v) => update('music', v)} icon={<Music size={18} />} />
          </Section>

          <Section title="Accessibility" subtitle="Reading & visibility" icon={<Eye size={20} />} gradient="from-mint-200 to-sky-200">
            <Toggle label="Large Text" desc="Bigger, easier-to-read text" value={form.large_text} onChange={(v) => update('large_text', v)} icon={<Type size={18} />} />
            <Toggle label="High Contrast" desc="Stronger colors for visibility" value={form.high_contrast} onChange={(v) => update('high_contrast', v)} icon={<Contrast size={18} />} />
          </Section>

          <Section title="Preferences" subtitle="Personalization" icon={<Globe size={20} />} gradient="from-peach-200 to-lemon-200">
            <div className="flex items-center justify-between py-3.5 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Languages size={18} className="text-lavender-400 shrink-0" />
                <div>
                  <p className="text-sm font-display font-semibold text-lavender-500">Language</p>
                  <p className="text-xs text-lavender-400">App display language</p>
                </div>
              </div>
              <div className="relative shrink-0">
                <select value={form.language} onChange={(e) => update('language', e.target.value)} className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-semibold focus:outline-none cursor-pointer text-sm touch-target-sm border border-lavender-200">
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-lavender-400 pointer-events-none" />
              </div>
            </div>
            <Toggle label="Notifications" desc="Daily reminders to learn" value={form.notifications} onChange={(v) => update('notifications', v)} icon={<Bell size={18} />} />
            <Toggle label="Dark Mode" desc="Easier on eyes at night" value={form.dark_mode} onChange={(v) => update('dark_mode', v)} icon={<Moon size={18} />} />
          </Section>

          <Section title="Safety" subtitle="Kid-friendly protections" icon={<Shield size={20} />} gradient="from-mint-200 to-lemon-200">
            <Toggle label="Safe Mode" desc="Filtered, age-appropriate content only" value={form.safe_mode} onChange={(v) => update('safe_mode', v)} icon={<Shield size={18} />} />
            <div className="flex items-start gap-2.5 pt-3 pb-1">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-mint-100 flex items-center justify-center"><Heart size={16} className="text-mint-500" /></div>
              <p className="text-xs text-lavender-400 leading-relaxed">Wonder Kids is COPPA-friendly, ad-free, and never tracks or shares your child's data. Safe Mode ensures only age-appropriate games and lessons appear.</p>
            </div>
          </Section>

          <Section title="Screen Time & Parent PIN" subtitle="Limits and parental protection" icon={<Shield size={20} />} gradient="from-sky-200 to-mint-200">
            <div className="flex items-center justify-between py-3.5 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ClockIcon />
                <div><p className="text-sm font-display font-semibold text-lavender-500">Daily Screen Time</p><p className="text-xs text-lavender-400">Maximum minutes allowed per day</p></div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input type="number" min={5} max={240} step={5} value={form.screen_time_limit} onChange={(e) => update('screen_time_limit', Math.min(240, Math.max(5, Number(e.target.value) || 5)))} className="w-24 py-2.5 px-3 rounded-2xl bg-lavender-100 border border-lavender-200 text-lavender-500 font-display font-semibold text-center focus:outline-none focus:border-lavender-300" aria-label="Daily screen time limit in minutes" />
                <span className="text-sm font-semibold text-lavender-400">min</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 py-3.5 border-t border-lavender-100">
              <div className="flex items-center gap-2 min-w-0">
                <Lock size={18} className="text-lavender-400 shrink-0" />
                <div><p className="text-sm font-display font-semibold text-lavender-500">Parent PIN</p><p className="text-xs text-lavender-400">Optional 4–6 digit PIN for parent-only controls</p></div>
              </div>
              <input type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={form.pin} onChange={(e) => update('pin', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Leave blank to remove" className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-lavender-100 focus:border-lavender-300 focus:outline-none text-lavender-500 font-medium tracking-[0.35em]" aria-label="Parent PIN" />
            </div>
          </Section>

          <Section title="Help & Support" subtitle="Guides and contact" icon={<HelpCircle size={20} />} gradient="from-blush-200 to-peach-200">
            <div className="space-y-2 pt-1">
              {[{ label: 'How to play games', icon: <Star size={18} />, emoji: '🎮' }, { label: 'Change my avatar', icon: <Smile size={18} />, emoji: '🎭' }, { label: 'Parent dashboard guide', icon: <Info size={18} />, emoji: '📊' }, { label: 'Contact support', icon: <Mail size={18} />, emoji: '✉️' }].map((h) => (
                <button key={h.label} onClick={() => showToast('Coming soon!', 'info', h.emoji)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-lavender-50 hover:bg-lavender-100 active:scale-[0.98] text-left touch-target-sm transition-all group">
                  <div className="flex items-center gap-3 min-w-0"><span className="shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lavender-400 shadow-sm group-hover:text-lavender-500 transition-colors">{h.icon}</span><span className="text-sm font-display font-semibold text-lavender-500">{h.label}</span></div>
                  <ChevronRight size={18} className="text-lavender-300 shrink-0 group-hover:text-lavender-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Section>

          <Section title="Account" subtitle="Session management" icon={<Lock size={20} />} gradient="from-lavender-200 to-blush-200">
            <AnimatePresence mode="wait">
              {confirmSignOut ? (
                <motion.div key="confirm-signout" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="py-3 space-y-3"><p className="text-sm text-lavender-500 font-display font-semibold text-center">Are you sure you want to sign out?</p><div className="flex gap-2 justify-center"><Button size="sm" variant="secondary" onClick={() => setConfirmSignOut(false)}>Cancel</Button><Button size="sm" variant="success" onClick={() => signOut()}><LogOut size={16} /> Sign Out</Button></div></div>
                </motion.div>
              ) : (
                <motion.div key="signout-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-3"><button onClick={() => setConfirmSignOut(true)} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-blush-50 hover:bg-blush-100 text-blush-500 font-display font-semibold text-sm transition-all active:scale-[0.98] touch-target-sm"><LogOut size={18} /> Sign Out</button></motion.div>
              )}
            </AnimatePresence>
          </Section>
        </div>
      </div>

      <AnimatePresence>
        {dirty && !confirmReset && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto max-w-3xl px-4 pb-4"><div className="glass-strong rounded-3xl shadow-soft-lg p-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5 min-w-0"><div className="relative shrink-0"><motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-9 h-9 rounded-xl bg-gradient-to-br from-lemon-200 to-peach-200 flex items-center justify-center"><Sparkles size={18} className="text-peach-500" /></motion.div></div><div className="min-w-0"><p className="font-display font-semibold text-sm text-lavender-500 truncate">Unsaved changes</p><p className="text-xs text-lavender-400">Save to keep your settings</p></div></div><div className="flex items-center gap-2 shrink-0"><AnimatePresence>{saved && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1.5 text-mint-500 font-display font-semibold text-sm"><Check size={16} /> Saved!</motion.div>}</AnimatePresence><Button size="sm" onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}</Button></div></div></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-lavender-500/20 backdrop-blur-sm" onClick={() => setConfirmReset(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass-strong rounded-4xl shadow-soft-lg p-6 w-full max-w-md">
              <h3 className="font-display text-xl font-bold text-lavender-500">Reset settings?</h3>
              <p className="text-sm text-lavender-400 mt-2">This will restore all settings to their defaults.</p>
              <div className="flex gap-2 justify-end mt-5"><Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="primary" onClick={handleReset} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <><RotateCcw size={16} /> Reset</>}</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClockIcon() {
  return <span className="shrink-0 w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-400" aria-hidden="true">⏱️</span>;
}

function Section({ title, subtitle, icon, gradient, children }: { title: string; subtitle: string; icon: React.ReactNode; gradient: string; children: React.ReactNode }) {
  return <Card className="p-5 sm:p-6 mb-4"><div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lavender-500 shrink-0`}>{icon}</div><div><h2 className="font-display font-bold text-lavender-500">{title}</h2><p className="text-xs text-lavender-400">{subtitle}</p></div></div><div className="divide-y divide-lavender-100">{children}</div></Card>;
}

function Toggle({ label, desc, value, onChange, icon }: { label: string; desc: string; value: boolean; onChange: (value: boolean) => void; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between py-3.5 gap-3"><div className="flex items-center gap-2 min-w-0"><div className="shrink-0 w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-400">{icon}</div><div><p className="text-sm font-display font-semibold text-lavender-500">{label}</p><p className="text-xs text-lavender-400">{desc}</p></div></div><button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${value ? 'bg-mint-400' : 'bg-lavender-200'}`}><span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-soft transition-transform ${value ? 'left-6' : 'left-1'}`} /></button></div>;
}
