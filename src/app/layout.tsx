// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // ← if your CSS is in styles/, change to '../styles/globals.css'

export const metadata: Metadata = {
  title: 'The Ark — Check-In',
  description: 'Fast, accessible patient check-in for The Ark Direct Primary Care.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className="
          min-h-[100svh] bg-neutral-50 text-neutral-900 antialiased
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
          pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
        "
      >
        {/* Accessibility: keyboard/AT users can skip repetitive nav to main content */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only fixed top-3 left-3 z-50 rounded bg-black px-3 py-2 text-white"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
