'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckInSchema, type CheckInData, ReasonEnum, type Reason } from '@/lib/validation';
import { GAS_PUBLIC_URL } from '@/lib/config';

// map machine value -> nice label
const reasonLabel: Record<Reason, string> = {
  scheduled: 'Scheduled Appointment',
  general: 'General Question',
  membership: 'Question on Membership',
  pharma: 'Pharmaceutical Representative',
  other: 'Other',
};

// Hidden iframe fallback for StackBlitz dev; on Vercel your API route should work.
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

  // We no longer show "kind" toggles; default to walk-in
  const [kind] = useState<'new' | 'existing' | 'walkin'>('walkin');

  // reason comes from ?reason=
  const [reason, setReason] = useState<Reason>('scheduled');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const r = (searchParams.get('reason') || '').toLowerCase();
    if (ReasonEnum.options.includes(r as Reason)) setReason(r as Reason);
    else setReason('scheduled');
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
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as Partial<Record<keyof CheckInData, string[]>>;
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs[0]) formatted[key] = msgs[0];
      }
      setErrors(formatted);
      setStatus('idle');
      return;
    }

    // 1) Server route first (Vercel)
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

    // 2) Dev fallback
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
      setTimeout(() => router.push('/'), 600);
    } else {
      setStatus('error');
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-black/5">
      {/* Reason summary + change link (good for orientation) */}
      <div className="mb-6">
        <p className="text-sm md:text-base text-neutral-700">
          You’re checking in for: <span className="font-semibold">{reasonLabel[reason]}</span>
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-1 text-sm underline text-neutral-700 hover:text-neutral-900"
        >
          Not this? Choose a different reason
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="space-y-4"
        autoComplete="off"
        aria-describedby="form-help"
      >
        {/* Hidden SR-only helper for context */}
        <p id="form-help" className="sr-only">
          All fields are required unless marked optional. Error messages are announced below each field.
        </p>

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
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'error-name' : undefined}
            required
          />
          {errors.name && (
            <p id="error-name" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

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
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'error-phone' : undefined}
            required
          />
          {errors.phone && (
            <p id="error-phone" className="mt-1 text-sm text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
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
              aria-invalid={Boolean(errors.otherReason)}
              aria-describedby={errors.otherReason ? 'error-otherReason' : undefined}
              placeholder="Tell us briefly why you’re here"
            />
            {errors.otherReason && (
              <p id="error-otherReason" className="mt-1 text-sm text-red-600" role="alert">
                {errors.otherReason}
              </p>
            )}
          </div>
        )}

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
              aria-invalid={Boolean(errors.productName)}
              aria-describedby={errors.productName ? 'error-productName' : undefined}
              placeholder="e.g., Amoxicillin 500mg"
            />
            {errors.productName && (
              <p id="error-productName" className="mt-1 text-sm text-red-600" role="alert">
                {errors.productName}
              </p>
            )}
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

          {/* Live regions for screen readers */}
          {status === 'success' && (
            <p className="mt-3 text-center text-sm text-green-700" role="status" aria-live="polite">
              Thanks! You’re checked in.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-center text-sm text-red-700" role="status" aria-live="polite">
              Something went wrong. Please try again or tell the front desk.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
