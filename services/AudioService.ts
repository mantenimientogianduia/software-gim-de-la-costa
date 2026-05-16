export enum AlarmType {
  TRADITIONAL = 'traditional', // 3 short beeps
  SUSTAINED = 'sustained',   // One long 2s beep
  PULSATING = 'pulsating',   // Rapid beeps for 2s
  ALARM_CLOCK = 'alarm_clock' // Long loud alarm (10s)
}

export interface IAudioService {
  playBeep(frequency?: number, duration?: number): void;
  playFinish(): void;
  playTransition(): void;
  playCountdownBeep(): void;
  unlock(): void;
  setAlarmType(type: AlarmType): void;
  getAlarmType(): AlarmType;
}

export class AudioService implements IAudioService {
  private audioContext: AudioContext | null = null;
  private alarmType: AlarmType = AlarmType.TRADITIONAL;

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

  public setAlarmType(type: AlarmType): void {
    this.alarmType = type;
  }

  public getAlarmType(): AlarmType {
    return this.alarmType;
  }

  public unlock(): void {
    this.initContext();
    if (!this.audioContext) return;

    // Mobile browsers often require a direct user gesture before later timer sounds can play.
    this.playBeep(220, 0.03, 'sine', 0.01);
  }

  public playBeep(frequency = 880, duration = 0.5, type: OscillatorType = 'sine', volume = 0.3): void {
    if (typeof window === 'undefined') return;

    try {
      this.initContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback inhibited or failed:', e);
    }
  }

  public playFinish(): void {
    switch (this.alarmType) {
      case AlarmType.SUSTAINED:
        this.playSustained();
        break;
      case AlarmType.PULSATING:
        this.playPulsating();
        break;
      case AlarmType.ALARM_CLOCK:
        this.playAlarmClock();
        break;
      case AlarmType.TRADITIONAL:
      default:
        this.playTraditional();
        break;
    }
  }

  private playTraditional(): void {
    // Pleasant "success" sound: A4 -> C#5 -> E5
    this.playBeep(440, 0.2);
    setTimeout(() => this.playBeep(554.37, 0.2), 150);
    setTimeout(() => this.playBeep(659.25, 0.4), 300);
  }

  private playSustained(): void {
    // Long, solemn tone: E3 (lower frequency for more "presence")
    this.playBeep(164.81, 2.0, 'triangle', 0.4);
  }

  private playPulsating(): void {
    // Alerting pulse: Bb4
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playBeep(466.16, 0.15, 'square', 0.2), i * 300);
    }
  }

  private playAlarmClock(): void {
    // Intense, loud alarm clock style: repetitive high-pitched pulses
    const iterations = 20; // 20 * 500ms = 10s
    const pulseDuration = 0.3;
    const interval = 500;

    for (let i = 0; i < iterations; i++) {
      setTimeout(() => {
        // Double chirp
        this.playBeep(880, pulseDuration, 'sawtooth', 0.3);
        setTimeout(() => this.playBeep(880, pulseDuration, 'sawtooth', 0.3), 150);
      }, i * interval);
    }
  }

  public playTransition(): void {
    // Short beep for phase changes
    this.playBeep(880, 0.1);
  }

  public playCountdownBeep(): void {
    // Lower frequency "thud" or "tick" for countdown
    this.playBeep(440, 0.1, 'sine', 0.3);
  }
}

// Singleton for easy access in hooks if needed, although we prefer DI
export const defaultAudioService = new AudioService();
