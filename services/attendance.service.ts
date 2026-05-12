import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  orderBy,
  addDoc,
  Timestamp,
  limit
} from 'firebase/firestore';

export interface AttendanceRecord {
  id?: string;
  userId: string; // email
  userName: string;
  checkIn: any;
  checkOut?: any;
  status: 'present' | 'completed';
}

export class AttendanceService {
  private attendanceRef = collection(db, 'attendance');

  async checkIn(email: string, name: string): Promise<string> {
    // Check if already checked in
    const q = query(
      this.attendanceRef, 
      where('userId', '==', email), 
      where('status', '==', 'present'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;

    const docRef = await addDoc(this.attendanceRef, {
      userId: email,
      userName: name,
      checkIn: serverTimestamp(),
      status: 'present'
    });
    return docRef.id;
  }

  async checkOut(email: string, attendanceId?: string): Promise<void> {
    let id = attendanceId;
    
    if (!id) {
      const q = query(
        this.attendanceRef, 
        where('userId', '==', email), 
        where('status', '==', 'present'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;
      id = snap.docs[0].id;
    }

    const docRef = doc(this.attendanceRef, id);
    await updateDoc(docRef, {
      checkOut: serverTimestamp(),
      status: 'completed'
    });
  }

  async getActiveUsers(): Promise<AttendanceRecord[]> {
    const q = query(this.attendanceRef, where('status', '==', 'present'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  }
  
  async getDailyAttendance(): Promise<AttendanceRecord[]> {
      const today = new Date();
      today.setHours(0,0,0,0);
      const q = query(this.attendanceRef, where('checkIn', '>=', Timestamp.fromDate(today)), orderBy('checkIn', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  }
}

export const attendanceService = new AttendanceService();
