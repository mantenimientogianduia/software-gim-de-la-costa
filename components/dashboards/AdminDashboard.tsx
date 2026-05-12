'use client';
import { useState, useEffect } from 'react';
import { UserProfile, userService } from '@/services/user.service';
import { financeService, Payment } from '@/services/finance.service';
import { attendanceService, AttendanceRecord } from '@/services/attendance.service';
import { classService, GymClass } from '@/services/class.service';
import { motion, AnimatePresence } from 'motion/react';

import ClassScheduler from '@/components/classes/ClassScheduler';

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'users' | 'finance' | 'classes'>('attendance');
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [att, usrs] = await Promise.all([
          attendanceService.getActiveUsers(),
          userService.getAllUsers()
        ]);
        setAttendees(att);
        setUsers(usrs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleApproveUser = async (uid: string) => {
    try {
      await userService.updateUserStatus(uid, 'active');
      setUsers(users.map(u => u.id === uid ? { ...u, status: 'active' } : u));
    } catch (err) {
      alert('Error al aprobar usuario');
    }
  };

  const tabs = [
    { id: 'attendance', name: 'Presentismo', icon: 'groups' },
    { id: 'users', name: 'Socios', icon: 'person_search' },
    { id: 'finance', name: 'Pagos', icon: 'payments' },
    { id: 'classes', name: 'Clases', icon: 'schedule' },
  ];

  if (loading) return <div>Cargando panel de control...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
       <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary mb-2 block">Administración Central</span>
            <h1 className="font-headline text-6xl font-black uppercase tracking-tighter italic">PANEL DE CONTROL</h1>
          </div>
          
          <div className="flex bg-surface-container-low p-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-3 px-6 py-4 rounded-xl font-label text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-glow font-black' : 'text-tertiary hover:text-white'}`}
               >
                 <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                 {tab.name}
               </button>
             ))}
          </div>
       </header>

       <main className="min-h-[600px]">
          <AnimatePresence mode="wait">
             {activeTab === 'attendance' && (
               <motion.div 
                 key="attendance"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                  <h2 className="font-headline text-3xl font-black uppercase tracking-tight italic">Socios en el Gimnasio ({attendees.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendees.map(record => (
                      <div key={record.id} className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary ghost-border flex justify-between items-center group hover:bg-surface-container-high transition-colors">
                        <div>
                           <p className="font-headline text-xl font-black uppercase tracking-tight">{record.userName}</p>
                           <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mt-1">Ingresó: {(record.checkIn?.toDate ? record.checkIn.toDate() : new Date(record.checkIn)).toLocaleTimeString()}</p>
                        </div>
                        <button 
                          onClick={() => attendanceService.checkOut(record.userId, record.id).then(() => setAttendees(prev => prev.filter(a => a.id !== record.id)))}
                          className="p-3 bg-surface-container-highest rounded-lg hover:text-error transition-colors material-symbols-outlined"
                        >
                          logout
                        </button>
                      </div>
                    ))}
                    {attendees.length === 0 && <p className="text-tertiary uppercase tracking-widest text-xs opacity-50">No hay socios activos en este momento.</p>}
                  </div>
               </motion.div>
             )}

             {activeTab === 'users' && (
               <motion.div 
                 key="users"
                 className="bg-surface-container-low rounded-3xl overflow-hidden ghost-border"
               >
                 <table className="w-full text-left">
                   <thead className="bg-white/5 border-b border-white/10">
                     <tr>
                       <th className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">Socio</th>
                       <th className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">Email</th>
                       <th className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">Resumen</th>
                       <th className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">Acción</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {users.filter(u => u.role === 'socio').map(user => (
                       <tr key={user.id} className="hover:bg-white/5 transition-colors">
                         <td className="p-6 font-headline font-black uppercase tracking-tight text-lg italic">{user.firstName} {user.lastName}</td>
                         <td className="p-6 font-mono text-xs text-tertiary">{user.email}</td>
                         <td className="p-6">
                            <span className={`px-3 py-1 rounded-full font-label text-[8px] uppercase font-black tracking-widest ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {user.status}
                            </span>
                         </td>
                         <td className="p-6">
                            {user.status === 'pending' && (
                              <button 
                                onClick={() => handleApproveUser(user.id!)}
                                className="px-4 py-2 bg-primary text-white font-label text-[9px] font-black uppercase tracking-widest rounded hover:scale-105 transition-transform"
                              >
                                Aprobar
                              </button>
                            )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </motion.div>
             )}

             {activeTab === 'classes' && (
               <motion.div 
                 key="classes"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
               >
                 <ClassScheduler instructorId={profile.email} />
               </motion.div>
             )}
          </AnimatePresence>
       </main>
    </div>
  );
}
