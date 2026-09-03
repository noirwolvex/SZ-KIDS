import { motion, AnimatePresence, useMemo, useState, useEffect } from 'framer-motion';
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
            <Toggle label="Notifications" desc="Learning reminders" value={form.notifications} onChange={(v) => update('notifications', v)} icon={<Bell size={18} />} />
            <Toggle label="Dark Mode" desc="Easier on eyes at night" value={form.dark_mode} onChange={(v) => update('dark_mode', v)} icon={<Moon size={18} />} />
          </Section>

          <Section title="Safety" subtitle="Kid-friendly protections" icon={<Shield size={20} />} gradient="from-mint-200 to-lemon-200">
            <Toggle label="Safe Mode" desc="Filtered, age-appropriate content only" value={form.safe_mode} onChange={(v) => update('safe_mode', v)} icon={<Shield size={18} />} />
            <div className="flex items-start gap-2.5 pt-3 pb-1">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-mint-100 flex items-center justify-center">
                <Heart size={16} className="text-mint-500" />
              </div>
              <p className="text-xs text-lavender-400 leading-relaxed">
                Wonder Kids is ad-free. Safe Mode is designed to keep the experience focused on age-appropriate games and lessons.
              </p>
            </div>
          </Section>

          <Section title="Help & Support" subtitle="Guides and contact" icon={<HelpCircle size={20} />} gradient="from-blush-200 to-peach-200">
            <div className="space-y-2 pt-1">
              {[
                { label: 'How to play games', icon: <Star size={18} />, emoji: '🎮' },
                { label: 'Change my avatar', icon: <Smile size={18} />, emoji: '🎭' },
                { label: 'Parent dashboard guide', icon: <Info size={18} />, emoji: '📊' },
                { label: 'Contact support', icon: <Mail size={18} />, emoji: '✉️' },
              ].map((h) => (
                <button key={h.label} onClick={() => showToast('Coming soon!', 'info', h.emoji)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-lavender-50 hover:bg-lavender-100 active:scale-[0.98] text-left touch-target-sm transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lavender-400 shadow-sm group-hover:text-lavender-500 transition-colors">{h.icon}</span>
                    <span className="text-sm font-display font-semibold text-lavender-500">{h.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-lavender-300 shrink-0 group-hover:text-lavender-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Section>

          <Section title="Account" subtitle="Session management" icon={<Lock size={20} />} gradient="from-lavender-200 to-blush-200">
            <AnimatePresence mode="wait">
              {confirmSignOut ? (
                <div className="rounded-2xl bg-blush-50 border border-blush-100 p-4">
                  <p className="text-sm font-semibold text-blush-500">Sign out of this Wonder Kids account?</p>
                  <div className="flex gap-2 mt-3"><Button variant="secondary" size="sm" onClick={() => setConfirmSignOut(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={() => void signOut()}>Sign Out</Button></div>
                </div>
              ) : (
                <button onClick={() => setConfirmSignOut(true)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-lavender-50 hover:bg-blavender-100 text-left transition-colors"><LogOut size={18} className="text-lavender-400" /><span className="text-sm font-display font-semibold text-lavender-500">Sign Out</span></button>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="secondary" size="md" disabled={saving} onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset</Button>
              <Button variant="primary" size="md" disabled={saving || !dirty} onClick={() => void handleSave()}>{saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}{saved ? 'Saved' : 'Save Changes'}</Button>
            </div>
          </Section>

          {confirmReset && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/20 px-4">
              <Card className="w-full max-w-md p-6"><h2 className="font-display text-xl font-bold text-lavender-500">Reset settings?</h2><p className="mt-2 text-sm text-lavender-400">Your sound, accessibility, language, safety, and notification preferences will return to their defaults.</p><div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="primary" disabled={saving} onClick={() => void handleReset()}>Reset</Button></div></Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, icon, value, onChange }: { label: string; desc: string; icon: React.ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-display font-semibold text-lavender-500 flex items-center gap-1.5">{icon} {label}</p><p className="text-xs text-lavender-400">{desc}</p></div>
      <button onClick={() => onChange(!value)} role="switch" aria-checked={value} className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-mint-400' : 'bg-lavender-200'}`} aria-label={label}>
        <motion.div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-soft" animate={{ left: value ? '26px' : '4px' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </div>
  );
}
