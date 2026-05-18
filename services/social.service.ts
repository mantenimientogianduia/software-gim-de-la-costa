import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export type SocialVisibility = 'hidden' | 'visible' | 'anonymous';

export interface PublicGymPresence {
  id: string;
  displayName: string;
  socialVisibility: Exclude<SocialVisibility, 'hidden'>;
  instagram?: string;
  publicBio?: string;
  currentStreak?: number;
}

export function normalizeInstagram(value?: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function buildPublicGymPresence(users: any[]): PublicGymPresence[] {
  return users
    .filter(user => user.atGym === true)
    .map(user => ({
      ...user,
      socialVisibility: (user.socialVisibility || 'hidden') as SocialVisibility,
    }))
    .filter(user => user.socialVisibility !== 'hidden')
    .map(user => {
      if (user.socialVisibility === 'anonymous') {
        return {
          id: user.id,
          displayName: 'Socio anonimo',
          socialVisibility: 'anonymous',
        };
      }

      return {
        id: user.id,
        displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Socio',
        socialVisibility: 'visible',
        instagram: normalizeInstagram(user.instagram) || undefined,
        publicBio: user.publicBio || undefined,
        currentStreak: typeof user.currentStreak === 'number' ? user.currentStreak : undefined,
      };
    });
}

export function buildPublicPresenceRecord(user: any): PublicGymPresence | null {
  const [record] = buildPublicGymPresence([{ ...user, atGym: true }]);
  return record || null;
}

export class SocialService {
  getPublicGymPresence(callback: (profiles: PublicGymPresence[]) => void) {
    return onSnapshot(collection(db, 'publicPresence'), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublicGymPresence)));
    });
  }
}

export const socialService = new SocialService();
