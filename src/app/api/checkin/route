// src/app/api/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CheckInSchema } from '@/lib/validation';

// Avoid caching for this route
export const dynamic = 'force-dynamic';

// 👇 Use your real /exec URL here as a fallback.
// If APPS_SCRIPT_URL exists in .env.local, that will be used instead.
const GAS_FALLBACK = 'https://script.google.com/macros/s/AKfycbx6f7yMhvod9qkixvsCp9xOzVVxtBhJLHQIZhGHh7bSOqrN0dzrn-oMC_dB7MAT-e7YRg/exec';

export async function POST(req: NextRequest) {
  try {
    const GAS_URL = process.env.APPS_SCRIPT_URL || GAS_FALLBACK;
    if (!GAS_URL) {
      return NextResponse.json(
        { ok: false, error: 'No Apps Script URL configured (APPS_SCRIPT_URL or GAS_FALLBACK).' },
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
    const data = parsed.data;

    // Honeypot: if filled, act like success without calling GAS
    if ((data.company ?? '').trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    // Forward to your Apps Script Web App
    const resp = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: data.kind,
        name: data.name,
        phone: data.phone,
        apptTime: data.apptTime,
        notes: data.notes ?? '',
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: 'GAS error', details: text }, { status: 502 });
    }

    // GAS might return text or JSON
    try {
      const json = JSON.parse(text);
      if (json?.ok === false) {
        return NextResponse.json({ ok: false, error: 'GAS returned failure', details: json }, { status: 502 });
      }
      return NextResponse.json({ ok: true, result: json });
    } catch {
      return NextResponse.json({ ok: true, result: text });
    }
  } catch (err: any) {
    console.error('API /api/checkin error:', err);
    return NextResponse.json(
      { ok: false, error: 'Unexpected error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
