'use client';
import { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/services/user.service';

export default function UserManager() {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dni: '',
    role: 'socio' as const
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For manually created users, we might use a random ID or the email as ID if they yet to sign in via Google
      // Actually, since they will sign in with Google, we should ideally use the DNI or just let them sign in normally.
      // But user says 'producir que ellos puedan entrar por primera vez'.
      // If I create the profile now, when they login with Google, authService will find the profile.
      // I'll used a prefixed ID "manual_" + DNI which is temporary until they login? No, let's just use a random ID.
      const tempId = `temp_${Date.now()}`;
      await userService.createUserProfile(
        tempId,
        newUserData.email,
        newUserData.firstName,
        newUserData.lastName,
        newUserData.role,
        newUserData.dni
      );
      // Ensure status is active for manual users?
      await userService.updateUserStatus(tempId, 'active');
      
      setIsCreating(false);
      setNewUserData({ firstName: '', lastName: '', email: '', dni: '', role: 'socio' });
      await fetchUsers();
      alert('Socio creado correctamente. Puede iniciar sesión con Google usando el email ingresado.');
    } catch (err) {
      console.error(err);
      alert('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers() as (UserProfile & { id: string })[];
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      await fetchUsers();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'profesor' | 'socio') => {
    try {
      await userService.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      alert('Error al actualizar rol');
    }
  };

  const handleDniChange = async (userId: string, dni: string) => {
    try {
      await userService.updateUserDni(userId, dni);
      await fetchUsers();
    } catch (err) {
      alert('Error al actualizar DNI');
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.status === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-surface-container-high p-1 rounded-sm gap-1">
           {(['all', 'pending', 'active'] as const).map((f) => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${filter === f ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
             >
               {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Activos'}
             </button>
           ))}
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-primary-container text-on-primary-container px-6 py-2 rounded-sm font-label text-[10px] uppercase font-bold tracking-widest hover:scale-105 transition-all"
        >
          {isCreating ? 'Cerrar Formulario' : 'Crear Nuevo Usuario'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-surface-container-low p-8 rounded-lg ghost-border animate-in slide-in-from-top-4 duration-300">
           <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-6">Nuevo Usuario</h3>
           <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <input 
                required
                placeholder="Nombres"
                value={newUserData.firstName}
                onChange={e => setNewUserData({...newUserData, firstName: e.target.value})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body uppercase text-sm"
              />
              <input 
                required
                placeholder="Apellidos"
                value={newUserData.lastName}
                onChange={e => setNewUserData({...newUserData, lastName: e.target.value})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body uppercase text-sm"
              />
              <input 
                required
                type="email"
                placeholder="Email (para Google Login)"
                value={newUserData.email}
                onChange={e => setNewUserData({...newUserData, email: e.target.value.toLowerCase()})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <input 
                required
                placeholder="DNI"
                value={newUserData.dni}
                onChange={e => setNewUserData({...newUserData, dni: e.target.value})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
              />
              <select 
                value={newUserData.role}
                onChange={e => setNewUserData({...newUserData, role: e.target.value as any})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
              >
                <option value="socio">Socio</option>
                <option value="profesor">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="lg:col-span-1 flex items-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-primary text-on-primary py-4 rounded-sm font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
                >
                  {loading ? 'Creando...' : 'Guardar Usuario'}
                </button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-surface-container-low rounded-lg overflow-hidden ghost-border">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">DNI (Acceso)</th>
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Email</th>
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Rol</th>
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Estado</th>
                  <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary text-right">Acciones</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
               {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-high/50 transition-colors">
                     <td className="p-6 font-body font-bold uppercase tracking-tight text-sm">
                        {user.firstName} {user.lastName}
                     </td>
                     <td className="p-6">
                        <input 
                           type="text"
                           defaultValue={user.dni || ''}
                           placeholder="SIN DNI"
                           onBlur={(e) => {
                             if (e.target.value !== (user.dni || '')) {
                               handleDniChange(user.id, e.target.value);
                             }
                           }}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               (e.target as HTMLInputElement).blur();
                             }
                           }}
                           className="bg-surface-container-highest px-3 py-2 rounded font-mono text-xs text-primary-container outline-none border border-transparent focus:border-primary w-32"
                        />
                     </td>
                     <td className="p-6 font-body text-tertiary text-sm italic opacity-70">
                        {user.email}
                     </td>
                     <td className="p-6">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          className="font-label text-[9px] uppercase tracking-widest bg-surface-container-highest px-3 py-1 rounded text-primary-container font-black outline-none appearance-none cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          <option value="socio">Socio</option>
                          <option value="profesor">Profesor</option>
                          <option value="admin">Admin</option>
                        </select>
                     </td>
                     <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(255,87,34,0.5)]' : user.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-surface-variant'}`}></div>
                           <span className="font-label text-[10px] uppercase tracking-widest text-on-surface">
                              {user.status === 'pending' ? 'Pendiente' : user.status === 'active' ? 'Activo' : 'Inactivo'}
                           </span>
                        </div>
                     </td>
                     <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                           {user.status === 'pending' && (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'active')}
                               className="bg-primary/20 text-primary font-label text-[9px] font-bold uppercase tracking-widest py-2 px-4 rounded-sm hover:bg-primary hover:text-white transition-all"
                             >
                               Aprobar
                             </button>
                           )}
                           {user.status === 'active' && (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'inactive')}
                               className="bg-error/10 text-error font-label text-[9px] font-bold uppercase tracking-widest py-2 px-4 rounded-sm hover:bg-error hover:text-white transition-all"
                             >
                               Desactivar
                             </button>
                           )}
                           {user.status === 'inactive' && (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'active')}
                               className="bg-surface-container-highest text-white font-label text-[9px] font-bold uppercase tracking-widest py-2 px-4 rounded-sm hover:bg-primary transition-all"
                             >
                               Reactivar
                             </button>
                           )}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         
         {filteredUsers.length === 0 && !loading && (
           <div className="py-24 text-center">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-20">person_off</span>
              <p className="font-label uppercase tracking-widest text-tertiary">No se encontraron socios</p>
           </div>
         )}
      </div>
    </div>
  );
}
