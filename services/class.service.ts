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
  increment,
  runTransaction
} from 'firebase/firestore';
import { z } from 'zod';

export const ClassSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  instructorId: z.string().min(1, 'Instructor requerido'),
  startTime: z.any(), // Firestore Timestamp
  endTime: z.any(),
  capacity: z.number().min(1, 'Capacidad debe ser al menos 1'),
  enrolledCount: z.number().default(0),
  status: z.enum(['active', 'cancelled']).default('active'),
  createdAt: z.any().optional(),
});

export const BookingSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1),
  userId: z.string().min(1), // user email
  status: z.enum(['confirmed', 'cancelled']).default('confirmed'),
  createdAt: z.any().optional(),
});

export type GymClass = z.infer<typeof ClassSchema>;
export type Booking = z.infer<typeof BookingSchema>;

export class ClassService {
  private classesRef = collection(db, 'classes');
  private bookingsRef = collection(db, 'bookings');

  private getBookingId(classId: string, userId: string): string {
    return `${classId}_${userId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  }

  async createClass(data: Omit<GymClass, 'id' | 'enrolledCount' | 'createdAt'>): Promise<string> {
    const newDoc = doc(this.classesRef);
    await setDoc(newDoc, {
      ...data,
      enrolledCount: 0,
      createdAt: serverTimestamp(),
    });
    return newDoc.id;
  }

  async createRecurringClasses(
    data: Omit<GymClass, 'id' | 'enrolledCount' | 'createdAt' | 'startTime' | 'endTime'>,
    pattern: {
      days: number[]; // 0 for Sunday, 1 for Monday...
      startTimeStr: string; // "20:00"
      durationMin: number;
    },
    weeksCount: number = 4
  ): Promise<void> {
    const now = new Date();
    
    for (let i = 0; i < weeksCount; i++) {
       for (const day of pattern.days) {
          const date = new Date();
          date.setDate(now.getDate() + (i * 7) + (day - now.getDay()));
          
          const [hours, minutes] = pattern.startTimeStr.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);

          if (date < now) continue;

          const endTime = new Date(date);
          endTime.setMinutes(date.getMinutes() + pattern.durationMin);

          await this.createClass({
            ...data,
            startTime: date,
            endTime: endTime,
          });
       }
    }
  }

  async getActiveClasses(): Promise<GymClass[]> {
    const q = query(this.classesRef, where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymClass));
  }

  async bookClass(classId: string, userId: string): Promise<void> {
    const classRef = doc(this.classesRef, classId);
    const bookingRef = doc(this.bookingsRef, this.getBookingId(classId, userId));

    await runTransaction(db, async (transaction) => {
      const classDoc = await transaction.get(classRef);
      if (!classDoc.exists()) throw new Error('Clase no encontrada');

      const bookingDoc = await transaction.get(bookingRef);
      if (bookingDoc.exists() && (bookingDoc.data() as Booking).status === 'confirmed') {
        throw new Error('Ya estas anotado en esta clase');
      }
      
      const classData = classDoc.data() as GymClass;
      if (classData.enrolledCount >= classData.capacity) {
        throw new Error('Clase completa');
      }

      transaction.set(bookingRef, {
        classId,
        userId,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      transaction.update(classRef, {
        enrolledCount: increment(1)
      });
    });
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const q = query(this.bookingsRef, where('userId', '==', userId), where('status', '==', 'confirmed'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  }

  async cancelBooking(bookingId: string, classId: string): Promise<void> {
    const bookingRef = doc(this.bookingsRef, bookingId);
    const classRef = doc(this.classesRef, classId);

    await runTransaction(db, async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists()) throw new Error('Reserva no encontrada');
      if ((bookingDoc.data() as Booking).status !== 'confirmed') return;

      transaction.update(bookingRef, { status: 'cancelled' });
      transaction.update(classRef, { enrolledCount: increment(-1) });
    });
  }
}

export const classService = new ClassService();
