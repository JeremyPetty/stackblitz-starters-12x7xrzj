import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg.png"     // ← put your file in /public/bg-office.jpg
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Center card */}
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

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            The Ark Direct Primary Care
          </h1>
          <p className="mt-2 text-neutral-50 md:text-neutral-100">
            Welcome! Choose how you’d like to check in.
          </p>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/checkin?kind=new"
              className="rounded-xl bg-black/90 px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              New Patients
            </Link>
            <Link
              href="/checkin?kind=existing"
              className="rounded-xl bg-black/90 px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Patients
            </Link>
            <Link
              href="/checkin?kind=walkin"
              className="rounded-xl bg-black/90 px-6 py-4 md:py-5 text-base font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Walk-Ins
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-100/90">
            Est. 2025 • Privacy-first check-in
          </p>
        </div>
      </div>
    </main>
  );
}
