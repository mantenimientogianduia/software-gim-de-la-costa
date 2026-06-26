'use client';
import { useEffect, useRef, useState } from 'react';
import { financeService, Payment, PaymentPlan } from '@/services/finance.service';

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'EN REVISIÓN',  cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'CONFIRMADO',   cls: 'bg-green-500/15 text-green-400 border-green-500/30'   },
  rejected:  { label: 'RECHAZADO',    cls: 'bg-error/15 text-error border-error/30'                },
  cancelled: { label: 'ANULADO',      cls: 'bg-surface-container-highest text-tertiary border-outline-variant/20' },
};

export default function SocioPayments({ userId, userName }: { userId: string; userName: string }) {
  const [plans, setPlans]       = useState<PaymentPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [sending, setSending]   = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoadingData(true);
    try {
      const [p, pay] = await Promise.all([
        financeService.getPaymentPlans(),
        financeService.getUserPayments(userId),
      ]);
      setPlans(p);
      setPayments(pay);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected || !file) return;
    const plan = plans.find(p => p.id === selected);
    if (!plan) return;

    setSending(true);
    setError(null);
    try {
      await financeService.submitPayment({
        userId,
        userName,
        planId: plan.id,
        planName: plan.name,
        months: plan.months,
        amount: plan.price,
        receiptFile: file,
      });
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setSelected(null);
      if (inputRef.current) inputRef.current.value = '';
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Error al enviar el comprobante. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Zona A — Cargar pago */}
      <section className="bg-surface-container-low rounded-lg ghost-border overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-2xl uppercase tracking-tight italic">Cargar Comprobante</h2>
          <p className="mt-1 text-sm text-tertiary">Elegí tu plan, subí la foto del comprobante y envialo. El admin lo revisa y activa tu cuota.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Selección de combo */}
          <div>
            <p className="font-label text-[10px] font-black uppercase tracking-widest text-tertiary mb-4">Elegí tu plan</p>
            {loadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map(i => <div key={i} className="h-28 rounded-lg bg-surface-container-high animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map(plan => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => { setSelected(plan.id); setSuccess(false); setError(null); }}
                    className={`text-left p-5 rounded-lg border transition-all ${
                      selected === plan.id
                        ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,171,145,0.3)]'
                        : 'border-outline-variant/15 bg-surface-container-high hover:border-primary/60'
                    }`}
                  >
                    <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">{plan.months} {plan.months === 1 ? 'mes' : 'meses'}</p>
                    <p className="mt-1 font-headline font-bold text-lg uppercase tracking-tight">{plan.name}</p>
                    <p className="mt-2 font-mono font-black text-2xl text-primary">${plan.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload comprobante */}
          <div>
            <p className="font-label text-[10px] font-black uppercase tracking-widest text-tertiary mb-3">Foto del comprobante</p>
            <div
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center gap-3 hover:border-primary/60 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Comprobante" className="max-h-52 rounded object-contain" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-tertiary">upload_file</span>
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Tocá para seleccionar imagen</p>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {file && (
              <p className="mt-2 font-label text-[9px] text-tertiary uppercase tracking-widest">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
            )}
          </div>

          {/* Feedback */}
          {error   && <p className="text-error text-sm font-label uppercase tracking-widest">{error}</p>}
          {success && (
            <div className="flex items-center gap-3 text-green-400 font-label text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined">check_circle</span>
              Comprobante enviado. El admin lo revisará pronto.
            </div>
          )}

          <button
            type="button"
            disabled={!selected || !file || sending}
            onClick={handleSubmit}
            className="w-full bg-gradient-primary text-on-primary py-4 rounded-sm font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {sending ? 'Enviando...' : 'Enviar Comprobante'}
          </button>
        </div>
      </section>

      {/* Zona B — Historial */}
      <section className="bg-surface-container-low rounded-lg ghost-border overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-2xl uppercase tracking-tight italic">Mis Pagos</h2>
        </div>

        {loadingData ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map(i => <div key={i} className="h-16 rounded bg-surface-container-high animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <span className="material-symbols-outlined text-4xl mb-3">payments</span>
            <p className="font-label uppercase tracking-widest text-xs">Sin historial de pagos</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {payments.map(payment => {
              const chip = STATUS_CHIP[payment.status] ?? STATUS_CHIP.pending;
              const date = payment.createdAt?.toDate?.() ?? payment.paymentDate?.toDate?.();
              return (
                <div key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-body font-bold uppercase text-sm">{payment.concept}</p>
                      <span className={`px-3 py-1 rounded-full border font-label text-[8px] uppercase tracking-widest ${chip.cls}`}>
                        {chip.label}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap">
                      <p className="font-mono text-xs text-tertiary">${payment.amount.toLocaleString()}</p>
                      {date && <p className="font-mono text-xs text-tertiary">{date.toLocaleDateString()}</p>}
                      {payment.status === 'confirmed' && payment.validUntil?.toDate && (
                        <p className="font-mono text-xs text-green-400">Válido hasta: {payment.validUntil.toDate().toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  {payment.receiptBase64 && (
                    <a
                      href={payment.receiptBase64}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 px-4 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest font-label text-[9px] uppercase tracking-widest transition-colors"
                    >
                      Ver comprobante
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
