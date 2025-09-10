export const metadata = { title: 'The Ark — Check-In' };

// ✅ Import Tailwind here (App Router expects global CSS import in layout)
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
