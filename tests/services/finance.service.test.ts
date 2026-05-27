import { describe, expect, it } from 'vitest';
import {
  buildPaymentsCsv,
  buildContactLinks,
  calculateCashflowSummary,
  calculateMembershipRenewalDate,
  calculateMemberFinanceSummaries,
  recalculateMembershipFromPayments,
  loadFinanceDashboardData
} from '@/services/finance.service';

const ts = (date: string) => ({ toDate: () => new Date(`${date}T12:00:00`) });

describe('calculateMembershipRenewalDate', () => {
  it('extends from a future expiration date when the member pays early', () => {
    const result = calculateMembershipRenewalDate({
      currentExpiration: new Date('2026-05-20T12:00:00'),
      paymentDate: new Date('2026-05-16T12:00:00'),
      monthsPaid: 1,
    });

    expect(result.toISOString().slice(0, 10)).toBe('2026-06-20');
  });

  it('extends from an expired membership expiration date instead of the payment date', () => {
    const result = calculateMembershipRenewalDate({
      currentExpiration: new Date('2026-05-10T12:00:00'),
      paymentDate: new Date('2026-05-16T12:00:00'),
      monthsPaid: 1,
    });

    expect(result.toISOString().slice(0, 10)).toBe('2026-06-10');
  });

  it('extends from the payment date when the member has no expiration date', () => {
    const result = calculateMembershipRenewalDate({
      paymentDate: new Date('2026-05-16T12:00:00'),
      monthsPaid: 3,
    });

    expect(result.toISOString().slice(0, 10)).toBe('2026-08-16');
  });
});

describe('loadFinanceDashboardData', () => {
  it('keeps visible payments and plans when expiring memberships fail to load', async () => {
    const result = await loadFinanceDashboardData({
      getAllPayments: async () => [{ id: 'payment-1', userId: 'socio@test.com', userName: 'Socio Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, validUntil: {}, status: 'confirmed' }],
      getPaymentPlans: async () => [{ id: 'monthly', name: 'Cuota normal', months: 1, price: 40000, active: true }],
      getExpiringMemberships: async () => {
        throw new Error('missing index');
      },
    });

    expect(result.payments).toHaveLength(1);
    expect(result.paymentPlans).toHaveLength(1);
    expect(result.expiringUsers).toEqual([]);
    expect(result.errors.expiringUsers).toBeInstanceOf(Error);
  });
});

describe('calculateMemberFinanceSummaries', () => {
  it('marks a member without confirmed payments and expiration as overdue', () => {
    const [summary] = calculateMemberFinanceSummaries({
      users: [{ id: 'u1', email: 'a@test.com', firstName: 'Ana', lastName: 'Test', role: 'socio', status: 'active', createdAt: ts('2026-01-01'), updatedAt: ts('2026-01-01') }],
      payments: [],
      now: new Date('2026-05-16T12:00:00'),
    });

    expect(summary.financeStatus).toBe('moroso');
    expect(summary.hasPayments).toBe(false);
  });

  it('marks an expired member as overdue even with old payments', () => {
    const [summary] = calculateMemberFinanceSummaries({
      users: [{ id: 'u1', email: 'a@test.com', firstName: 'Ana', lastName: 'Test', role: 'socio', status: 'active', membershipValidUntil: ts('2026-05-10'), createdAt: ts('2026-01-01'), updatedAt: ts('2026-01-01') }],
      payments: [{ id: 'p1', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-04-10'), validUntil: ts('2026-05-10'), status: 'confirmed' }],
      now: new Date('2026-05-16T12:00:00'),
    });

    expect(summary.financeStatus).toBe('moroso');
    expect(summary.daysFromDue).toBe(-6);
  });

  it('marks a member expiring within seven days as expiring soon', () => {
    const [summary] = calculateMemberFinanceSummaries({
      users: [{ id: 'u1', email: 'a@test.com', firstName: 'Ana', lastName: 'Test', role: 'socio', status: 'active', membershipValidUntil: ts('2026-05-20'), createdAt: ts('2026-01-01'), updatedAt: ts('2026-01-01') }],
      payments: [{ id: 'p1', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-04-20'), validUntil: ts('2026-05-20'), status: 'confirmed' }],
      now: new Date('2026-05-16T12:00:00'),
    });

    expect(summary.financeStatus).toBe('por_vencer');
    expect(summary.daysFromDue).toBe(4);
  });

  it('marks a paid member outside the warning window as active', () => {
    const [summary] = calculateMemberFinanceSummaries({
      users: [{ id: 'u1', email: 'a@test.com', firstName: 'Ana', lastName: 'Test', role: 'socio', status: 'active', membershipValidUntil: ts('2026-06-20'), createdAt: ts('2026-01-01'), updatedAt: ts('2026-01-01') }],
      payments: [{ id: 'p1', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-05-20'), validUntil: ts('2026-06-20'), status: 'confirmed' }],
      now: new Date('2026-05-16T12:00:00'),
    });

    expect(summary.financeStatus).toBe('activo');
  });
});

describe('recalculateMembershipFromPayments', () => {
  it('ignores cancelled payments when recalculating expiration', () => {
    const result = recalculateMembershipFromPayments([
      { id: 'p1', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-05-10'), validUntil: ts('2026-06-10'), status: 'confirmed' },
      { id: 'p2', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-06-10'), validUntil: ts('2026-07-10'), status: 'cancelled' },
    ]);

    expect(result?.toISOString().slice(0, 10)).toBe('2026-06-10');
  });
});

describe('buildContactLinks', () => {
  it('builds WhatsApp and email links without sending messages', () => {
    const links = buildContactLinks({
      firstName: 'Ana',
      lastName: 'Test',
      email: 'ana@test.com',
      phone: '+54 9 11 1234-5678',
      financeStatus: 'moroso',
      membershipValidUntil: new Date('2026-05-10T12:00:00'),
    });

    expect(links.whatsapp).toContain('https://wa.me/5491112345678');
    expect(links.email).toContain('mailto:ana@test.com');
  });
});

describe('calculateCashflowSummary', () => {
  it('excludes cancelled payments and groups confirmed revenue by method', () => {
    const summary = calculateCashflowSummary([
      { id: 'p1', userId: 'a@test.com', userName: 'Ana Test', amount: 40000, paymentMethod: 'cash', concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-05-10'), validUntil: ts('2026-06-10'), status: 'confirmed' },
      { id: 'p2', userId: 'b@test.com', userName: 'Beto Test', amount: 100000, paymentMethod: 'transfer', concept: 'Combo 3 cuotas', monthsPaid: 3, paymentDate: ts('2026-05-11'), validUntil: ts('2026-08-11'), status: 'confirmed' },
      { id: 'p3', userId: 'c@test.com', userName: 'Cancelado Test', amount: 40000, paymentMethod: 'cash', concept: 'Cuota normal', monthsPaid: 1, paymentDate: ts('2026-05-12'), validUntil: ts('2026-06-12'), status: 'cancelled' },
    ]);

    expect(summary.totalRevenue).toBe(140000);
    expect(summary.confirmedPaymentsCount).toBe(2);
    expect(summary.cancelledPaymentsCount).toBe(1);
    expect(summary.byMethod.cash.total).toBe(40000);
    expect(summary.byMethod.transfer.total).toBe(100000);
  });
});

describe('buildPaymentsCsv', () => {
  it('exports payments with audit fields without dropping cancelled records', () => {
    const csv = buildPaymentsCsv([
      {
        id: 'p1',
        userId: 'ana@test.com',
        userName: 'Ana Test',
        amount: 40000,
        paymentMethod: 'cash',
        concept: 'Cuota normal',
        monthsPaid: 1,
        paymentDate: ts('2026-05-10'),
        validUntil: ts('2026-06-10'),
        status: 'cancelled',
        cancelReason: 'Carga duplicada',
        cancelledBy: 'admin@test.com',
        cancelledAt: ts('2026-05-11'),
      },
    ]);

    expect(csv).toContain('estado');
    expect(csv).toContain('cancelled');
    expect(csv).toContain('Carga duplicada');
    expect(csv).toContain('admin@test.com');
  });
});
