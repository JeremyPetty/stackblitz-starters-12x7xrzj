'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckInSchema, type CheckInData } from '@/lib/validation';
import { GAS_PUBLIC_URL } from '@/lib/config';

type Kind = 'new' | 'existing' | 'walkin';

const tabs: { key: Kind; label: string }[] = [
  { key: 'new', label: 'New Patients' },
  { key: 'existing', label: 'Patients' },
  { key: 'walkin', label: 'Walk-Ins' },
];

/** Fire-and-forget POST to Google Apps Script using a hidden iframe + form (avoids CSP/CORB). */
function postToGasViaIframe(url: string, data: Record<string, string>) {
  return new Promise<void>((resolve) => {
    let sink = document.getElementById('gas-sink') as HTMLIFrameElement | null;
    if (!sink) {
      sink = document.createElement('iframe');
      sink.name = 'gas-sink';
      sink.id = 'gas-sink';
      sink.style.display = 'none';
      document.body.appendChild(sink);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.target = 'gas-sink';
    form.style.display = 'none';

    const add = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    Object.entries(data).forEach(([k, v]) => add(k, v ?? ''));
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    resolve();
  });
}

export default function CheckInForm() {
  const searchParams = useSearchParams();

  const [kind, setKind] = useState<Kind>('new');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Preselect tab from ?kind=
  useEffect(() => {
    const k = (searchParams.get('kind') || '').toLowerCase();
    if (k === 'existing' || k === 'walkin' || k === 'new') setKind(k as Kind);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload: CheckInData = {
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
      // ✅ Type the fieldErrors map before iterating to satisfy TS
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as Partial<Record<keyof CheckInData, string[]>>;

      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs[0]) formatted[key] = msgs[0];
      }

      setErrors(formatted);
      setStatus('idle');
      return;
    }

    // 1) Try server route first (best for production/Vercel)
    let sent = false;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      sent = res.ok;
    } catch {
      sent = false;
    }

    // 2) Final fallback (StackBlitz-safe): hidden iframe form POST to Apps Script
    if (!sent) {
      try {
        await postToGasViaIframe(GAS_PUBLIC_URL, {
          kind: parsed.data.kind,
          name: parsed.data.name,
          phone: parsed.data.phone,
          apptTime: parsed.data.apptTime,
          notes: parsed.data.notes || '',
        });
        sent = true;
      } catch {
        sent = false;
      }
    }

    if (sent) {
      setStatus('success');
      formRef.current?.reset();
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
              (kind === t.key
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')
            }
            aria-pressed={kind === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="space-y-4" autoComplete="off">
        {/* Honeypot (hidden) */}
        <input type="text" name="company" className="hidden" tabIndex={-1} aria-hidden="true" />

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            placeholder="(555) 123-4567"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="apptTime">Appointment Time</label>
          <input
            id="apptTime"
            type="datetime-local"
            name="apptTime"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          {errors.apptTime && <p className="mt-1 text-sm text-red-600">{errors.apptTime}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>

          {status === 'success' && (
            <p className="mt-3 text-center text-sm text-green-700">
              Thanks! You’re checked in. We’ll be right with you.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-center text-sm text-red-700">
              Something went wrong. Please try again or tell the front desk.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
