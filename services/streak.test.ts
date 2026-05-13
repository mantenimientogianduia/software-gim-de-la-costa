import { describe, it, expect } from "vitest";
import { StreakService } from "./StreakService";

describe("StreakService", () => {
  it("should calculate 0 streak for empty history", () => {
    const service = new StreakService([]);
    expect(service.calculateCurrentStreak()).toBe(0);
  });

  it("should calculate correct streak for consecutive training days", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    const history = [
      { date: today, type: "training" },
      { date: yesterday, type: "training" }
    ];
    
    const service = new StreakService(history);
    expect(service.calculateCurrentStreak()).toBe(2);
  });

  it("should break streak if a day is missed", () => {
    const today = new Date().toISOString().split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split("T")[0];
    
    const history = [
      { date: today, type: "training" },
      { date: threeDaysAgo, type: "training" }
    ];
    
    const service = new StreakService(history);
    expect(service.calculateCurrentStreak()).toBe(1);
  });
});
