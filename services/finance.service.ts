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
  Timestamp
} from 'firebase/firestore';
import { z } from 'zod';

export const PAYMENT_METHODS = ['cash', 'transfer', 'debit', 'credit', 'mercado_pago', 'other'] as const;

export const DEFAULT_PAYMENT_PLANS = [
  { id: 'monthly', name: 'Cuota normal', months: 1, price: 40000 },
  { id: 'quarterly', name: 'Combo 3 cuotas', months: 3, price: 100000 },
] as const;

export const PaymentPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  months: z.number().min(1),
  price: z.number().min(0),
  active: z.boolean().default(true),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const PaymentSchema = z.object({
  id: z.string().optional(),
  userId: z.string(), // user email
  userName: z.string(),
  amount: z.number(),
  paymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
  planId: z.string().optional(),
  concept: z.string().default('Cuota Mensual'),
  monthsPaid: z.number().default(1),
  paymentDate: z.any().optional(),
  renewalBaseDate: z.any().optional(),
  validUntil: z.any(),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('confirmed'),
  notes: z.string().optional(),
  createdAt: z.any().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export function calculateMembershipRenewalDate({
  currentExpiration,
  paymentDate,
  monthsPaid,
}: {
  currentExpiration?: Date | null;
  paymentDate: Date;
  monthsPaid: number;
}): Date {
  const baseDate = currentExpiration ?? paymentDate;
  const renewed = new Date(baseDate);
  const originalDay = renewed.getDate();

  renewed.setDate(1);
  renewed.setMonth(renewed.getMonth() + monthsPaid);

  const lastDayOfTargetMonth = new Date(renewed.getFullYear(), renewed.getMonth() + 1, 0).getDate();
  renewed.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return renewed;
}

export class FinanceService {
  private paymentsRef = collection(db, 'payments');
  private paymentPlansRef = collection(db, 'paymentPlans');

  async recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.paymentsRef, {
      ...payment,
      paymentDate: payment.paymentDate ?? serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // Update user's expiration date in their profile
    const userQ = query(collection(db, 'users'), where('email', '==', payment.userId));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      const userRef = userSnap.docs[0].ref;
      await updateDoc(userRef, {
        membershipValidUntil: payment.validUntil,
        lastPaymentDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const q = query(this.paymentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  }

  async getAllPayments(): Promise<Payment[]> {
    const q = query(this.paymentsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  }

  async getPaymentPlans(): Promise<PaymentPlan[]> {
    const snap = await getDocs(this.paymentPlansRef);
    const plans = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as PaymentPlan))
      .filter(plan => plan.active !== false)
      .sort((a, b) => a.months - b.months || a.price - b.price);

    return plans.length > 0 ? plans : DEFAULT_PAYMENT_PLANS.map(plan => ({ ...plan, active: true }));
  }

  async upsertPaymentPlan(plan: Pick<PaymentPlan, 'id' | 'name' | 'months' | 'price'>): Promise<void> {
    const planRef = doc(this.paymentPlansRef, plan.id);
    const existing = await getDoc(planRef);

    await setDoc(planRef, {
      ...plan,
      active: true,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getExpiringMemberships(): Promise<any[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const q = query(
      collection(db, 'users'), 
      where('membershipValidUntil', '<=', Timestamp.fromDate(nextWeek)),
      where('role', '==', 'socio')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const financeService = new FinanceService();
