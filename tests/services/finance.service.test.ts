import { describe, expect, it } from 'vitest';
import { calculateMembershipRenewalDate, loadFinanceDashboardData } from '@/services/finance.service';

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
