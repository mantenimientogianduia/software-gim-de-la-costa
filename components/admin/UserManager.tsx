'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, UserProfile } from '@/services/user.service';
import { calculateMemberFinanceSummaries, financeService, Payment } from '@/services/finance.service';

type User = UserProfile & { id: string };

const ROLE_LABELS = { admin: 'Admin', profesor: 'Coach', socio: 'Socio' };
const STATUS_LABELS = { active: 'Activo', inactive: 'Inactivo', pending: 'Pendiente' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-[9px] uppercase tracking-widest text-tertiary">{label}</label>
      {children}
    </div>
  );
}

const INPUT = 'w-full bg-surface-container-highest/60 px-4 py-3 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-body text-sm';
const SELECT = INPUT + ' cursor-pointer';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [newUserData, setNewUserData] = useState({ firstName: '', lastName: '', email: '', dni: '', role: 'socio' as const });

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [data, paymentData] = await Promise.all([
        userService.getAllUsers() as Promise<User[]>,
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

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni || '',
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await userService.updateUserFields(editingUser.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        dni: editForm.dni,
        phone: editForm.phone,
        birthDate: (editForm.birthDate as string) || null,
        role: editForm.role as any,
        status: editForm.status as any,
      });
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      showToast('Socio actualizado.', 'ok');
    } catch {
      showToast('Error al guardar. Intentá de nuevo.', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempId = `temp_${Date.now()}`;
      await userService.createUserProfile(tempId, newUserData.email, newUserData.firstName, newUserData.lastName, newUserData.role, newUserData.dni);
      await userService.updateUserStatus(tempId, 'active');
      setIsCreating(false);
      setNewUserData({ firstName: '', lastName: '', email: '', dni: '', role: 'socio' });
      await fetchUsers();
      showToast('Socio creado.', 'ok');
    } catch {
      showToast('Error al crear usuario.', 'err');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || (u.dni || '').includes(q);
      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      return u.status === filter;
    });
  }, [users, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
  }), [users]);

  const financeByEmail = useMemo(() => {
    const summaries = calculateMemberFinanceSummaries({ users, payments });
    return new Map(summaries.map(s => [s.email, s]));
  }, [users, payments]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-label text-sm font-bold uppercase tracking-widest ${
              toast.type === 'ok' ? 'bg-green-500/20 border border-green-500/40 text-green-300' : 'bg-error/20 border border-error/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{toast.type === 'ok' ? 'check_circle' : 'error'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Drawer */}
      <AnimatePresence>
        {editingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingUser(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface-container-low border-l border-outline-variant/20 shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                <div>
                  <p className="font-label text-[9px] uppercase tracking-widest text-tertiary">Editando socio</p>
                  <h3 className="font-headline font-black text-xl uppercase tracking-tight">
                    {editingUser.firstName} {editingUser.lastName}
                  </h3>
                </div>
                <button onClick={() => setEditingUser(null)} className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre">
                    <input className={INPUT} value={editForm.firstName || ''} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                  </Field>
                  <Field label="Apellido">
                    <input className={INPUT} value={editForm.lastName || ''} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                  </Field>
                </div>
                <Field label="DNI">
                  <input className={INPUT + ' font-mono'} value={editForm.dni || ''} onChange={e => setEditForm(f => ({ ...f, dni: e.target.value }))} placeholder="Sin puntos" />
                </Field>
                <Field label="Teléfono">
                  <input className={INPUT + ' font-mono'} value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54..." />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input type="date" className={INPUT} value={(editForm.birthDate as string) || ''} onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))} />
                </Field>
                <Field label="Email">
                  <input className={INPUT} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Rol">
                    <select className={SELECT} value={editForm.role || 'socio'} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as any }))}>
                      <option value="socio">Socio</option>
                      <option value="profesor">Coach</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                  <Field label="Estado">
                    <select className={SELECT} value={editForm.status || 'active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as any }))}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="pending">Pendiente</option>
                    </select>
                  </Field>
                </div>

                {/* Finance summary */}
                {(() => {
                  const finance = financeByEmail.get(editingUser.email);
                  if (!finance) return null;
                  return (
                    <div className="bg-surface-container-high rounded-xl p-4 space-y-1">
                      <p className="font-label text-[9px] uppercase tracking-widest text-tertiary">Membresía</p>
                      <p className="font-mono text-sm">
                        <span className={finance.financeStatus === 'moroso' ? 'text-error' : finance.financeStatus === 'por_vencer' ? 'text-primary' : 'text-green-400'}>
                          {finance.financeStatus === 'moroso' ? 'Moroso' : finance.financeStatus === 'por_vencer' ? 'Por vencer' : 'Al día'}
                        </span>
                        {finance.membershipValidUntil && ` · hasta ${finance.membershipValidUntil.toLocaleDateString()}`}
                      </p>
                      <p className="font-mono text-xs text-tertiary">Total pagado: ${finance.totalPaid.toLocaleString()}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Save button */}
              <div className="p-6 border-t border-outline-variant/10">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-label text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-high/30 p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between">
          <span className="font-label text-[10px] uppercase tracking-widest text-tertiary">Total</span>
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

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface-container-low p-6 rounded-2xl ghost-border">
        <div className="flex bg-surface-container-high p-1 rounded-lg gap-1 border border-outline-variant/10">
          {(['all', 'pending', 'active'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
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
              type="text" placeholder="Buscar por nombre, email o DNI..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-highest/50 py-3 pl-12 pr-4 rounded-xl outline-none font-body text-sm border border-transparent focus:border-primary transition-all"
            />
          </div>
          <button onClick={() => setIsCreating(!isCreating)}
            className="w-full md:w-auto bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-label text-[10px] uppercase font-black tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
          >
            {isCreating ? 'Cerrar' : 'Crear Socio'}
          </button>
        </div>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="bg-surface-container-low p-8 rounded-3xl ghost-border border-t-4 border-t-primary animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-8 flex items-center gap-2 italic">
            <span className="material-symbols-outlined text-primary">person_add</span>
            Pre-registrar Nuevo Socio
          </h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Nombre', key: 'firstName' as const },
              { label: 'Apellido', key: 'lastName' as const },
              { label: 'Email', key: 'email' as const },
              { label: 'DNI', key: 'dni' as const },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-2">
                <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">{label}</label>
                <input required value={newUserData[key]}
                  onChange={e => setNewUserData({ ...newUserData, [key]: e.target.value })}
                  className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-body text-sm"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="font-label text-[9px] uppercase tracking-widest text-tertiary ml-1">Rol</label>
              <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value as any })}
                className="w-full bg-surface-container-high p-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary font-label text-[10px] uppercase tracking-widest"
              >
                <option value="socio">Socio</option>
                <option value="profesor">Profesor / Entrenador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-primary text-on-primary py-5 rounded-xl font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? 'Procesando...' : 'Guardar y Activar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden ghost-border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/20 border-b border-outline-variant/10">
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">DNI</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary hidden md:table-cell">Teléfono</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Rol</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary hidden lg:table-cell">Membresía</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Estado</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary text-right">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading && users.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="p-6">
                      <div className="h-4 rounded bg-surface-container-high animate-pulse" style={{ width: j === 0 ? '140px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))}
              {filteredUsers.map(user => {
                const finance = financeByEmail.get(user.email);
                return (
                  <tr
                    key={user.id}
                    onClick={() => openEdit(user)}
                    className="hover:bg-surface-container-high/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-headline font-black text-sm uppercase shrink-0">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-body font-bold uppercase tracking-tight text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] lowercase font-normal opacity-40 italic">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-primary font-bold">{user.dni || <span className="text-tertiary opacity-30">—</span>}</td>
                    <td className="p-6 font-mono text-xs hidden md:table-cell">{user.phone || <span className="text-tertiary opacity-30">—</span>}</td>
                    <td className="p-6">
                      <span className="font-label text-[9px] uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-full">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="p-6 hidden lg:table-cell">
                      {finance ? (
                        <div>
                          <span className={`px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${
                            finance.financeStatus === 'moroso' ? 'bg-error/10 text-error border-error/30'
                            : finance.financeStatus === 'por_vencer' ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-green-500/10 text-green-400 border-green-500/30'
                          }`}>
                            {finance.financeStatus === 'moroso' ? 'Moroso' : finance.financeStatus === 'por_vencer' ? 'Por vencer' : 'Al día'}
                          </span>
                          {finance.membershipValidUntil && (
                            <p className="mt-1 font-mono text-[10px] text-tertiary">{finance.membershipValidUntil.toLocaleDateString()}</p>
                          )}
                        </div>
                      ) : <span className="text-tertiary opacity-30 text-xs">—</span>}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(255,87,34,0.5)]'
                          : user.status === 'pending' ? 'bg-yellow-500 animate-pulse'
                          : 'bg-tertiary/20'
                        }`} />
                        <span className={`font-label text-[10px] uppercase font-black tracking-widest ${user.status === 'active' ? 'text-primary' : 'text-on-surface'}`}>
                          {STATUS_LABELS[user.status]}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(user); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && !loading && (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-6xl mb-6 opacity-10">person_off</span>
            <p className="font-headline font-black uppercase tracking-widest text-tertiary/30 italic">Sin resultados</p>
          </div>
        )}
      </div>
    </div>
  );
}
