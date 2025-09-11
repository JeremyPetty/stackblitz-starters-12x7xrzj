import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Background (keep as-is if you already set an image) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-100 to-neutral-50" />
        <div className="absolute inset-0 opacity-5 [background:radial-gradient(40rem_40rem_at_120%_-10%,black,transparent)]" />
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center p-6 md:p-10 text-center">
        <div className="rounded-3xl bg-white/60 md:bg-white/70 p-8 md:p-12 shadow-xl ring-1 ring-black/5 backdrop-blur-md md:backdrop-blur-lg">
          {/* Logo */}
          <div className="mx-auto mb-6 h-40 w-40 md:h-56 md:w-56">
            <Image
              src="/logo.png"
              alt="The Ark DPC"
              width={512}
              height={512}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            The Ark Direct Primary Care
          </h1>
          <p className="mt-2 text-neutral-600">Welcome! Choose how you’d like to check in.</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/checkin?kind=new" className="rounded-xl bg-black px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black">
              New Patients
            </Link>
            <Link href="/checkin?kind=existing" className="rounded-xl bg-black px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black">
              Patients
            </Link>
            <Link href="/checkin?kind=walkin" className="rounded-xl bg-black px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black">
              Walk-Ins
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-500">Est. 2025 • Privacy-first check-in</p>
        </div>
      </div>
    </main>
  );
}
