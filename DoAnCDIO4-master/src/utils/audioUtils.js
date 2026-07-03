export const playNotificationSound = (type = 'ting') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    
    const playTone = (freq, type, duration, startTime) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;

    if (type === 'beep') {
      playTone(600, 'square', 0.3, now);
    } else if (type === 'tingting') {
      playTone(880, 'sine', 0.4, now);
      playTone(1320, 'sine', 0.5, now + 0.15);
    } else {
      // Default 'ting'
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      oscillator.start(now);
      oscillator.stop(now + 0.6);
    }
  } catch (e) {
    console.error('Audio play failed:', e);
  }
};
