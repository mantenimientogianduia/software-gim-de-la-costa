import { describe, expect, it } from 'vitest';
import { buildPublicGymPresence, buildPublicPresenceRecord } from '@/services/social.service';

describe('buildPublicGymPresence', () => {
  it('excludes present members whose social profile is hidden by default', () => {
    const result = buildPublicGymPresence([
      {
        id: 'u1',
        atGym: true,
        firstName: 'Ana',
        lastName: 'Privada',
        email: 'ana@test.com',
      },
    ]);

    expect(result).toEqual([]);
  });

  it('returns only safe public fields for visible members', () => {
    const result = buildPublicGymPresence([
      {
        id: 'u1',
        atGym: true,
        socialVisibility: 'visible',
        firstName: 'Ana',
        lastName: 'Visible',
        instagram: '@anafit',
        publicBio: 'Me gusta entrenar fuerza.',
        currentStreak: 8,
        email: 'ana@test.com',
        dni: '123',
        phone: '555',
        weight: 60,
        healthObservations: 'privado',
        membershipValidUntil: {},
      },
    ]);

    expect(result).toEqual([
      {
        id: 'u1',
        displayName: 'Ana Visible',
        socialVisibility: 'visible',
        instagram: '@anafit',
        publicBio: 'Me gusta entrenar fuerza.',
        currentStreak: 8,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('ana@test.com');
    expect(JSON.stringify(result)).not.toContain('123');
    expect(JSON.stringify(result)).not.toContain('privado');
  });

  it('anonymizes identity and social fields for anonymous members', () => {
    const result = buildPublicGymPresence([
      {
        id: 'u1',
        atGym: true,
        socialVisibility: 'anonymous',
        firstName: 'Ana',
        lastName: 'Visible',
        instagram: '@anafit',
        publicBio: 'No deberia verse.',
        currentStreak: 4,
      },
    ]);

    expect(result).toEqual([
      {
        id: 'u1',
        displayName: 'Socio anonimo',
        socialVisibility: 'anonymous',
      },
    ]);
  });

  it('builds a sanitized public presence record for access check-in', () => {
    expect(buildPublicPresenceRecord({
      id: 'u2',
      socialVisibility: 'visible',
      firstName: 'Leo',
      lastName: 'Costa',
      instagram: 'leocosta',
      email: 'leo@test.com',
      dni: '999',
    })).toEqual({
      id: 'u2',
      displayName: 'Leo Costa',
      socialVisibility: 'visible',
      instagram: '@leocosta',
    });
  });
});
