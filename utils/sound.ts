let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio play failed:', e);
  }
};

export const sounds = {
  click: () => playTone(600, 'sine', 0.1, 0.05),
  budget: () => {
    playTone(800, 'square', 0.1, 0.05);
    setTimeout(() => playTone(1200, 'square', 0.2, 0.05), 100);
  },
  focusPlus: () => playTone(400, 'sine', 0.1, 0.05),
  inspiration: () => {
    playTone(523.25, 'sine', 0.1, 0.05); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.1, 0.05), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.2, 0.05), 200); // G5
  },
  checklist: () => playTone(800, 'triangle', 0.1, 0.05),
  habit: () => playTone(700, 'sine', 0.1, 0.05),
  resource: () => playTone(300, 'triangle', 0.1, 0.05),
  milestone: () => {
    playTone(440, 'sine', 0.1, 0.05); // A4
    setTimeout(() => playTone(554.37, 'sine', 0.1, 0.05), 100); // C#5
    setTimeout(() => playTone(659.25, 'sine', 0.3, 0.05), 200); // E5
  },
  levelUp: () => {
    playTone(523.25, 'square', 0.1, 0.05); // C5
    setTimeout(() => playTone(659.25, 'square', 0.1, 0.05), 100); // E5
    setTimeout(() => playTone(783.99, 'square', 0.1, 0.05), 200); // G5
    setTimeout(() => playTone(1046.50, 'square', 0.4, 0.05), 300); // C6
  },
  task: () => playTone(900, 'sine', 0.1, 0.05),
};

export const playSound = (soundName: keyof typeof sounds) => {
  try {
    if (sounds[soundName]) {
      sounds[soundName]();
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
