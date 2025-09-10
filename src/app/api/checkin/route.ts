// src/app/api/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CheckInSchema } from '@/lib/validation';

// Avoid any caching of this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const GAS_URL = process.env.APPS_SCRIPT_URL;
    if (!GAS_URL) {
      return NextResponse.json(
        { ok: false, error: 'Missing APPS_SCRIPT_URL in .env.local' },
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

    // Honeypot: if bots fill this, pretend success without calling GAS
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

    // Handle GAS response (could be text or JSON)
    const text = await resp.text();
    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, error: 'GAS error', details: text },
        { status: 502 }
      );
    }

    try {
      const jsonOut = JSON.parse(text);
      if (jsonOut && jsonOut.ok === false) {
        return NextResponse.json(
          { ok: false, error: 'GAS returned failure', details: jsonOut },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, result: jsonOut });
    } catch {
      // Non-JSON but OK — treat as success
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
