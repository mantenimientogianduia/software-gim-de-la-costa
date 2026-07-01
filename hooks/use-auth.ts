import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService, UserProfile } from '@/services/user.service';

export const DEV_SESSION_KEY = '__gymDevSession__';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DEV_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        setUser({ uid: 'dev-uid', email: session.email } as unknown as User);
        setProfile(session.profile as UserProfile);
        setIsDevMode(true);
        setLoading(false);
        return;
      }
    } catch {}


    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await userService.getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, isDevMode };
}
