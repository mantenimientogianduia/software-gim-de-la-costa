'use client';

type Role = 'admin' | 'profesor' | 'socio';

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl scale-75 origin-bottom-left hover:scale-100 transition-transform">
      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-white/40 italic">
        DEBUG MODE
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
    </div>
  );
}
