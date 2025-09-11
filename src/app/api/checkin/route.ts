import { NextRequest, NextResponse } from 'next/server';
import { CheckInSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Use env var on Vercel; you can keep a fallback if you like.
const GAS_FALLBACK = process.env.APPS_SCRIPT_URL || '';

export async function POST(req: NextRequest) {
  try {
    const GAS_URL = process.env.APPS_SCRIPT_URL || GAS_FALLBACK;
    if (!GAS_URL) {
      return NextResponse.json(
        { ok: false, error: 'Missing APPS_SCRIPT_URL' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = CheckInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const d = parsed.data;

    // Honeypot: if bots fill this, act like success
    if ((d.company ?? '').trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const resp = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: d.kind,
        reason: d.reason,
        name: d.name,
        phone: d.phone,
        otherReason: d.otherReason || '',
        productName: d.productName || '',
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: 'GAS error', details: text }, { status: 502 });
    }

    // GAS may return JSON or text
    try {
      const out = JSON.parse(text);
      if (out?.ok === false) {
        return NextResponse.json({ ok: false, error: 'GAS returned failure', details: out }, { status: 502 });
      }
      return NextResponse.json({ ok: true, result: out });
    } catch {
      return NextResponse.json({ ok: true, result: text });
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'Unexpected error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
