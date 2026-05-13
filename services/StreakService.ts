export interface TrainingDay {
  date: string; // YYYY-MM-DD
  type: "training" | "rest";
}

export class StreakService {
  private history: TrainingDay[];

  constructor(history: TrainingDay[]) {
    this.history = history;
  }

  public calculateCurrentStreak(): number {
    if (this.history.length === 0) return 0;

    // Sort history descending by date
    const sorted = [...this.history].sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Check if there was activity today or yesterday to continue streak
    const lastActivity = sorted[0].date;
    if (lastActivity !== today && lastActivity !== yesterday) {
      return 0;
    }

    let currentDate = lastActivity;
    for (const day of sorted) {
      if (day.date === currentDate && day.type === "training") {
        streak++;
        // Move back one day
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        currentDate = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    return streak;
  }

  public getStatusForLastDays(daysCount: number): (TrainingDay | { date: string, type: 'none' })[] {
    const result: (TrainingDay | { date: string, type: 'none' })[] = [];
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const match = this.history.find(h => h.date === date);
      result.push(match || { date, type: 'none' });
    }
    return result;
  }
}
