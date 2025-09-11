import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* Background image with overlay */}
<div className="absolute inset-0 -z-10">
  <div
    className="h-full w-full bg-cover bg-center"
    style={{ backgroundImage: "url('/bg.png')" }} // 👈 update filename if needed
  />
  <div className="absolute inset-0 bg-black/30" /> {/* dark overlay */}
</div>

      {/* Center card */}
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-6 text-center">
        <div className="rounded-3xl bg-white/60 p-10 shadow-xl ring-1 ring-black/5 backdrop-blur">
          {/* Logo */}
          <div className="mx-auto mb-6 h-28 w-28">
            <Image
              src="/logo.png"
              alt="The Ark DPC"
              width={512}
              height={512}
              className="h-full w-full object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight">
            The Ark Direct Primary Care
          </h1>
          <p className="mt-2 text-neutral-600">
            Welcome! Choose how you’d like to check in.
          </p>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/checkin?kind=new"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              New Patients
            </Link>
            <Link
              href="/checkin?kind=existing"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Patients
            </Link>
            <Link
              href="/checkin?kind=walkin"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Walk-Ins
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            Est. 2025 • Privacy-first check-in
          </p>
        </div>
      </div>
    </main>
  );
}
