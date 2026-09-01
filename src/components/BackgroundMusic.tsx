import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSettings } from '@/lib/hooks';

type MusicContextValue = {
  isMusicOn: boolean;
  toggleMusic: () => void;
};

const MusicContext = createContext<MusicContextValue>({
  isMusicOn: true,
  toggleMusic: () => {},
});

const MUSIC_PATH = '/music/paulyudin-kids-happy-happy-kids-475338.mp3';

export function useMusicContext() {
  return useContext(MusicContext);
}

export default function BackgroundMusic({ children }: { children: ReactNode }) {
  const { settings, loading } = useSettings();
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startMusic = () => {
    setHasInteracted(true);

    if (!audioRef.current) {
      const audio = new Audio(MUSIC_PATH);
      audio.loop = true;
      audio.volume = 0.55;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    if (audioRef.current && settings?.music !== false && isMusicOn) {
      audioRef.current.play().catch(() => {
        // Browser will allow playback after a valid user gesture.
      });
    }
  };

  useEffect(() => {
    const handleInteraction = () => startMusic();

    window.addEventListener('pointerdown', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [settings?.music, isMusicOn]);

  useEffect(() => {
    if (loading) return;

    const enabledBySetting = settings?.music !== false;
    const shouldPlay = enabledBySetting && isMusicOn && hasInteracted;

    if (!audioRef.current) {
      const audio = new Audio(MUSIC_PATH);
      audio.loop = true;
      audio.volume = 0.55;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    if (!shouldPlay) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }

    audioRef.current.play().catch(() => {
      // The browser needs an actual tap/keydown before audio can start.
    });
  }, [settings?.music, loading, isMusicOn, hasInteracted]);

  const toggleMusic = () => {
    setHasInteracted(true);
    setIsMusicOn((current) => !current);
  };

  const value = useMemo<MusicContextValue>(() => ({
    isMusicOn,
    toggleMusic,
  }), [isMusicOn]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}


