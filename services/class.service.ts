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
  runTransaction
} from 'firebase/firestore';
import { z } from 'zod';

export const GymClassSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  instructorId: z.string(),
  startTime: z.any(),
  endTime: z.any().optional(),
  capacity: z.number().default(20),
  enrolledCount: z.number().default(0),
  status: z.enum(['scheduled', 'cancelled', 'completed']).default('scheduled'),
});

export const BookingSchema = z.object({
  id: z.string().optional(),
  classId: z.string(),
  userId: z.string(), // user email
  status: z.enum(['confirmed', 'cancelled']).default('confirmed'),
  createdAt: z.any().optional(),
});

export type GymClass = z.infer<typeof GymClassSchema>;
export type Booking = z.infer<typeof BookingSchema>;

export class ClassService {
  private classesRef = collection(db, 'classes');
  private bookingsRef = collection(db, 'bookings');

  async createClass(classData: Omit<GymClass, 'id'>): Promise<string> {
    const docRef = await addDoc(this.classesRef, classData);
    return docRef.id;
  }

  async getActiveClasses(): Promise<GymClass[]> {
    const now = new Date();
    const q = query(
      this.classesRef, 
      where('startTime', '>=', Timestamp.fromDate(now)),
      where('status', '==', 'scheduled'),
      orderBy('startTime', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
  }

  async bookClass(classId: string, userId: string): Promise<string> {
    const classRef = doc(this.classesRef, classId);
    
    return await runTransaction(db, async (transaction) => {
      const classSnap = await transaction.get(classRef);
      if (!classSnap.exists()) throw new Error('La clase no existe.');
      
      const gymClass = classSnap.data() as GymClass;
      if (gymClass.enrolledCount >= gymClass.capacity) {
        throw new Error('La clase está llena.');
      }

      // Check if already booked
      const bookingQ = query(this.bookingsRef, where('classId', '==', classId), where('userId', '==', userId), where('status', '==', 'confirmed'));
      const bookingSnap = await getDocs(bookingQ);
      if (!bookingSnap.empty) throw new Error('Ya tienes un lugar en esta clase.');

      const bookingRef = doc(this.bookingsRef);
      transaction.set(bookingRef, {
        classId,
        userId,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      transaction.update(classRef, {
        enrolledCount: gymClass.enrolledCount + 1
      });

      return bookingRef.id;
    });
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const q = query(this.bookingsRef, where('userId', '==', userId), where('status', '==', 'confirmed'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  }
}

export const classService = new ClassService();
