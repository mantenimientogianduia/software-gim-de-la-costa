import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

export interface DailyAttendance {
  day: string;
  users: number;
}

export interface AttendanceStats {
  totalSocios: number;
  newUsersThisMonth: number;
  newUsersLast24h: number;
  expiredMemberships: number;
  weeklyActivity: DailyAttendance[];
}

export class StatsService {
  private attendanceRef = collection(db, 'attendance');
  private userRef = collection(db, 'users');

  async getWeeklyAttendanceData(): Promise<DailyAttendance[]> {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
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

    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.checkInAt) {
        const date = (data.checkInAt as Timestamp).toDate();
        counts[date.getDay()]++;
      }
    });

    return days.map((day, idx) => {
      const dayIndex = (idx + 1) % 7;
      return {
        day,
        users: counts[dayIndex],
      };
    });
  }

  async getDashboardStats(): Promise<AttendanceStats> {
    const weeklyActivity = await this.getWeeklyAttendanceData();

    const usersSnap = await getDocs(this.userRef);
    const socios = usersSnap.docs
      .map((doc) => doc.data())
      .filter((user) => user.role === 'socio');
    const totalSocios = socios.length;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = socios.filter((user) => {
      if (!user.createdAt?.toDate) return false;
      return user.createdAt.toDate() >= startOfMonth;
    }).length;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newUsersLast24h = socios.filter((user) => {
      if (!user.createdAt?.toDate) return false;
      return user.createdAt.toDate() >= yesterday;
    }).length;

    const today = new Date();
    const expiredMemberships = socios.filter((user) => {
      if (!user.membershipValidUntil?.toDate) return false;
      return user.membershipValidUntil.toDate() < today;
    }).length;

    return {
      totalSocios,
      newUsersThisMonth,
      newUsersLast24h,
      expiredMemberships,
      weeklyActivity,
    };
  }

  async getMemberFrequency(userId: string): Promise<number> {
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const q = query(
      this.attendanceRef,
      where('userId', '==', userId)
    );

    const snap = await getDocs(q);
    const fourWeeksAgoMillis = fourWeeksAgo.getTime();

    const relevantDocs = snap.docs.filter((doc) => {
      const data = doc.data();
      return data.checkInAt && (data.checkInAt as Timestamp).toMillis() >= fourWeeksAgoMillis;
    });

    const uniqueDays = new Set();
    relevantDocs.forEach((doc) => {
      const date = (doc.data().checkInAt as Timestamp).toDate();
      uniqueDays.add(date.toDateString());
    });

    return Number((uniqueDays.size / 4).toFixed(1));
  }
}

export const statsService = new StatsService();
