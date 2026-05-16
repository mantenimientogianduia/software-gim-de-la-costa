'use client';
import { useState, useEffect } from 'react';
import { financeService, Payment } from '@/services/finance.service';
import { userService, UserProfile } from '@/services/user.service';
import { Timestamp } from 'firebase/firestore';

export default function FinanceManager({ initialTab = 'history' }: { initialTab?: 'history' | 'expiring' }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expiringUsers, setExpiringUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'expiring'>(initialTab);

  const [formData, setFormData] = useState({
    userEmail: '',
    amount: 0,
    concept: 'Cuota Mensual',
    months: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = await financeService.getAllPayments();
      setPayments(p);
      const e = await financeService.getExpiringMemberships();
      setExpiringUsers(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userProfile = await userService.getUserByEmail(formData.userEmail);
      if (!userProfile) {
        alert('Usuario no encontrado');
        setLoading(false);
        return;
      }

      const validUntil = new Date();
      // If user has a valid membership, extend from there, otherwise from now
      const currentValidUntil = userProfile.membershipValidUntil?.toDate?.() || new Date();
      const baseDate = currentValidUntil > new Date() ? currentValidUntil : new Date();
      
      validUntil.setTime(baseDate.getTime());
      validUntil.setMonth(validUntil.getMonth() + formData.months);

      await financeService.recordPayment({
        userId: formData.userEmail,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        amount: formData.amount,
        concept: formData.concept,
        monthsPaid: formData.months,
        validUntil: Timestamp.fromDate(validUntil),
        status: 'confirmed'
      });

      setIsRecording(false);
      setFormData({ userEmail: '', amount: 0, concept: 'Cuota Mensual', months: 1 });
      await fetchData();
      alert('Pago registrado y membresía extendida.');
    } catch (err) {
      console.error(err);
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex bg-surface-container-high p-1 rounded-sm gap-1">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'history' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
            >
              Historial de Pagos
            </button>
            <button 
              onClick={() => setActiveTab('expiring')}
              className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'expiring' ? 'bg-error text-white font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
            >
              Vencimientos Próximos
            </button>
         </div>
         <button 
           onClick={() => setIsRecording(!isRecording)}
           className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-sm shadow-glow hover:scale-105 transition-all"
         >
           {isRecording ? 'Cancelar' : 'Registrar Pago'}
         </button>
      </div>

      {isRecording && (
        <div className="bg-surface-container-low p-8 rounded-lg ghost-border">
           <h3 className="font-headline font-bold text-xl uppercase tracking-tight mb-6 italic">Registrar Nueva Transacción</h3>
           <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <input 
                required
                type="email"
                placeholder="Email del Socio"
                value={formData.userEmail}
                onChange={e => setFormData({...formData, userEmail: e.target.value.toLowerCase()})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <input 
                required
                type="number"
                placeholder="Monto ($)"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
              />
              <input 
                required
                placeholder="Concepto"
                value={formData.concept}
                onChange={e => setFormData({...formData, concept: e.target.value})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <select 
                value={formData.months}
                onChange={e => setFormData({...formData, months: Number(e.target.value)})}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
              >
                <option value={1}>1 Mes</option>
                <option value={2}>2 Meses</option>
                <option value={3}>3 Meses (Trimestre)</option>
                <option value={6}>6 Meses (Semestre)</option>
                <option value={12}>12 Meses (Año)</option>
              </select>
              <div className="lg:col-span-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-primary text-on-primary px-12 py-4 rounded-sm font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
           </form>
        </div>
      )}

      {activeTab === 'history' ? (
        <div className="bg-surface-container-low rounded-lg overflow-hidden ghost-border">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
                    <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Fecha</th>
                    <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
                    <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Concepto</th>
                    <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Monto</th>
                    <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Vence</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                 {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-high/50 transition-colors">
                       <td className="p-6 font-mono text-[11px] text-tertiary">
                          {p.paymentDate?.toDate ? p.paymentDate.toDate().toLocaleDateString() : 'Pendiente'}
                       </td>
                       <td className="p-6 font-body font-bold text-sm uppercase tracking-tight">
                          {p.userName}
                          <p className="text-[10px] opacity-50 lowercase italic font-normal">{p.userId}</p>
                       </td>
                       <td className="p-6 font-label text-[10px] uppercase tracking-widest text-primary font-bold">
                          {p.concept} ({p.monthsPaid}m)
                       </td>
                       <td className="p-6 font-mono text-sm font-bold text-on-surface">
                          ${p.amount.toLocaleString()}
                       </td>
                       <td className="p-6">
                          <span className="font-mono text-[11px] bg-surface-container-highest px-3 py-1 rounded">
                            {p.validUntil?.toDate ? p.validUntil.toDate().toLocaleDateString() : '-'}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {payments.length === 0 && !loading && (
             <div className="py-24 text-center opacity-30">
                <span className="material-symbols-outlined text-4xl mb-4">payments</span>
                <p className="font-label uppercase tracking-widest text-xs">No hay historial de pagos</p>
             </div>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {expiringUsers.map((user) => {
              const diff = user.membershipValidUntil?.toDate ? Math.ceil((user.membershipValidUntil.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : -999;
              return (
                <div key={user.id} className={`p-6 rounded-xl ghost-border overflow-hidden relative ${diff < 0 ? 'bg-error/10 border-error' : 'bg-surface-container-low'}`}>
                   {diff < 0 && <div className="absolute top-0 right-0 bg-error text-white px-3 py-1 font-label text-[8px] font-black uppercase tracking-widest">VENCIDO</div>}
                   <h4 className="font-headline font-bold text-lg uppercase tracking-tight mb-4">{user.firstName} {user.lastName}</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-tertiary font-label uppercase tracking-widest">Vencimiento</span>
                         <span className="font-mono font-bold">
                            {user.membershipValidUntil?.toDate ? user.membershipValidUntil.toDate().toLocaleDateString() : 'N/A'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-tertiary font-label uppercase tracking-widest">Estado</span>
                         <span className={`font-bold uppercase tracking-tighter ${diff < 0 ? 'text-error' : 'text-primary'}`}>
                            {diff < 0 ? `Vencido hace ${Math.abs(diff)} días` : `Vence en ${diff} días`}
                         </span>
                      </div>
                   </div>
                   <button 
                     onClick={() => {
                        setIsRecording(true);
                        setFormData({...formData, userEmail: user.email});
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="w-full mt-6 py-3 bg-surface-container-highest hover:bg-primary hover:text-white transition-all font-label text-[9px] font-bold uppercase tracking-widest rounded"
                   >
                      Registrar Renovación
                   </button>
                </div>
              );
           })}
           {expiringUsers.length === 0 && !loading && (
             <div className="col-span-full py-24 text-center opacity-30">
                <span className="material-symbols-outlined text-4xl mb-4">event_available</span>
                <p className="font-label uppercase tracking-widest text-xs">No hay vencimientos próximos</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
