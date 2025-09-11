import Image from 'next/image';
import CheckInForm from '@/components/UI/CheckInForm';

export default function Page() {
  return (
    <main id="main" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg.png"   // ← put your image at /public/bg.png
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
      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full rounded-3xl bg-white/50 p-6 md:p-10 shadow-2xl ring-1 ring-black/5 backdrop-blur-lg">
          {/* Accessible page heading (visible) */}
          <h1 className="mb-6 text-center text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
            Clinic Check-In
          </h1>
          <CheckInForm />
        </div>
      </div>
    </main>
  );
}
