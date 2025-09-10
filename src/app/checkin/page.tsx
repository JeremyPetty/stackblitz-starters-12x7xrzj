import CheckInForm from 'src/components/UI/CheckInForm.tsx';
import { Suspense } from 'react';

function Content() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Clinic Check-In</h1>
        <p className="text-neutral-600">Choose your type and submit your info.</p>
      </header>
      <CheckInForm />
    </main>
  );
}

export default function CheckInPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
