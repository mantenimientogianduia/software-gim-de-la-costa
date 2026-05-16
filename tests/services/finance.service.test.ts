import { describe, expect, it } from 'vitest';
import { calculateMembershipRenewalDate } from '@/services/finance.service';

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
