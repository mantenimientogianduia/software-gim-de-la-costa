'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  buildPaymentsCsv,
  buildContactLinks,
  calculateCashflowSummary,
  calculateMemberFinanceSummaries,
  calculateMembershipRenewalDate,
  DEFAULT_PAYMENT_PLANS,
  financeService,
  loadFinanceDashboardData,
  MemberFinanceSummary,
  Payment,
  PaymentMethod,
  PaymentPlan
} from '@/services/finance.service';
import { userService, UserProfile } from '@/services/user.service';
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
type FinanceTab = 'overview' | 'history' | 'expiring' | 'delinquent' | 'communications' | 'settings';
type FinanceFilter = 'all' | 'moroso' | 'por_vencer' | 'activo' | 'sin_pagos';

export default function FinanceManager({ initialTab = 'history' }: { initialTab?: 'history' | 'expiring' }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(defaultPlans);
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<FinanceTab>(initialTab === 'history' ? 'overview' : initialTab);
  const [financeFilter, setFinanceFilter] = useState<FinanceFilter>('all');
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

  const memberSummaries = useMemo(
    () => calculateMemberFinanceSummaries({ users, payments }),
    [users, payments]
  );

  const financeKpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const confirmedPayments = payments.filter(payment => payment.status === 'confirmed');
    const monthlyPayments = confirmedPayments.filter(payment => {
      const date = payment.paymentDate?.toDate?.();
      return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    return {
      delinquent: memberSummaries.filter(member => member.financeStatus === 'moroso').length,
      expiring: memberSummaries.filter(member => member.financeStatus === 'por_vencer').length,
      active: memberSummaries.filter(member => member.financeStatus === 'activo').length,
      noPayments: memberSummaries.filter(member => !member.hasPayments).length,
      monthRevenue: monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      monthPayments: monthlyPayments.length,
      operationalDebt: memberSummaries.filter(member => member.financeStatus === 'moroso').length * (paymentPlans[0]?.price ?? 0),
    };
  }, [memberSummaries, payments, paymentPlans]);

  const cashflowSummary = useMemo(() => calculateCashflowSummary(payments), [payments]);

  const filteredMembers = useMemo(() => {
    return memberSummaries.filter(member => {
      if (financeFilter === 'all') return true;
      if (financeFilter === 'sin_pagos') return !member.hasPayments;
      return member.financeStatus === financeFilter;
    });
  }, [financeFilter, memberSummaries]);

  const paymentUserOptions = useMemo(() => {
    return [...users]
      .filter(user => user.role === 'socio')
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [users]);

  const selectedPaymentMember = useMemo(() => {
    return memberSummaries.find(member => member.email === formData.userEmail);
  }, [formData.userEmail, memberSummaries]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, allUsers] = await Promise.all([
        loadFinanceDashboardData(financeService),
        userService.getAllUsers() as Promise<(UserProfile & { id: string })[]>,
      ]);
      setPayments(data.payments);
      setPaymentPlans(data.paymentPlans);
      setUsers(allUsers);
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
    setActiveTab(initialTab === 'history' ? 'overview' : initialTab);
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

  const handleCancelPayment = async (payment: Payment) => {
    if (!payment.id || payment.status === 'cancelled') return;
    const reason = window.prompt(`Motivo para anular el pago de ${payment.userName}`);
    if (!reason?.trim()) return;

    setLoading(true);
    try {
      await financeService.cancelPayment(payment.id, payment.userId, reason.trim(), 'admin');
      await fetchData();
      alert('Pago anulado y vencimiento recalculado.');
    } catch (err) {
      console.error(err);
      alert('Error al anular el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayments = () => {
    const csv = buildPaymentsCsv(payments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pagos-gym-costa-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openPaymentRecorder = (email = '') => {
    setIsRecording(true);
    setFormData(prev => ({ ...prev, userEmail: email }));
  };

  const plansSettings = (
    <div className="bg-surface-container-low p-4 sm:p-6 rounded-lg ghost-border">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-xl sm:text-2xl uppercase tracking-tight italic leading-tight">
            Configuracion de Cuotas y Planes
          </h3>
          <p className="mt-2 max-w-xl font-body text-sm text-tertiary">
            Edita el precio de la cuota y arma packs de meses con descuento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPlanForm({ id: '', name: '', months: 1, price: 0 })}
          className="w-full sm:w-auto bg-surface-container-highest px-5 py-3 rounded font-label text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
        >
          Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="font-label text-[10px] font-black uppercase tracking-widest text-tertiary">Planes activos</h4>
            <span className="rounded-full bg-surface-container-highest px-3 py-1 font-mono text-[10px] text-tertiary">
              {paymentPlans.length}
            </span>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentPlans.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setPlanForm({ id: plan.id, name: plan.name, months: plan.months, price: plan.price })}
              className={`min-h-[150px] text-left bg-surface-container-high p-5 rounded-lg border transition-colors ${
                planForm.id === plan.id
                  ? 'border-primary shadow-[0_0_0_1px_rgba(255,171,145,0.35)]'
                  : 'border-outline-variant/10 hover:border-primary/70'
              }`}
            >
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">{plan.months} meses</p>
              <p className="mt-2 font-headline font-bold uppercase tracking-tight text-lg leading-tight">{plan.name}</p>
              <p className="mt-3 font-mono font-black text-2xl text-primary">${plan.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
        </div>

        <form onSubmit={handleSavePlan} className="min-w-0 bg-surface-container-high p-4 sm:p-5 rounded-lg border border-outline-variant/10 space-y-4 xl:sticky xl:top-4">
          <div className="border-b border-outline-variant/10 pb-4">
            <h4 className="font-label text-[10px] font-black uppercase tracking-widest text-tertiary">
              {planForm.id ? 'Editar plan' : 'Crear plan'}
            </h4>
            <p className="mt-2 font-body text-xs text-tertiary">
              Selecciona un plan para editarlo o crea uno nuevo desde cero.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Nombre</span>
            <input
              required
              placeholder="Nombre del plan"
              value={planForm.name}
              onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
              className="w-full bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Meses</span>
            <input
              required
              type="number"
              min="1"
              placeholder="Meses"
              value={planForm.months}
              onChange={e => setPlanForm({ ...planForm, months: Number(e.target.value) })}
              className="w-full bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
            />
            </label>
            <label className="block">
              <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Precio</span>
            <input
              required
              type="number"
              min="0"
              placeholder="Precio"
              value={planForm.price}
              onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
              className="w-full bg-surface-container-low p-3 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
            />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded font-label text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
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
        <div className="flex flex-wrap bg-surface-container-high p-1 rounded-sm gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'overview' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            Panel PRO
          </button>
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
            onClick={() => setActiveTab('delinquent')}
            className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'delinquent' ? 'bg-error text-white font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            Morosos
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'communications' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            Comunicaciones
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${activeTab === 'settings' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
          >
            Configuracion de Cuotas y Planes
          </button>
        </div>
        <button
          onClick={() => openPaymentRecorder()}
          className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-sm shadow-glow hover:scale-105 transition-all"
        >
          Registrar Pago
        </button>
      </div>

      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-6 sm:px-6 sm:py-10">
          <div className="w-full max-w-4xl rounded-xl border border-outline-variant/20 bg-surface-container-low shadow-2xl">
            <div className="sticky top-0 z-10 flex flex-col gap-4 rounded-t-xl border-b border-outline-variant/10 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h3 className="font-headline font-bold text-xl uppercase tracking-tight italic">Registrar Nueva Transaccion</h3>
                {selectedPlan && (
                  <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-tertiary">
                    {selectedPlan.name}: {selectedPlan.months} mes(es), ${selectedPlan.price.toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="rounded-sm border border-outline-variant/20 bg-surface-container-highest px-5 py-3 font-label text-[10px] font-black uppercase tracking-widest text-tertiary transition-colors hover:border-primary hover:text-primary"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Socio</span>
                <select
                  required
                  value={formData.userEmail}
                  onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
                >
                  <option value="">Seleccionar socio...</option>
                  {paymentUserOptions.map(user => (
                    <option key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} - DNI {user.dni || 'sin DNI'} - {user.email}
                    </option>
                  ))}
                </select>
                {selectedPaymentMember && (
                  <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-tertiary">
                    Estado actual: {statusLabel(selectedPaymentMember.financeStatus)} - Vence: {selectedPaymentMember.membershipValidUntil ? selectedPaymentMember.membershipValidUntil.toLocaleDateString() : 'Sin fecha'}
                  </p>
                )}
              </label>

              <label>
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Fecha de pago</span>
                <input
                  required
                  type="date"
                  value={formData.paymentDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
                />
              </label>

              <label>
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Plan</span>
                <select
                  value={formData.planId}
                  onChange={e => applySelectedPlan(e.target.value)}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
                >
                  {paymentPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.months}m - ${plan.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Metodo</span>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-label text-[10px] uppercase tracking-widest"
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Monto</span>
                <input
                  required
                  type="number"
                  placeholder="Monto ($)"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
                />
              </label>

              <label>
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Meses que renueva</span>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Meses que renueva"
                  value={formData.months}
                  onChange={e => setFormData({ ...formData, months: Number(e.target.value) })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-mono text-sm"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Concepto</span>
                <input
                  required
                  placeholder="Concepto"
                  value={formData.concept}
                  onChange={e => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block font-label text-[9px] font-black uppercase tracking-widest text-tertiary">Observaciones</span>
                <textarea
                  placeholder="Observaciones"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-high p-4 rounded outline-none border-b-2 border-transparent focus:border-primary font-body text-sm min-h-24 resize-none"
                />
              </label>

              <div className="md:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="rounded-sm border border-outline-variant/20 px-8 py-4 font-label text-[10px] font-black uppercase tracking-[0.2em] text-tertiary transition-colors hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-primary text-on-primary px-12 py-4 rounded-sm font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && plansSettings}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            <KpiCard label="Morosos" value={financeKpis.delinquent} tone="error" />
            <KpiCard label="Sin pagos" value={financeKpis.noPayments} tone="warning" />
            <KpiCard label="Vencen esta semana" value={financeKpis.expiring} tone="warning" />
            <KpiCard label="Activos" value={financeKpis.active} tone="success" />
            <KpiCard label="Pagos del mes" value={financeKpis.monthPayments} />
            <KpiCard label="Ingresos del mes" value={`$${financeKpis.monthRevenue.toLocaleString()}`} />
          </div>
          <CashflowPanel summary={cashflowSummary} />
          <MemberFinanceTable
            members={filteredMembers}
            filter={financeFilter}
            onFilterChange={setFinanceFilter}
            onRecordPayment={(email) => {
              openPaymentRecorder(email);
            }}
          />
        </div>
      )}
      {activeTab === 'delinquent' && (
        <MemberFinanceCards
          members={memberSummaries.filter(member => member.financeStatus === 'moroso')}
          emptyText="No hay socios morosos"
          onRecordPayment={(email) => {
            openPaymentRecorder(email);
          }}
        />
      )}
      {activeTab === 'expiring' && (
        <MemberFinanceCards
          members={memberSummaries.filter(member => member.financeStatus === 'por_vencer')}
          emptyText="No hay vencimientos proximos"
          onRecordPayment={(email) => {
            openPaymentRecorder(email);
          }}
        />
      )}
      {activeTab === 'communications' && (
        <CommunicationsQueue members={memberSummaries.filter(member => member.financeStatus !== 'activo')} />
      )}
      {activeTab === 'history' && (
        <PaymentsHistory payments={payments} onCancelPayment={handleCancelPayment} onExportPayments={handleExportPayments} />
      )}
    </div>
  );
}

function KpiCard({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'error' | 'warning' | 'success' }) {
  const toneClass = tone === 'error'
    ? 'text-error border-error/30 bg-error/10'
    : tone === 'warning'
      ? 'text-primary border-primary/30 bg-primary/10'
      : tone === 'success'
        ? 'text-green-400 border-green-400/30 bg-green-400/10'
        : 'text-on-surface border-outline-variant/10 bg-surface-container-low';

  return (
    <div className={`p-4 rounded-xl border ${toneClass}`}>
      <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">{label}</p>
      <p className="font-headline text-2xl font-black">{value}</p>
    </div>
  );
}

function CashflowPanel({ summary }: { summary: ReturnType<typeof calculateCashflowSummary> }) {
  const activeMethods = Object.values(summary.byMethod).filter(item => item.count > 0);

  return (
    <section className="bg-surface-container-low rounded-lg ghost-border overflow-hidden">
      <div className="p-5 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h3 className="font-headline text-xl font-black uppercase tracking-tight italic">Caja y Metodos de Pago</h3>
          <p className="mt-1 text-sm text-tertiary">Solo cuenta pagos confirmados; los anulados quedan fuera del total y se informan aparte.</p>
        </div>
        <div className="font-label text-[10px] uppercase tracking-widest text-tertiary">
          {summary.confirmedPaymentsCount} pagos confirmados - {summary.cancelledPaymentsCount} anulados
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0">
        <div className="p-6 border-b md:border-b-0 md:border-r border-outline-variant/10">
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Ingreso total confirmado</p>
          <p className="mt-3 font-headline text-4xl font-black text-primary">${summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {activeMethods.length > 0 ? activeMethods.map(item => (
            <div key={item.method} className="bg-surface-container-high p-4 rounded border border-outline-variant/10">
              <p className="font-label text-[9px] uppercase tracking-widest text-tertiary">{PAYMENT_METHOD_LABELS[item.method]}</p>
              <p className="mt-2 font-mono text-xl font-black">${item.total.toLocaleString()}</p>
              <p className="mt-1 text-[10px] text-tertiary">{item.count} pago(s)</p>
            </div>
          )) : (
            <div className="col-span-full py-10 text-center text-tertiary font-label text-[10px] uppercase tracking-widest">
              Sin ingresos confirmados
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function statusLabel(status: MemberFinanceSummary['financeStatus']) {
  if (status === 'moroso') return 'Moroso';
  if (status === 'por_vencer') return 'Por vencer';
  return 'Activo';
}

function statusClass(status: MemberFinanceSummary['financeStatus']) {
  if (status === 'moroso') return 'bg-error/15 text-error border-error/30';
  if (status === 'por_vencer') return 'bg-primary/15 text-primary border-primary/30';
  return 'bg-green-500/15 text-green-400 border-green-500/30';
}

function MemberFinanceTable({
  members,
  filter,
  onFilterChange,
  onRecordPayment,
}: {
  members: MemberFinanceSummary[];
  filter: FinanceFilter;
  onFilterChange: (filter: FinanceFilter) => void;
  onRecordPayment: (email: string) => void;
}) {
  const filters: Array<{ id: FinanceFilter; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'moroso', label: 'Morosos' },
    { id: 'por_vencer', label: 'Por vencer' },
    { id: 'activo', label: 'Activos' },
    { id: 'sin_pagos', label: 'Sin pagos' },
  ];

  return (
    <div className="bg-surface-container-low rounded-lg ghost-border overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 border-b border-outline-variant/10">
        {filters.map(item => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`px-4 py-2 rounded font-label text-[10px] uppercase tracking-widest ${filter === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Estado</th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Vence</th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Ultimo pago</th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Antiguedad</th>
              <th className="p-5 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Total</th>
              <th className="p-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-surface-container-high/40">
                <td className="p-5 font-body font-bold uppercase text-sm">
                  {member.firstName} {member.lastName}
                  <p className="text-[10px] lowercase opacity-50 font-normal">{member.email}</p>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full border font-label text-[9px] uppercase tracking-widest ${statusClass(member.financeStatus)}`}>
                    {statusLabel(member.financeStatus)}
                  </span>
                </td>
                <td className="p-5 font-mono text-xs">
                  {member.membershipValidUntil ? member.membershipValidUntil.toLocaleDateString() : 'Sin fecha'}
                  <p className="text-[10px] text-tertiary">{member.daysFromDue === null ? 'Sin datos' : member.daysFromDue < 0 ? `${Math.abs(member.daysFromDue)} dias vencido` : `${member.daysFromDue} dias`}</p>
                </td>
                <td className="p-5 font-mono text-xs">{member.lastPaymentDate ? member.lastPaymentDate.toLocaleDateString() : 'Sin pagos'}</td>
                <td className="p-5 font-mono text-xs">{member.memberAgeDays === null ? '-' : `${member.memberAgeDays} dias`}</td>
                <td className="p-5 font-mono text-xs font-bold">${member.totalPaid.toLocaleString()}</td>
                <td className="p-5 text-right">
                  <button onClick={() => onRecordPayment(member.email)} className="px-4 py-2 rounded bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-black">
                    Registrar pago
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {members.length === 0 && (
        <div className="py-20 text-center opacity-40">
          <span className="material-symbols-outlined text-4xl mb-3">search_off</span>
          <p className="font-label uppercase tracking-widest text-xs">Sin resultados</p>
        </div>
      )}
    </div>
  );
}

function MemberFinanceCards({ members, emptyText, onRecordPayment }: { members: MemberFinanceSummary[]; emptyText: string; onRecordPayment: (email: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {members.map(member => (
        <div key={member.id} className={`p-6 rounded-xl ghost-border ${member.financeStatus === 'moroso' ? 'bg-error/10 border-error/40' : 'bg-surface-container-low'}`}>
          <div className="flex justify-between gap-3 mb-4">
            <h4 className="font-headline font-bold text-lg uppercase tracking-tight">{member.firstName} {member.lastName}</h4>
            <span className={`h-fit px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${statusClass(member.financeStatus)}`}>{statusLabel(member.financeStatus)}</span>
          </div>
          <div className="space-y-2 font-label text-[10px] uppercase tracking-widest text-tertiary">
            <p>Vence: <span className="text-on-surface font-mono">{member.membershipValidUntil ? member.membershipValidUntil.toLocaleDateString() : 'Sin fecha'}</span></p>
            <p>Ultimo pago: <span className="text-on-surface font-mono">{member.lastPaymentDate ? member.lastPaymentDate.toLocaleDateString() : 'Sin pagos'}</span></p>
            <p>Total pagado: <span className="text-on-surface font-mono">${member.totalPaid.toLocaleString()}</span></p>
          </div>
          <button onClick={() => onRecordPayment(member.email)} className="w-full mt-5 py-3 bg-surface-container-highest hover:bg-primary hover:text-on-primary rounded font-label text-[9px] font-black uppercase tracking-widest transition-all">
            Registrar pago
          </button>
        </div>
      ))}
      {members.length === 0 && (
        <div className="col-span-full py-24 text-center opacity-30">
          <span className="material-symbols-outlined text-4xl mb-4">event_available</span>
          <p className="font-label uppercase tracking-widest text-xs">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

function CommunicationsQueue({ members }: { members: MemberFinanceSummary[] }) {
  return (
    <div className="bg-surface-container-low rounded-lg ghost-border overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10">
        <h3 className="font-headline text-xl font-black uppercase tracking-tight italic">Bandeja manual de comunicaciones</h3>
        <p className="mt-2 text-sm text-tertiary">Abre WhatsApp o mail con texto prearmado. No envia nada automatico.</p>
      </div>
      <div className="divide-y divide-outline-variant/10">
        {members.map(member => {
          const links = buildContactLinks(member);
          return (
            <div key={member.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-body font-bold uppercase">{member.firstName} {member.lastName}</h4>
                  <span className={`px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${statusClass(member.financeStatus)}`}>{statusLabel(member.financeStatus)}</span>
                </div>
                <p className="text-xs text-tertiary mt-1">{links.message}</p>
              </div>
              <div className="flex gap-2">
                {links.whatsapp ? (
                  <a href={links.whatsapp} target="_blank" rel="noreferrer" className="px-4 py-3 rounded bg-green-600 text-white font-label text-[9px] uppercase tracking-widest font-black">WhatsApp</a>
                ) : (
                  <button disabled className="px-4 py-3 rounded bg-surface-container-highest text-tertiary/50 font-label text-[9px] uppercase tracking-widest">Sin telefono</button>
                )}
                {links.email && (
                  <a href={links.email} className="px-4 py-3 rounded bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-black">Email</a>
                )}
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <div className="py-24 text-center opacity-30">
            <span className="material-symbols-outlined text-4xl mb-4">mark_email_read</span>
            <p className="font-label uppercase tracking-widest text-xs">No hay socios para contactar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentsHistory({
  payments,
  onCancelPayment,
  onExportPayments,
}: {
  payments: Payment[];
  onCancelPayment: (payment: Payment) => void;
  onExportPayments: () => void;
}) {
  return (
    <div className="bg-surface-container-low rounded-lg overflow-hidden ghost-border">
      <div className="p-5 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-headline text-xl font-black uppercase tracking-tight italic">Historial de Pagos</h3>
          <p className="mt-1 text-sm text-tertiary">Incluye pagos confirmados y anulados para auditoria.</p>
        </div>
        <button
          type="button"
          onClick={onExportPayments}
          disabled={payments.length === 0}
          className="bg-surface-container-highest px-4 py-3 rounded font-label text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary disabled:opacity-40 disabled:hover:bg-surface-container-highest disabled:hover:text-current transition-all"
        >
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Fecha</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Socio</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Concepto</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Estado</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Metodo</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Monto</th>
            <th className="p-6 font-label text-[10px] uppercase tracking-[0.2em] text-tertiary">Vence</th>
            <th className="p-6"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {payments.map(payment => (
            <tr key={payment.id} className={`hover:bg-surface-container-high/50 transition-colors ${payment.status === 'cancelled' ? 'opacity-60' : ''}`}>
              <td className="p-6 font-mono text-[11px] text-tertiary">{payment.paymentDate?.toDate ? payment.paymentDate.toDate().toLocaleDateString() : 'Pendiente'}</td>
              <td className="p-6 font-body font-bold text-sm uppercase tracking-tight">
                {payment.userName}
                <p className="text-[10px] opacity-50 lowercase italic font-normal">{payment.userId}</p>
              </td>
              <td className="p-6 font-label text-[10px] uppercase tracking-widest text-primary font-bold">{payment.concept} ({payment.monthsPaid}m)</td>
              <td className="p-6">
                <span className={`px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${payment.status === 'cancelled' ? 'bg-error/10 text-error border-error/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                  {payment.status === 'cancelled' ? 'Anulado' : 'Confirmado'}
                </span>
                {payment.cancelReason && <p className="mt-1 text-[10px] text-tertiary">{payment.cancelReason}</p>}
              </td>
              <td className="p-6 font-label text-[10px] uppercase tracking-widest text-tertiary">{payment.paymentMethod ? PAYMENT_METHOD_LABELS[payment.paymentMethod as PaymentMethod] : '-'}</td>
              <td className="p-6 font-mono text-sm font-bold text-on-surface">${payment.amount.toLocaleString()}</td>
              <td className="p-6"><span className="font-mono text-[11px] bg-surface-container-highest px-3 py-1 rounded">{payment.validUntil?.toDate ? payment.validUntil.toDate().toLocaleDateString() : '-'}</span></td>
              <td className="p-6 text-right">
                {payment.status !== 'cancelled' && (
                  <button onClick={() => onCancelPayment(payment)} className="px-4 py-2 rounded bg-error/10 text-error hover:bg-error hover:text-white font-label text-[9px] uppercase tracking-widest font-black transition-all">
                    Anular
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && (
        <div className="py-24 text-center opacity-30">
          <span className="material-symbols-outlined text-4xl mb-4">payments</span>
          <p className="font-label uppercase tracking-widest text-xs">No hay historial de pagos</p>
        </div>
      )}
      </div>
    </div>
  );
}
