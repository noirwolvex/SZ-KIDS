import { motion } from 'framer-motion';
import { useState } from 'react';

type MascotProps = {
  size?: number;
  className?: string;
  expression?: 'happy' | 'excited' | 'thinking';
};

export default function Mascot({ size = 120, className = '', expression = 'happy' }: MascotProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  
  const eyeY = expression === 'excited' ? 0 : expression === 'thinking' ? -2 : 0;
  
  // Continuous head tilt animation
  const headTiltVariants = {
    idle: {
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    clicked: {
      rotate: [0, 15, -15, 8, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  };

  const playSound = () => {
    // Create a fun sound effect using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    // Fun chirp sound
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleClick = () => {
    setIsClicked(true);
    playSound();
    
    // Trigger mouth animation
    setMouthOpen(true);
    setTimeout(() => setMouthOpen(false), 300);
    
    setTimeout(() => {
      setIsClicked(false);
    }, 500);
  };

  return (
    <motion.svg
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      viewBox="0 0 200 200"
      className={className}
      animate={isClicked ? { 
        y: [-10, -35, -20, -28, 0],
        rotate: [0, 8, -8, 5, 0]
      } : { 
        y: [0, -12, 0],
        rotate: 0
      }}
      transition={isClicked ? { 
        duration: 0.7, 
        ease: 'easeInOut' 
      } : { 
        duration: 4, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
      onClick={handleClick}
      role="button"
      aria-label="Wonders the owl mascot - click to interact"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </radialGradient>
        <radialGradient id="bellyGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#fffbf5" />
          <stop offset="100%" stopColor="#fff3e8" />
        </radialGradient>
      </defs>
      {/* body */}
      <motion.ellipse 
        cx="100" 
        cy="115" 
        rx="62" 
        ry="58" 
        fill="url(#bodyGrad)"
        animate={isClicked ? { scaleY: [1, 0.92, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.4 }}
      />
      {/* belly */}
      <ellipse cx="100" cy="130" rx="40" ry="38" fill="url(#bellyGrad)" />
      {/* ear tufts */}
      <path d="M55 70 L48 45 L72 62 Z" fill="#7dd3fc" />
      <path d="M145 70 L152 45 L128 62 Z" fill="#7dd3fc" />
      
      {/* LEFT WING/ARM */}
      <motion.g
        animate={isClicked ? {
          rotate: [0, -45, 0],
          x: [-5, -15, -5]
        } : {
          rotate: [-5, 5, -5],
          x: [0, -3, 0]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ transformOrigin: '60px 110px' }}
      >
        <ellipse cx="45" cy="110" rx="18" ry="35" fill="#7dd3fc" opacity="0.8" />
        <path d="M35 95 Q30 85 28 70" stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="25" cy="65" r="4" fill="#ffd24d" />
      </motion.g>
      
      {/* RIGHT WING/ARM */}
      <motion.g
        animate={isClicked ? {
          rotate: [0, 45, 0],
          x: [5, 15, 5]
        } : {
          rotate: [5, -5, 5],
          x: [0, 3, 0]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.05
        } : {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2
        }}
        style={{ transformOrigin: '140px 110px' }}
      >
        <ellipse cx="155" cy="110" rx="18" ry="35" fill="#7dd3fc" opacity="0.8" />
        <path d="M165 95 Q170 85 172 70" stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="175" cy="65" r="4" fill="#ffd24d" />
      </motion.g>
      {/* eye whites */}
      <circle cx="78" cy="95" r="20" fill="#fff" />
      <circle cx="122" cy="95" r="20" fill="#fff" />
      
      {/* pupils - with more sophisticated movement */}
      <motion.circle
        cx="80"
        cy={95 + eyeY}
        r="9"
        fill="#4a3a6b"
        animate={isClicked ? { 
          cx: [80, 75, 85, 80],
          cy: [95 + eyeY, 90 + eyeY, 100 + eyeY, 95 + eyeY],
          scale: [1, 1.15, 1.15, 1]
        } : {
          cx: [80, 83, 77, 80], 
          cy: [95 + eyeY, 92 + eyeY, 98 + eyeY, 95 + eyeY],
          scale: [1, 1.05, 1.05, 1]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.circle
        cx="120"
        cy={95 + eyeY}
        r="9"
        fill="#4a3a6b"
        animate={isClicked ? { 
          cx: [120, 115, 125, 120],
          cy: [95 + eyeY, 90 + eyeY, 100 + eyeY, 95 + eyeY],
          scale: [1, 1.15, 1.15, 1]
        } : {
          cx: [120, 123, 117, 120], 
          cy: [95 + eyeY, 92 + eyeY, 98 + eyeY, 95 + eyeY],
          scale: [1, 1.05, 1.05, 1]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {/* eye shine - professional reflection */}
      <motion.circle 
        cx="83" 
        cy="92" 
        r="3" 
        fill="#fff"
        animate={isClicked ? { 
          opacity: [1, 0.3, 1],
          r: [3, 2, 3]
        } : { 
          opacity: [1, 0.7, 1],
          r: [3, 3.5, 3]
        }}
        transition={isClicked ? {
          duration: 0.4
        } : {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.circle 
        cx="123" 
        cy="92" 
        r="3" 
        fill="#fff"
        animate={isClicked ? { 
          opacity: [1, 0.3, 1],
          r: [3, 2, 3]
        } : { 
          opacity: [1, 0.7, 1],
          r: [3, 3.5, 3]
        }}
        transition={isClicked ? {
          duration: 0.4
        } : {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {/* beak - professional animation */}
      <motion.path 
        d={mouthOpen ? "M100 108 L92 127 Q100 133 108 127 Z" : "M100 108 L92 118 Q100 124 108 118 Z"}
        fill="#ffd24d" 
        stroke="#fbbf24" 
        strokeWidth="1.5"
        animate={isClicked ? { 
          rotate: [0, 12, -12, 5, 0],
          scale: [1, 1.15, 1.15, 1.05, 1],
          y: [0, -2, 2, 1, 0]
        } : {}}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 0.2
        }}
        style={{ transformOrigin: '100px 115px' }}
      />
      {/* nose - animated with more sophistication */}
      <motion.circle
        cx="100"
        cy="110"
        r="3"
        fill="#fbbf24"
        animate={isClicked ? { 
          cy: [110, 107, 112, 110],
          r: [3, 5, 4.5, 3],
          scale: [1, 1.2, 1.1, 1]
        } : {
          cy: 110,
          r: 3,
          scale: 1
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 0.2
        }}
      />
      {/* cheeks - professional blush animation */}
      <motion.circle 
        cx="62" 
        cy="112" 
        r="9" 
        fill="#ffc9e3" 
        opacity="0.7"
        animate={isClicked ? { 
          r: [9, 14, 11, 9],
          opacity: [0.7, 1, 0.9, 0.7]
        } : {
          r: [9, 10, 9],
          opacity: [0.7, 0.8, 0.7]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.circle 
        cx="138" 
        cy="112" 
        r="9" 
        fill="#ffc9e3" 
        opacity="0.7"
        animate={isClicked ? { 
          r: [9, 14, 11, 9],
          opacity: [0.7, 1, 0.9, 0.7]
        } : {
          r: [9, 10, 9],
          opacity: [0.7, 0.8, 0.7]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {/* feet - professional stomp animation */}
      <motion.ellipse 
        cx="85" 
        cy="172" 
        rx="12" 
        ry="6" 
        fill="#ffd24d"
        animate={isClicked ? { 
          y: [-8, 8, -2, 0],
          scaleX: [1, 0.85, 0.95, 1],
          scaleY: [1, 1.15, 1.05, 1]
        } : {
          y: [0, -1, 0],
          scaleX: [1, 1.02, 1]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut'
        } : {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.ellipse 
        cx="115" 
        cy="172" 
        rx="12" 
        ry="6" 
        fill="#ffd24d"
        animate={isClicked ? { 
          y: [-8, 8, -2, 0],
          scaleX: [1, 0.85, 0.95, 1],
          scaleY: [1, 1.15, 1.05, 1]
        } : {
          y: [0, -1, 0],
          scaleX: [1, 1.02, 1]
        }}
        transition={isClicked ? {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.05
        } : {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1
        }}
      />
    </motion.svg>
  );
}
