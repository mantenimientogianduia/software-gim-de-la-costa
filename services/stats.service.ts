import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

export interface DailyAttendance {
  day: string;
  users: number;
}

export interface AttendanceStats {
  totalSocios: number;
  newUsersThisMonth: number;
  expiredMemberships: number;
  weeklyActivity: DailyAttendance[];
}

export class StatsService {
  private attendanceRef = collection(db, 'attendance');
  private userRef = collection(db, 'users');

  /**
   * Fetches the number of check-ins for each day of the current week.
   */
  async getWeeklyAttendanceData(): Promise<DailyAttendance[]> {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const q = query(
      this.attendanceRef,
      where('checkInAt', '>=', Timestamp.fromDate(startOfWeek)),
      orderBy('checkInAt', 'asc')
    );

    const snap = await getDocs(q);
    const counts = new Array(7).fill(0);

    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.checkInAt) {
        const date = (data.checkInAt as Timestamp).toDate();
        counts[date.getDay()]++;
      }
    });

    // Reorder to start from Monday for display if preferred, 
    // but here we follow the days array order starting from Sunday
    return days.map((day, idx) => ({
      day,
      users: counts[idx]
    }));
  }

  /**
   * Gets summary stats for the dashboard.
   */
  async getDashboardStats(): Promise<AttendanceStats> {
    const weeklyActivity = await this.getWeeklyAttendanceData();
    
    // Total users
    const usersSnap = await getDocs(this.userRef);
    const totalSocios = usersSnap.size;

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersSnap = await getDocs(query(
      this.userRef,
      where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
    ));
    const newUsersThisMonth = newUsersSnap.size;

    // Mock for demo/complex logic
    const expiredMemberships = Math.floor(totalSocios * 0.05); 

    return {
      totalSocios,
      newUsersThisMonth,
      expiredMemberships,
      weeklyActivity
    };
  }

  /**
   * Calculates specific indicators requested by the user:
   * - How many people go per day (already covered in weeklyActivity)
   * - How many days per week they go
   */
  async getMemberFrequency(userId: string): Promise<number> {
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const q = query(
      this.attendanceRef,
      where('userId', '==', userId),
      where('checkInAt', '>=', Timestamp.fromDate(fourWeeksAgo))
    );

    const snap = await getDocs(q);
    // Count unique days
    const uniqueDays = new Set();
    snap.docs.forEach(doc => {
      const date = (doc.data().checkInAt as Timestamp).toDate();
      uniqueDays.add(date.toDateString());
    });

    return Number((uniqueDays.size / 4).toFixed(1)); // Average days per week
  }
}

export const statsService = new StatsService();
