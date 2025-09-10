'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckInSchema } from '@/lib/validation';

type Kind = 'new' | 'existing' | 'walkin';
const tabs: { key: Kind; label: string }[] = [
  { key: 'new', label: 'New Patients' },
  { key: 'existing', label: 'Patients' },
  { key: 'walkin', label: 'Walk-Ins' },
];

export default function CheckInForm() {
  const searchParams = useSearchParams();
  const [kind, setKind] = useState<Kind>('new');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const k = (searchParams.get('kind') || '').toLowerCase();
    if (k === 'existing' || k === 'walkin' || k === 'new') setKind(k as Kind);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      kind,
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      apptTime: String(fd.get('apptTime') || '').trim(),
      notes: String(fd.get('notes') || ''),
      company: String(fd.get('company') || ''), // honeypot
    };

    const parsed = CheckInSchema.safeParse(payload);
    if (!parsed.success) {
      const formatted: Record<string, string> = {};
      const f = parsed.error.flatten().fieldErrors;
      for (const k in f) if (f[k]?.[0]) formatted[k] = f[k]![0] as string;
      setErrors(formatted);
      setStatus('idle');
      return;
    }

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    if (res.ok) {
      setStatus('success');
      (e.currentTarget as HTMLFormElement).reset();
    } else {
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setKind(t.key)}
            className={
              'rounded-xl px-4 py-2 text-sm font-medium ' +
              (kind === t.key ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')
            }
            aria-pressed={kind === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
        {/* Honeypot */}
        <input type="text" name="company" className="hidden" tabIndex={-1} aria-hidden="true" />

        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input name="name" className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" required />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" inputMode="tel" placeholder="(555) 123-4567" className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" required />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Appointment Time</label>
          <input type="datetime-local" name="apptTime" className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" required />
          {errors.apptTime && <p className="mt-1 text-sm text-red-600">{errors.apptTime}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
          <textarea name="notes" rows={3} className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting…" : "Submit"}
          </button>
          {status === "success" && (
            <p className="mt-3 text-center text-sm text-green-700">Thanks! You’re checked in. We’ll be right with you.</p>
          )}
          {status === "error" && (
            <p className="mt-3 text-center text-sm text-red-700">Something went wrong. Please try again or tell the front desk.</p>
          )}
        </div>
      </form>
    </div>
  );
}
