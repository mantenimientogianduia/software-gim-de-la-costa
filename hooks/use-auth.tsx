'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { userService, UserProfile } from '@/services/user.service';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isSocio: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isInstructor: false,
  isSocio: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileData = await userService.getUserProfile(user.uid);
        if (profileData) {
          setProfile(profileData);
        } else {
            // First time login - auto create socio profile if not exists
            await userService.createUserProfile(user.uid, user.email!, user.displayName?.split(' ')[0] || 'Nuevo', user.displayName?.split(' ')[1] || 'Socio');
            const newProfile = await userService.getUserProfile(user.uid);
            setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isInstructor: profile?.role === 'instructor',
    isSocio: profile?.role === 'socio',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
