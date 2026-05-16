'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  calculateMembershipRenewalDate,
  DEFAULT_PAYMENT_PLANS,
  financeService,
  loadFinanceDashboardData,
  Payment,
  PaymentMethod,
  PaymentPlan
} from '@/services/finance.service';
import { userService } from '@/services/user.service';
import { Timestamp } from 'firebase/firestore';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  debit: 'Debito',
  credit: 'Credito',
  mercado_pago: 'Mercado Pago',
  other: 'Otro',
};

const defaultPlans: PaymentPlan[] = DEFAULT_PAYMENT_PLANS.map(plan => ({ ...plan, active: true }));
const todayInputValue = () => new Date().toISOString().slice(0, 10);
type FinanceTab = 'history' | 'expiring' | 'settings';

export default function FinanceManager({ initialTab = 'history' }: { initialTab?: 'history' | 'expiring' }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(defaultPlans);
  const [expiringUsers, setExpiringUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<FinanceTab>(initialTab);
  const [planForm, setPlanForm] = useState({ id: '', name: '', months: 1, price: 0 });
  const [formData, setFormData] = useState({
    userEmail: '',
    amount: defaultPlans[0].price,
    concept: defaultPlans[0].name,
    months: defaultPlans[0].months,
    planId: defaultPlans[0].id,
    paymentMethod: 'cash' as PaymentMethod,
    paymentDate: todayInputValue(),
    notes: '',
  });

  const selectedPlan = useMemo(
    () => paymentPlans.find(plan => plan.id === formData.planId),
    [formData.planId, paymentPlans]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await loadFinanceDashboardData(financeService);
      setPayments(data.payments);
      setPaymentPlans(data.paymentPlans);
      setExpiringUsers(data.expiringUsers);
      Object.values(data.errors).forEach(error => {
        if (error) console.error(error);
      });
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

  const applySelectedPlan = (planId: string) => {
    const plan = paymentPlans.find(item => item.id === planId);
    if (!plan) return;

    setFormData(prev => ({
      ...prev,
      planId,
      amount: plan.price,
      concept: plan.name,
      months: plan.months,
    }));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = planForm.id.trim() || planForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await financeService.upsertPaymentPlan({
        id,
        name: planForm.name.trim(),
        months: Number(planForm.months),
        price: Number(planForm.price),
      });
      setPlanForm({ id: '', name: '', months: 1, price: 0 });
      await fetchData();
      alert('Plan guardado.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el plan');
    } finally {
      setLoading(false);
    }
  };

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

      const paymentDate = new Date(`${formData.paymentDate}T12:00:00`);
      const currentExpiration = userProfile.membershipValidUntil?.toDate?.() ?? null;
      const validUntil = calculateMembershipRenewalDate({
        currentExpiration,
        paymentDate,
        monthsPaid: formData.months,
      });

      await financeService.recordPayment({
        userId: formData.userEmail,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        planId: formData.planId,
        concept: formData.concept,
        monthsPaid: formData.months,
        paymentDate: Timestamp.fromDate(paymentDate),
        renewalBaseDate: currentExpiration ? Timestamp.fromDate(currentExpiration) : Timestamp.fromDate(paymentDate),
        validUntil: Timestamp.fromDate(validUntil),
        status: 'confirmed',
        notes: formData.notes.trim(),
      });

      const resetPlan = paymentPlans[0] ?? defaultPlans[0];
      setIsRecording(false);
      setFormData({
        userEmail: '',
        amount: resetPlan.price,
        concept: resetPlan.name,
        months: resetPlan.months,
        planId: resetPlan.id,
        paymentMethod: 'cash',
        paymentDate: todayInputValue(),
        notes: '',
      });
      await fetchData();
      alert('Pago registrado y membresia extendida.');
    } catch (err) {
      console.error(err);
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  const plansSettings = (
    <div className="bg-surface-container-low p-6 rounded-lg ghost-border">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h3 className="font-headline font-bold text-xl uppercase tracking-tight italic">Configuracion de Cuotas y Planes</h3>
          <p className="mt-2 font-body text-sm text-tertiary">Edita el precio de la cuota y arma packs de meses con descuento.</p>
        </div>
        <button
          type="button"
          onClick={() => setPlanForm({ id: '', name: '', months: 1, price: 0 })}
          className="self-start md:self-auto bg-surface-container-highest px-4 py-3 rounded font-label text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
        >
          Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paymentPlans.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setPlanForm({ id: plan.id, name: plan.name, months: plan.months, price: plan.price })}
              className="text-left bg-surface-container-high p-5 rounded-lg border border-outline-variant/10 hover:border-primary transition-colors"
            >
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">{plan.months} meses</p>
              <p className="mt-2 font-headline font-bold uppercase tracking-tight text-lg">{plan.name}</p>
              <p className="mt-3 font-mono font-black text-2xl text-primary">${plan.price.toLocaleString()}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSavePlan} className="bg-surface-container-high p-5 rounded-lg border border-outline-variant/10 space-y-3">
          <h4 className="font-label text-[10px] font-black uppercase tracking-widest text-tertiary">
            {planForm.id ? 'Editar plan' : 'Crear plan'}
          </h4>
          <input
            required
            placeholder="Nombre del plan"
            value={planForm.name}
            onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
            className="w-full bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min="1"
              placeholder="Meses"
              value={planForm.months}
              onChange={e => setPlanForm({ ...planForm, months: Number(e.target.value) })}
              className="bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Precio"
              value={planForm.price}
              onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
              className="bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 rounded font-label text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            Guardar Plan
          </button>
        </form>
      </div>
    </div>
  );

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
            Vencimientos Proximos
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'settings' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            Configuracion de Cuotas y Planes
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="bg-surface-container-low p-6 md:p-8 rounded-lg ghost-border">
            <div className="mb-6">
              <h3 className="font-headline font-bold text-xl uppercase tracking-tight italic">Registrar Nueva Transaccion</h3>
              {selectedPlan && (
                <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-tertiary">
                  {selectedPlan.name}: {selectedPlan.months} mes(es), ${selectedPlan.price.toLocaleString()}
                </p>
              )}
            </div>
            <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                required
                type="email"
                placeholder="Email del Socio"
                value={formData.userEmail}
                onChange={e => setFormData({ ...formData, userEmail: e.target.value.toLowerCase() })}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <input
                required
                type="date"
                value={formData.paymentDate}
                onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <select
                value={formData.planId}
                onChange={e => applySelectedPlan(e.target.value)}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
              >
                {paymentPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.months}m - ${plan.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                required
                type="number"
                placeholder="Monto ($)"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Meses que renueva"
                value={formData.months}
                onChange={e => setFormData({ ...formData, months: Number(e.target.value) })}
                className="bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
              />
              <input
                required
                placeholder="Concepto"
                value={formData.concept}
                onChange={e => setFormData({ ...formData, concept: e.target.value })}
                className="md:col-span-2 bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
              />
              <textarea
                placeholder="Observaciones"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="md:col-span-2 bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm min-h-24 resize-none"
              />
              <div className="md:col-span-2 flex justify-end">
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

          <div className="hidden xl:block">
            {plansSettings}
          </div>
        </div>
      )}

      {activeTab === 'settings' ? (
        plansSettings
      ) : activeTab === 'history' ? (
        <div className="bg-surface-container-low rounded-lg overflow-x-auto ghost-border">
          <table className="w-full min-w-[920px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Fecha</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Concepto</th>
                <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Metodo</th>
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
                  <td className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">
                    {p.paymentMethod ? PAYMENT_METHOD_LABELS[p.paymentMethod as PaymentMethod] : '-'}
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
                      {diff < 0 ? `Vencido hace ${Math.abs(diff)} dias` : `Vence en ${diff} dias`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsRecording(true);
                    setFormData({ ...formData, userEmail: user.email });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full mt-6 py-3 bg-surface-container-highest hover:bg-primary hover:text-white transition-all font-label text-[9px] font-bold uppercase tracking-widest rounded"
                >
                  Registrar Renovacion
                </button>
              </div>
            );
          })}
          {expiringUsers.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center opacity-30">
              <span className="material-symbols-outlined text-4xl mb-4">event_available</span>
              <p className="font-label uppercase tracking-widest text-xs">No hay vencimientos proximos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
