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
  addDoc,
  Timestamp,
  writeBatch
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
  cancelledAt: z.any().optional(),
  cancelledBy: z.string().optional(),
  cancelReason: z.string().optional(),
  createdAt: z.any().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type MemberFinanceStatus = 'moroso' | 'por_vencer' | 'activo';

export interface MemberFinanceSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  financeStatus: MemberFinanceStatus;
  hasPayments: boolean;
  membershipValidUntil: Date | null;
  daysFromDue: number | null;
  lastPaymentDate: Date | null;
  totalPaid: number;
  joinedAt: Date | null;
  memberAgeDays: number | null;
  paymentsCount: number;
}

export interface PaymentMethodCashflow {
  method: PaymentMethod;
  total: number;
  count: number;
}

export interface CashflowSummary {
  totalRevenue: number;
  confirmedPaymentsCount: number;
  cancelledPaymentsCount: number;
  byMethod: Record<PaymentMethod, PaymentMethodCashflow>;
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return null;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function diffDays(from: Date, to: Date): number {
  return Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / (1000 * 60 * 60 * 24));
}

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

export function recalculateMembershipFromPayments(payments: Payment[]): Date | null {
  const confirmed = payments
    .filter(payment => payment.status === 'confirmed')
    .sort((a, b) => {
      const aDate = toDate(a.paymentDate)?.getTime() ?? 0;
      const bDate = toDate(b.paymentDate)?.getTime() ?? 0;
      return aDate - bDate;
    });

  let expiration: Date | null = null;
  for (const payment of confirmed) {
    const paymentDate = toDate(payment.paymentDate);
    if (!paymentDate) continue;
    expiration = calculateMembershipRenewalDate({
      currentExpiration: expiration,
      paymentDate,
      monthsPaid: payment.monthsPaid || 1,
    });
  }

  return expiration;
}

export function calculateMemberFinanceSummaries({
  users,
  payments,
  now = new Date(),
  expiringWarningDays = 7,
}: {
  users: any[];
  payments: Payment[];
  now?: Date;
  expiringWarningDays?: number;
}): MemberFinanceSummary[] {
  return users
    .filter(user => user.role === 'socio')
    .map(user => {
      const userPayments = payments.filter(payment => payment.userId === user.email && payment.status === 'confirmed');
      const membershipValidUntil = toDate(user.membershipValidUntil);
      const daysFromDue = membershipValidUntil ? diffDays(now, membershipValidUntil) : null;
      const hasPayments = userPayments.length > 0;
      const lastPaymentDate = userPayments
        .map(payment => toDate(payment.paymentDate))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
      const totalPaid = userPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const joinedAt = toDate(user.createdAt);

      let financeStatus: MemberFinanceStatus = 'activo';
      if (!hasPayments || !membershipValidUntil || daysFromDue === null || daysFromDue <= 0) {
        financeStatus = 'moroso';
      } else if (daysFromDue <= expiringWarningDays) {
        financeStatus = 'por_vencer';
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        financeStatus,
        hasPayments,
        membershipValidUntil,
        daysFromDue,
        lastPaymentDate,
        totalPaid,
        joinedAt,
        memberAgeDays: joinedAt ? diffDays(joinedAt, now) : null,
        paymentsCount: userPayments.length,
      };
    });
}

export function buildContactLinks({
  firstName,
  lastName,
  email,
  phone,
  financeStatus,
  membershipValidUntil,
}: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  financeStatus: MemberFinanceStatus;
  membershipValidUntil?: Date | null;
}) {
  const dueText = membershipValidUntil
    ? membershipValidUntil.toLocaleDateString('es-AR')
    : 'sin fecha registrada';
  const message = financeStatus === 'por_vencer'
    ? `Hola ${firstName}, te recordamos que tu cuota de Gym de la Costa vence el ${dueText}.`
    : `Hola ${firstName}, te avisamos que tu cuota de Gym de la Costa figura vencida o pendiente.`;
  const subject = financeStatus === 'por_vencer' ? 'Recordatorio de vencimiento de cuota' : 'Cuota pendiente';
  const sanitizedPhone = phone?.replace(/\D/g, '') ?? '';

  return {
    whatsapp: sanitizedPhone ? `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}` : null,
    email: email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\nSaludos,\nGym de la Costa`)}` : null,
    label: `${firstName} ${lastName}`,
    message,
  };
}

export function calculateCashflowSummary(payments: Payment[]): CashflowSummary {
  const byMethod = PAYMENT_METHODS.reduce((acc, method) => {
    acc[method] = { method, total: 0, count: 0 };
    return acc;
  }, {} as Record<PaymentMethod, PaymentMethodCashflow>);

  const confirmed = payments.filter(payment => payment.status === 'confirmed');

  for (const payment of confirmed) {
    const method = payment.paymentMethod || 'cash';
    byMethod[method].total += payment.amount || 0;
    byMethod[method].count += 1;
  }

  return {
    totalRevenue: confirmed.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    confirmedPaymentsCount: confirmed.length,
    cancelledPaymentsCount: payments.filter(payment => payment.status === 'cancelled').length,
    byMethod,
  };
}

function formatCsvDate(value: any): string {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : '';
}

function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildPaymentsCsv(payments: Payment[]): string {
  const headers = [
    'id',
    'fecha_pago',
    'socio',
    'email',
    'concepto',
    'metodo',
    'meses',
    'monto',
    'vence_hasta',
    'estado',
    'notas',
    'motivo_anulacion',
    'anulado_por',
    'fecha_anulacion',
  ];

  const rows = payments.map(payment => [
    payment.id,
    formatCsvDate(payment.paymentDate),
    payment.userName,
    payment.userId,
    payment.concept,
    payment.paymentMethod || 'cash',
    payment.monthsPaid,
    payment.amount,
    formatCsvDate(payment.validUntil),
    payment.status,
    payment.notes,
    payment.cancelReason,
    payment.cancelledBy,
    formatCsvDate(payment.cancelledAt),
  ]);

  return [headers, ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\n');
}

export async function loadFinanceDashboardData(service: Pick<FinanceService, 'getAllPayments' | 'getPaymentPlans' | 'getExpiringMemberships'>) {
  const [paymentsResult, plansResult, expiringResult] = await Promise.allSettled([
    service.getAllPayments(),
    service.getPaymentPlans(),
    service.getExpiringMemberships(),
  ]);

  return {
    payments: paymentsResult.status === 'fulfilled' ? paymentsResult.value : [],
    paymentPlans: plansResult.status === 'fulfilled' ? plansResult.value : DEFAULT_PAYMENT_PLANS.map(plan => ({ ...plan, active: true })),
    expiringUsers: expiringResult.status === 'fulfilled' ? expiringResult.value : [],
    errors: {
      payments: paymentsResult.status === 'rejected' ? paymentsResult.reason : null,
      paymentPlans: plansResult.status === 'rejected' ? plansResult.reason : null,
      expiringUsers: expiringResult.status === 'rejected' ? expiringResult.reason : null,
    },
  };
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

  async cancelPayment(paymentId: string, userId: string, reason: string, cancelledBy?: string): Promise<void> {
    const paymentRef = doc(this.paymentsRef, paymentId);
    await updateDoc(paymentRef, {
      status: 'cancelled',
      cancelReason: reason,
      cancelledBy: cancelledBy || '',
      cancelledAt: serverTimestamp(),
    });

    const payments = await this.getUserPayments(userId);
    const validUntil = recalculateMembershipFromPayments(payments);
    const userQ = query(collection(db, 'users'), where('email', '==', userId));
    const userSnap = await getDocs(userQ);

    if (!userSnap.empty) {
      const batch = writeBatch(db);
      batch.update(userSnap.docs[0].ref, {
        membershipValidUntil: validUntil ? Timestamp.fromDate(validUntil) : null,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    }
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const q = query(this.paymentsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Payment))
      .sort((a, b) => {
        const aDate = toDate(a.createdAt)?.getTime() ?? toDate(a.paymentDate)?.getTime() ?? 0;
        const bDate = toDate(b.createdAt)?.getTime() ?? toDate(b.paymentDate)?.getTime() ?? 0;
        return bDate - aDate;
      });
  }

  async getAllPayments(): Promise<Payment[]> {
    const snap = await getDocs(this.paymentsRef);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Payment))
      .sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() ?? a.paymentDate?.toDate?.() ?? new Date(0);
        const bDate = b.createdAt?.toDate?.() ?? b.paymentDate?.toDate?.() ?? new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
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
