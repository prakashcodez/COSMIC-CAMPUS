
import React, { useState, useEffect } from 'react';
import { FocusState } from '../types';

interface FocusModalProps {
  focusState: FocusState;
  onStart: (minutes: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
}

const FocusModal: React.FC<FocusModalProps> = ({ focusState, onStart, onPause, onResume, onStop, onClose }) => {
  const [customDuration, setCustomDuration] = useState(15);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleIncreaseDuration = () => {
      setCustomDuration(prev => {
          if (prev >= 60) {
              return prev;
          }
          return prev + 1;
      });
      if (customDuration >= 60) {
          setErrorMessage("Please take a break");
      }
  };

  const handleDecreaseDuration = () => {
      setCustomDuration(prev => {
          if (prev <= 1) {
              return prev;
          }
          return prev - 1;
      });
      if (customDuration <= 1) {
          setErrorMessage("Minimum duration is 1 minute");
      }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const BreathingAnimation = () => (
    <div className="relative size-64 flex items-center justify-center my-8">
      {/* Outer Breath */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-breath"></div>
      <div className="absolute inset-8 rounded-full bg-cyan-500/20 animate-breath" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute inset-16 rounded-full bg-cyan-500/30 animate-breath" style={{ animationDelay: '1s' }}></div>
      
      {/* Core */}
      <div className="relative z-10 size-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-white animate-pulse">auto_awesome</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-zoom-in overflow-hidden">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 size-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-50 apple-glass-icon"
      >
        <span className="material-symbols-outlined text-white drop-shadow-md">close_fullscreen</span>
      </button>

      {/* Error message moved inside the main container to prevent overlap */}

      <div className="w-full max-w-md px-6 flex flex-col items-center relative z-10">
        
        {errorMessage && (
          <div className="mb-6 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold text-sm animate-pulse text-center w-full">
              {errorMessage}
          </div>
        )}

        {/* Status Text */}
        <h2 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-400 tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center ${focusState.status === 'completed' ? 'text-2xl mt-8' : 'text-3xl'}`}>
          {focusState.status === 'idle' ? 'Enter Focus Mode' : 
           focusState.status === 'break' ? 'Cosmic Break' : 
           focusState.status === 'completed' ? 'Congratulations!' :
           focusState.isPaused ? 'Session Paused' : 'Focus Active'}
        </h2>
        
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
          {focusState.status === 'idle' ? 'Set your trajectory' : 
           focusState.status === 'break' ? 'Recharge your energy' : 
           focusState.status === 'completed' ? 'Mission Accomplished' :
           'Maintain velocity'}
        </p>

        {/* Dynamic Visual */}
        {focusState.status === 'idle' ? (
           <div className="size-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-pulse">
              <span className="material-symbols-outlined text-6xl text-indigo-400">self_improvement</span>
           </div>
        ) : focusState.status === 'completed' ? (
           <div className="size-64 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(16,185,129,0.3)] relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
               <span className="material-symbols-outlined text-8xl text-emerald-400 animate-bounce drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">emoji_events</span>
               <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-ping opacity-20"></div>
           </div>
        ) : (
           <BreathingAnimation />
        )}

        {/* Timer Display */}
        {focusState.status !== 'idle' && focusState.status !== 'completed' && (
            <div className="text-7xl font-black text-white font-mono tracking-tighter mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {formatTime(focusState.timeLeft)}
            </div>
        )}

        {/* Controls */}
        {focusState.status === 'idle' && (
            <div className="w-full space-y-6">
                <div className="bg-[#1e2a36] p-2 rounded-2xl border border-white/10 flex items-center">
                    <button onClick={handleDecreaseDuration} className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-2xl font-black text-white">{customDuration}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase ml-1">min</span>
                    </div>
                    <button onClick={handleIncreaseDuration} className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>

                {/* Presets */}
                <div className="flex justify-between gap-2">
                    {[5, 15, 30, 45, 60].map(preset => (
                        <button
                            key={preset}
                            onClick={() => setCustomDuration(preset)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                                customDuration === preset 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {preset}m
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => onStart(customDuration)}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white text-lg font-black uppercase tracking-widest shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="material-symbols-outlined group-hover:rotate-45 transition-transform duration-500">rocket_launch</span>
                    <span className="relative z-10">Ignite Focus</span>
                </button>
            </div>
        )}

        {focusState.status === 'focus' && (
            <div className="flex gap-4 w-full">
                {!focusState.isPaused ? (
                    <button onClick={onPause} className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all">
                        Pause
                    </button>
                ) : (
                    <button onClick={onResume} className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">play_arrow</span>
                        Resume
                    </button>
                )}
                <button onClick={onStop} className="size-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/30 transition-all">
                    <span className="material-symbols-outlined">stop</span>
                </button>
            </div>
        )}

        {/* Break state technically unreachable with new logic, but kept for safety/future */}
        {focusState.status === 'break' && (
            <div className="w-full space-y-4">
                <button 
                    onClick={() => onStart(focusState.duration)}
                    className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">fast_forward</span>
                    Fast Resume ({focusState.duration}m)
                </button>
                <button onClick={onStop} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:text-white transition-all">
                    End Session
                </button>
            </div>
        )}

        {focusState.status === 'completed' && (
            <div className="fixed inset-0 z-[2100] bg-[#090e14] flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 size-64 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 size-64 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                <div className="relative z-10 w-full max-w-sm text-center space-y-8">
                    <div className="size-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-bounce">
                        <span className="material-symbols-outlined text-6xl text-white">emoji_events</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tight">Mission Success!</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">You've reached your destination</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Earned</p>
                            <p className="text-3xl font-black text-emerald-400">+100</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Sessions</p>
                            <p className="text-3xl font-black text-cyan-400">{focusState.totalSessions}</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 italic text-slate-300">
                        "The only limit to our realization of tomorrow will be our doubts of today."
                    </div>

                    <button 
                        onClick={onStop}
                        className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )}

      </div>
      
      {/* Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 size-64 bg-purple-600/10 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 size-64 bg-blue-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default FocusModal;
