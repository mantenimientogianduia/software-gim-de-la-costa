import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

const rules = readFileSync('firestore.rules', 'utf8');

describe('Firestore rules contract', () => {
  it('requires verified email tokens for signed-in access', () => {
    expect(rules).toContain(
      'function isSignedIn() { return request.auth != null && request.auth.token.email_verified == true; }'
    );
  });

  it('defines payment access rules for admins and owners', () => {
    expect(rules).toContain('match /payments/{paymentId}');
    expect(rules).toContain('resource.data.userId == request.auth.token.email');
    expect(rules).toContain('allow create: if isAdmin()');
  });

  it('allows member booking transactions to update only class counters', () => {
    expect(rules).toContain("incoming().diff(existing()).affectedKeys().hasOnly(['enrolledCount'])");
    expect(rules).toContain('incoming().enrolledCount <= existing().capacity');
  });
});
