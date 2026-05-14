export interface IAudioService {
  playBeep(frequency?: number, duration?: number): void;
  playFinish(): void;
  playTransition(): void;
}

export class AudioService implements IAudioService {
  private audioContext: AudioContext | null = null;

  private initContext() {
    if (typeof window === 'undefined') return;
    
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public playBeep(frequency = 880, duration = 0.5): void {
    if (typeof window === 'undefined') return;

    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback inhibited or failed:', e);
    }
  }

  public playFinish(): void {
    // Pleasant "success" sound: A4 -> C#5 -> E5
    this.playBeep(440, 0.2);
    setTimeout(() => this.playBeep(554.37, 0.2), 150);
    setTimeout(() => this.playBeep(659.25, 0.4), 300);
  }

  public playTransition(): void {
    // Short beep for phase changes
    this.playBeep(880, 0.1);
  }
}

// Singleton for easy access in hooks if needed, although we prefer DI
export const defaultAudioService = new AudioService();
