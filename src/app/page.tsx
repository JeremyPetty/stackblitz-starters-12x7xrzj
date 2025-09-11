import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-office.jpg"   // ensure this file exists in /public
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Center card */}
      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center p-6 md:p-10 text-center">
        <div className="rounded-3xl bg-white/50 p-8 md:p-14 shadow-2xl ring-1 ring-black/5 backdrop-blur-lg">
          {/* Logo */}
          <div className="mx-auto mb-7 h-44 w-44 md:h-60 md:w-60 lg:h-72 lg:w-72">
            <Image
              src="/logo.png"
              alt="The Ark DPC"
              width={640}
              height={640}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            The Ark Direct Primary Care
          </h1>
          <p className="mt-3 text-neutral-700 md:text-lg">
            Welcome! Choose what you’re here for.
          </p>

          {/* Buttons: stacked in portrait, inline in landscape */}
          <div
            className="
              mt-10 grid grid-cols-1 gap-4
              [@media(orientation:landscape)]:grid-cols-3
            "
          >
            <Link href="/checkin?reason=scheduled"
              className="rounded-2xl bg-black/90 px-7 py-5 md:py-6 text-lg md:text-xl font-semibold text-white shadow-sm transition
                         hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/50">
              Scheduled Appointment
            </Link>
            <Link href="/checkin?reason=general"
              className="rounded-2xl bg-black/90 px-7 py-5 md:py-6 text-lg md:text-xl font-semibold text-white shadow-sm transition
                         hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/50">
              General Question
            </Link>
            <Link href="/checkin?reason=membership"
              className="rounded-2xl bg-black/90 px-7 py-5 md:py-6 text-lg md:text-xl font-semibold text-white shadow-sm transition
                         hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/50">
              Question on Membership
            </Link>
            <Link href="/checkin?reason=pharma"
              className="rounded-2xl bg-black/90 px-7 py-5 md:py-6 text-lg md:text-xl font-semibold text-white shadow-sm transition
                         hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/50">
              Pharmaceutical Rep
            </Link>
            <Link href="/checkin?reason=other"
              className="rounded-2xl bg-black/90 px-7 py-5 md:py-6 text-lg md:text-xl font-semibold text-white shadow-sm transition
                         hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/50">
              Other
            </Link>
          </div>

          <p className="mt-8 text-xs md:text-sm text-neutral-600">
            Est. 2025 • Privacy-first check-in
          </p>
        </div>
      </div>
    </main>
  );
}
