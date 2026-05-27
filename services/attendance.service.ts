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

  private async hasOpenSession(userId: string): Promise<boolean> {
    const q = query(this.collectionRef, where('userId', '==', userId), where('status', '==', 'present'));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  private async syncPublicPresence(userDocId: string, userProfile?: any): Promise<void> {
    const publicPresence = buildPublicPresenceRecord({ id: userDocId, ...userProfile });
    const publicPresenceRef = doc(db, 'publicPresence', userDocId);

    try {
      if (publicPresence) {
        await setDoc(publicPresenceRef, {
          ...publicPresence,
          checkedInAt: serverTimestamp()
        });
      } else {
        await deleteDoc(publicPresenceRef);
      }
    } catch (error) {
      console.warn('No se pudo sincronizar la presencia publica del socio.', error);
    }
  }

  private async clearPublicPresence(userDocId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'publicPresence', userDocId));
    } catch (error) {
      console.warn('No se pudo limpiar la presencia publica del socio.', error);
    }
  }

  async checkIn(userId: string, userDocId: string, userProfile?: any): Promise<void> {
    let shouldCreateAttendance = true;
    try {
      shouldCreateAttendance = !(await this.hasOpenSession(userId));
    } catch (error) {
      console.warn('No se pudo consultar si el socio ya tenia una sesion abierta.', error);
    }

    // 1. Create attendance record
    if (shouldCreateAttendance) {
      await addDoc(this.collectionRef, {
        userId,
        checkInAt: serverTimestamp(),
        status: 'present'
      });
    }

    // 2. Update user status
    const userRef = doc(db, 'users', userDocId);
    await updateDoc(userRef, {
      atGym: true,
      lastCheckIn: serverTimestamp(),
      currentActivity: 'Entrenando',
      updatedAt: serverTimestamp()
    });

    await this.syncPublicPresence(userDocId, userProfile);
  }

  async checkOut(userId: string, userDocId: string): Promise<void> {
    // 1. Find active record
    try {
      const q = query(this.collectionRef, where('userId', '==', userId), where('status', '==', 'present'));
      const snap = await getDocs(q);
      
      for (const recordDoc of snap.docs) {
        await updateDoc(recordDoc.ref, {
          status: 'completed',
          checkOutAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.warn('No se pudo cerrar la asistencia abierta del socio.', error);
    }

    // 2. Update user status
    const userRef = doc(db, 'users', userDocId);
    await updateDoc(userRef, {
      atGym: false,
      currentActivity: '',
      updatedAt: serverTimestamp()
    });

    await this.clearPublicPresence(userDocId);
  }

  getLiveAttendance(callback: (users: any[]) => void) {
    const q = query(collection(db, 'users'), where('atGym', '==', true));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
}

export const attendanceService = new AttendanceService();
