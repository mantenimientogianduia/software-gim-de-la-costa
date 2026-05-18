import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  onSnapshot,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { buildPublicPresenceRecord } from '@/services/social.service';

export interface AttendanceRecord {
  id?: string;
  userId: string;
  checkInAt: any;
  checkOutAt?: any;
  status: 'present' | 'completed';
}

export class AttendanceService {
  private collectionRef = collection(db, 'attendance');

  async checkIn(userId: string, userDocId: string, userProfile?: any): Promise<void> {
    // 1. Create attendance record
    await addDoc(this.collectionRef, {
      userId,
      checkInAt: serverTimestamp(),
      status: 'present'
    });

    // 2. Update user status
    const userRef = doc(db, 'users', userDocId);
    await updateDoc(userRef, {
      atGym: true,
      lastCheckIn: serverTimestamp(),
      currentActivity: 'Entrenando',
      updatedAt: serverTimestamp()
    });

    const publicPresence = buildPublicPresenceRecord({ id: userDocId, ...userProfile });
    const publicPresenceRef = doc(db, 'publicPresence', userDocId);
    if (publicPresence) {
      await setDoc(publicPresenceRef, {
        ...publicPresence,
        checkedInAt: serverTimestamp()
      });
    } else {
      await deleteDoc(publicPresenceRef);
    }
  }

  async checkOut(userId: string, userDocId: string): Promise<void> {
    // 1. Find active record
    const q = query(this.collectionRef, where('userId', '==', userId), where('status', '==', 'present'));
    const snap = await getDocs(q);
    
    for (const recordDoc of snap.docs) {
      await updateDoc(recordDoc.ref, {
        status: 'completed',
        checkOutAt: serverTimestamp()
      });
    }

    // 2. Update user status
    const userRef = doc(db, 'users', userDocId);
    await updateDoc(userRef, {
      atGym: false,
      currentActivity: '',
      updatedAt: serverTimestamp()
    });

    await deleteDoc(doc(db, 'publicPresence', userDocId));
  }

  getLiveAttendance(callback: (users: any[]) => void) {
    const q = query(collection(db, 'users'), where('atGym', '==', true));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
}

export const attendanceService = new AttendanceService();
