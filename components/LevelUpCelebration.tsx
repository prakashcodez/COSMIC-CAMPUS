import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpCelebrationProps {
  level: number;
  onClose: () => void;
}

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ level, onClose }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence of animations
    const t1 = setTimeout(() => setStage(1), 500); // Show text
    const t2 = setTimeout(() => setStage(2), 2000); // Show particles/burst
    const t3 = setTimeout(() => setStage(3), 4500); // Show continue button

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const getTheme = (lvl: number) => {
    if (lvl === 100) return { color: 'from-yellow-300 via-amber-500 to-orange-600', glow: 'shadow-amber-500/50', particle: '#fbbf24' };
    if (lvl === 75) return { color: 'from-pink-300 via-rose-500 to-red-600', glow: 'shadow-rose-500/50', particle: '#f43f5e' };
    if (lvl === 50) return { color: 'from-cyan-300 via-blue-500 to-purple-600', glow: 'shadow-blue-500/50', particle: '#60a5fa' };
    return { color: 'from-emerald-300 via-teal-500 to-cyan-600', glow: 'shadow-teal-500/50', particle: '#2dd4bf' };
  };

  const theme = getTheme(level);
  const themeColor = theme.color;
  const glowColor = theme.glow;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden"
      >
        {/* Background ambient glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute w-[150vw] h-[150vw] md:w-[80vw] md:h-[80vw] rounded-full blur-[100px] opacity-30 bg-gradient-to-tr ${themeColor} pointer-events-none`}
        />

        {/* Particles / Stars */}
        {stage >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50vw", 
                  y: "50vh", 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}vw`, 
                  y: `${Math.random() * 100}vh`,
                  scale: [0, Math.random() * 2 + 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1.5,
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
                className={`absolute w-2 h-2 rounded-full bg-white ${glowColor} shadow-[0_0_10px_rgba(255,255,255,0.8)]`}
                style={{
                  backgroundColor: Math.random() > 0.5 ? theme.particle : '#ffffff'
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Level Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
            className={`w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl ${glowColor} bg-black/50 backdrop-blur-md mb-8 relative`}
          >
            <div className={`absolute inset-0 rounded-full border-t-4 border-transparent bg-gradient-to-r ${themeColor} opacity-50 animate-spin`} style={{ animationDuration: '3s' }} />
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm md:text-lg font-bold text-slate-300 uppercase tracking-[0.3em] mb-1">Level</span>
              <span className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b ${themeColor} drop-shadow-lg`}>
                {level}
              </span>
            </div>
          </motion.div>

          {/* Congratulatory Text */}
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4 max-w-md"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {level === 100 ? 'LEGENDARY!' : level === 75 ? 'UNSTOPPABLE!' : level === 50 ? 'INCREDIBLE!' : 'AMAZING!'}
              </h1>
              <p className="text-lg text-slate-300 font-medium">
                {level === 100 
                  ? "You've reached the ultimate milestone. Level 100 is a testament to your unwavering dedication and cosmic focus."
                  : level === 75
                  ? "Three-quarters to a hundred! Your momentum is absolutely unstoppable."
                  : level === 50
                  ? "Halfway to a hundred! Your consistency is paying off. Keep pushing your limits."
                  : "A quarter of the way to a hundred! You're building incredible habits."}
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="mt-6 inline-flex items-center gap-2 text-white/90 bg-white/10 px-5 py-3 rounded-full border border-white/20 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm animate-pulse">photo_camera</span>
                <span className="text-xs font-bold uppercase tracking-widest">Take a screenshot to celebrate your milestone!</span>
              </motion.div>
            </motion.div>
          )}

          {/* Continue Button */}
          {stage >= 3 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`mt-12 px-10 py-4 rounded-full font-black text-white tracking-widest uppercase text-sm shadow-xl ${glowColor} bg-gradient-to-r ${themeColor} hover:opacity-90 transition-opacity`}
            >
              Continue Journey
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelUpCelebration;
