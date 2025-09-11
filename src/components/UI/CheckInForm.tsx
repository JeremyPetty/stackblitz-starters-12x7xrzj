'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckInSchema, type CheckInData, ReasonEnum } from '@/lib/validation';
import { GAS_PUBLIC_URL } from '@/lib/config';

type Kind = 'new' | 'existing' | 'walkin';
type Reason = typeof ReasonEnum['_type'];

const tabs: { key: Kind; label: string }[] = [
  { key: 'new', label: 'New Patients' },
  { key: 'existing', label: 'Patients' },
  { key: 'walkin', label: 'Walk-Ins' },
];

/** Fire-and-forget POST to Google Apps Script using a hidden iframe + form (avoids CSP/CORB during dev). */
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
  const router = useRouter();

  const [kind, setKind] = useState<Kind>('new');
  const [reason, setReason] = useState<Reason>('scheduled');
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
      reason,
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      otherReason: String(fd.get('otherReason') || ''),
      productName: String(fd.get('productName') || ''),
      company: String(fd.get('company') || ''), // honeypot
    };

    const parsed = CheckInSchema.safeParse(payload);
    if (!parsed.success) {
      const formatted: Record<string, string> = {};
      const fieldErrors = parsed.error
        .flatten().fieldErrors as Partial<Record<keyof CheckInData, string[]>>;
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs[0]) formatted[key] = msgs[0];
      }
      setErrors(formatted);
      setStatus('idle');
      return;
    }

    // 1) Try server route first (best for Vercel production)
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

    // 2) Fallback (useful during StackBlitz dev): hidden iframe form POST to Apps Script
    if (!sent) {
      try {
        await postToGasViaIframe(GAS_PUBLIC_URL, {
          kind: parsed.data.kind,
          reason: parsed.data.reason,
          name: parsed.data.name,
          phone: parsed.data.phone,
          otherReason: parsed.data.otherReason || '',
          productName: parsed.data.productName || '',
        });
        sent = true;
      } catch {
        sent = false;
      }
    }

    if (sent) {
      formRef.current?.reset();
      setStatus('success');
      setTimeout(() => router.push('/'), 600); // quick success then return home
    } else {
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-black/5">
      {/* Larger, tappable tab buttons (iPad) */}
      <div className="mb-6 flex flex-wrap gap-2 md:gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setKind(t.key)}
            className={
              'rounded-xl px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base font-medium ' +
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

        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 md:py-3.5 text-base
                       focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Reason select */}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="reason">
            Please Select What You Are Here For
          </label>
          <select
            id="reason"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as Reason)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 md:py-3.5 text-base bg-white
                       focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="scheduled">Scheduled Appointment</option>
            <option value="general">General Question</option>
            <option value="membership">Question on Membership</option>
            <option value="pharma">Pharmaceutical Representative</option>
            <option value="other">Other</option>
          </select>
          {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
        </div>

        {/* Conditional: Other (fill in) */}
        {reason === 'other' && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="otherReason">
              Please describe (Other)
            </label>
            <input
              id="otherReason"
              name="otherReason"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base
                         focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Tell us briefly why you’re here"
            />
            {errors.otherReason && <p className="mt-1 text-sm text-red-600">{errors.otherReason}</p>}
          </div>
        )}

        {/* Phone */}
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            placeholder="(555) 123-4567"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 md:py-3.5 text-base
                       focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Conditional: Pharma product name */}
        {reason === 'pharma' && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="productName">
              Pharmaceutical Representatives Only — Product You Are Representing
            </label>
            <input
              id="productName"
              name="productName"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base
                         focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Amoxicillin 500mg"
            />
            {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName}</p>}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-2xl bg-black px-5 py-3.5 md:py-4 text-base font-semibold text-white
                       hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>

          {status === 'success' && (
            <p className="mt-3 text-center text-sm text-green-700">
              Thanks! You’re checked in.
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
