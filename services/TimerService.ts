export type TimerMode = 'stopwatch' | 'tabata' | 'hiit' | 'amrap' | 'emom';

export interface TimerPreset {
  id: string;
  name: string;
  mode: TimerMode;
  workTime: number; // in seconds
  restTime: number; // in seconds
  rounds: number;
}

export interface TimerService {
  formatTime(ms: number): string;
  getPresets(): TimerPreset[];
}

export class TimerServiceImpl implements TimerService {
  private presets: TimerPreset[] = [
    { id: '1', name: 'Tabata Standar', mode: 'tabata', workTime: 20, restTime: 10, rounds: 8 },
    { id: '2', name: 'HIIT Intenso', mode: 'hiit', workTime: 45, restTime: 15, rounds: 10 },
    { id: '3', name: 'AMRAP 10min', mode: 'amrap', workTime: 600, restTime: 0, rounds: 1 },
    { id: '4', name: 'EMOM 12min', mode: 'emom', workTime: 60, restTime: 0, rounds: 12 },
  ];

  formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  }

  getPresets(): TimerPreset[] {
    return this.presets;
  }
}
