'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, UserProfile } from '@/services/user.service';
import { calculateMemberFinanceSummaries, financeService, Payment } from '@/services/finance.service';

export default function UserManager() {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dni: '',
    role: 'socio' as const
  });

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [data, paymentData] = await Promise.all([
        userService.getAllUsers() as Promise<(UserProfile & { id: string })[]>,
        financeService.getAllPayments(),
      ]);
      setUsers(data);
      setPayments(paymentData);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempId = `temp_${Date.now()}`;
      await userService.createUserProfile(
        tempId,
        newUserData.email,
        newUserData.firstName,
        newUserData.lastName,
        newUserData.role,
        newUserData.dni
      );
      await userService.updateUserStatus(tempId, 'active');
      
      setIsCreating(false);
      setNewUserData({ firstName: '', lastName: '', email: '', dni: '', role: 'socio' });
      await fetchUsers();
      showToast('Socio creado. Puede iniciar sesión con Google usando el email ingresado.', 'ok');
    } catch (err) {
      console.error(err);
      showToast('Error al crear usuario. Verificá los datos e intentá de nuevo.', 'err');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      await fetchUsers();
      showToast('Estado actualizado.', 'ok');
    } catch {
      showToast('Error al actualizar estado.', 'err');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'profesor' | 'socio') => {
    try {
      await userService.updateUserRole(userId, newRole);
      await fetchUsers();
      showToast('Rol actualizado.', 'ok');
    } catch {
      showToast('Error al actualizar rol.', 'err');
    }
  };

  const handleDniChange = async (userId: string, dni: string) => {
    try {
      await userService.updateUserDni(userId, dni);
      showToast('DNI actualizado.', 'ok');
    } catch {
      showToast('Error al actualizar DNI.', 'err');
    }
  };

  const handlePhoneChange = async (userId: string, phone: string) => {
    try {
      await userService.updateUserPhone(userId, phone);
      showToast('Teléfono actualizado.', 'ok');
    } catch {
      showToast('Error al actualizar teléfono.', 'err');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.dni?.includes(searchTerm);
      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      return u.status === filter;
    });
  }, [users, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length
  }), [users]);

  const financeByEmail = useMemo(() => {
    const summaries = calculateMemberFinanceSummaries({ users, payments });
    return new Map(summaries.map(summary => [summary.email, summary]));
  }, [users, payments]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-label text-sm font-bold uppercase tracking-widest ${
              toast.type === 'ok'
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-error/20 border border-error/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'ok' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-surface-container-high/30 p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-tertiary">Total Usuarios</span>
            <span className="font-headline text-2xl font-black">{stats.total}</span>
         </div>
         <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary">Activos</span>
            <span className="font-headline text-2xl font-black text-primary">{stats.active}</span>
         </div>
         <div className="bg-surface-container-high/30 p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-tertiary">Pendientes</span>
            <span className="font-headline text-2xl font-black">{stats.pending}</span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface-container-low p-6 rounded-2xl ghost-border">
        <div className="flex bg-surface-container-high p-1 rounded-lg gap-1 border border-outline-variant/10">
           {(['all', 'pending', 'active'] as const).map((f) => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-md transition-all ${filter === f ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
             >
               {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Activos'}
             </button>
           ))}
        </div>
        
        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary text-sm">search</span>
              <input 
                 type="text"
                 placeholder="Buscar por nombre, email o DNI..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-surface-container-highest/50 py-3 pl-12 pr-4 rounded-xl outline-none font-body text-sm border border-transparent focus:border-primary transition-all"
              />
           </div>
           <button 
              onClick={() => setIsCreating(!isCreating)}
              className="w-full md:w-auto bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-label text-[10px] uppercase font-black tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
           >
              {isCreating ? 'Cerrar' : 'Crear Usuario'}
           </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-surface-container-low p-8 rounded-3xl ghost-border border-t-4 border-t-primary animate-in slide-in-from-top-4 duration-300 shadow-2xl">
           <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-8 flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-primary">person_add</span>
              Pre-registrar Nuevo Socio
           </h3>
           <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">Nombres</label>
                 <input 
                   required
                   value={newUserData.firstName}
                   onChange={e => setNewUserData({...newUserData, firstName: e.target.value})}
                   className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-body uppercase text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">Apellidos</label>
                 <input 
                   required
                   value={newUserData.lastName}
                   onChange={e => setNewUserData({...newUserData, lastName: e.target.value})}
                   className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-body uppercase text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">Email de acceso</label>
                 <input 
                   required
                   type="email"
                   value={newUserData.email}
                   onChange={e => setNewUserData({...newUserData, email: e.target.value.toLowerCase()})}
                   className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-body text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">DNI (Para el QR)</label>
                 <input 
                   required
                   value={newUserData.dni}
                   onChange={e => setNewUserData({...newUserData, dni: e.target.value})}
                   className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-mono text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">Rol en el sistema</label>
                 <select 
                   value={newUserData.role}
                   onChange={e => setNewUserData({...newUserData, role: e.target.value as any})}
                   className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-label text-[10px] uppercase tracking-widest"
                 >
                   <option value="socio">Socio (Damas/Caballeros)</option>
                   <option value="profesor">Profesor / Entrenador</option>
                   <option value="admin">Administrador</option>
                 </select>
              </div>
              <div className="lg:col-span-1 flex items-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-primary text-on-primary py-5 rounded-xl font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {loading ? 'Procesando...' : 'Guardar y Activar'}
                </button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden ghost-border shadow-xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-surface-container-highest/20 border-b border-outline-variant/10">
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Identidad</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">DNI Acceso</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Teléfono</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Rol</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Membresía</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Estado</th>
                     <th className="p-8 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/5">
                  {loading && users.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="p-8">
                          <div className="h-4 rounded bg-surface-container-high animate-pulse" style={{ width: j === 0 ? '120px' : j === 6 ? '80px' : '80px' }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredUsers.map((user) => (
                     <tr key={user.id} className="hover:bg-surface-container-high/30 transition-colors group">
                        <td className="p-8 font-body font-bold uppercase tracking-tight text-sm">
                           <div className="flex flex-col">
                              <span>{user.firstName} {user.lastName}</span>
                              <span className="text-[10px] lowercase font-normal opacity-40 italic tracking-normal">{user.email}</span>
                           </div>
                        </td>
                        <td className="p-8">
                           <div className="relative inline-block">
                              <input 
                                 type="text"
                                 defaultValue={user.dni || ''}
                                 placeholder="-"
                                 onBlur={(e) => {
                                   if (e.target.value !== (user.dni || '')) {
                                     handleDniChange(user.id, e.target.value);
                                   }
                                 }}
                                 className="bg-surface-container-highest/50 px-4 py-2 rounded-lg font-mono text-xs text-primary font-bold outline-none border border-transparent focus:border-primary/30 w-32 tracking-wider"
                              />
                           </div>
                        </td>
                        <td className="p-8">
                           <input
                             type="text"
                             defaultValue={user.phone || ''}
                             placeholder="+54..."
                             onBlur={(e) => {
                               if (e.target.value !== (user.phone || '')) {
                                 handlePhoneChange(user.id, e.target.value);
                               }
                             }}
                             className="bg-surface-container-highest/50 px-4 py-2 rounded-lg font-mono text-xs text-primary font-bold outline-none border border-transparent focus:border-primary/30 w-36"
                           />
                        </td>
                        <td className="p-8">
                           <select 
                             value={user.role}
                             onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                             className="font-label text-[9px] uppercase tracking-widest bg-surface-container-highest/50 px-4 py-2 rounded-lg text-on-surface font-black outline-none border border-transparent hover:bg-primary/10 transition-colors cursor-pointer"
                           >
                             <option value="socio">Socio</option>
                             <option value="profesor">Coach</option>
                             <option value="admin">Admin</option>
                           </select>
                        </td>
                        <td className="p-8">
                           {(() => {
                             const finance = financeByEmail.get(user.email);
                             if (!finance) return <span className="text-tertiary text-xs">-</span>;
                             const statusClass = finance.financeStatus === 'moroso' ? 'bg-error/10 text-error border-error/30' : finance.financeStatus === 'por_vencer' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-green-500/10 text-green-400 border-green-500/30';
                             const label = finance.financeStatus === 'moroso' ? 'Moroso' : finance.financeStatus === 'por_vencer' ? 'Por vencer' : 'Activo';
                             return (
                               <div>
                                 <span className={`px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${statusClass}`}>{label}</span>
                                 <p className="mt-2 font-mono text-[10px] text-tertiary">
                                   {finance.membershipValidUntil ? finance.membershipValidUntil.toLocaleDateString() : 'Sin vencimiento'} · ${finance.totalPaid.toLocaleString()}
                                 </p>
                               </div>
                             );
                           })()}
                        </td>
                        <td className="p-8">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-primary shadow-[0_0_10px_rgba(255,87,34,0.6)]' : user.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-tertiary/20'}`}></div>
                              <span className={`font-label text-[10px] uppercase font-black tracking-widest ${user.status === 'active' ? 'text-primary' : 'text-on-surface'}`}>
                                 {user.status === 'pending' ? 'Pendiente' : user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                           </div>
                        </td>
                        <td className="p-8 text-right">
                           <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              {user.status === 'pending' && (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="bg-primary text-white font-label text-[9px] font-black uppercase tracking-widest py-3 px-6 rounded-lg shadow-glow-error"
                                >
                                  Aprobar
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'inactive')}
                                  className="bg-error/10 text-error font-label text-[9px] font-black uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-error hover:text-white transition-all shadow-sm"
                                >
                                  Suspender
                                </button>
                              )}
                              {user.status === 'inactive' && (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                  className="bg-primary/20 text-primary font-label text-[9px] font-black uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
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
         </div>
         
         {filteredUsers.length === 0 && !loading && (
           <div className="py-32 text-center bg-surface-container-low/50">
              <span className="material-symbols-outlined text-6xl mb-6 opacity-10">person_off</span>
              <p className="font-headline font-black uppercase tracking-widest text-tertiary/30 italic">No se encontraron resultados para tu búsqueda</p>
           </div>
         )}
      </div>
    </div>
  );
}
