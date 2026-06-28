'use client';

import { useRouter } from 'next/navigation';
import { DEV_SESSION_KEY } from '@/hooks/use-auth';

type Role = 'admin' | 'profesor' | 'socio';

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  isDevSession?: boolean;
}

export default function RoleSwitcher({ currentRole, onRoleChange, isDevSession }: RoleSwitcherProps) {
  const router = useRouter();

  const handleExit = () => {
    sessionStorage.removeItem(DEV_SESSION_KEY);
    router.push('/dev-login');
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-black/90 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl scale-75 origin-bottom-left hover:scale-100 transition-transform">
      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-yellow-400/80 italic">
        DEV
      </div>
      <div className="flex gap-1 h-8">
        {(['admin', 'profesor', 'socio'] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              currentRole === role
                ? 'bg-primary text-white scale-105 shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                : 'text-white/60 hover:bg-white/10'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      {isDevSession && (
        <button
          onClick={handleExit}
          className="ml-1 px-3 h-8 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          title="Salir del modo dev"
        >
          ✕
        </button>
      )}
    </div>
  );
}
