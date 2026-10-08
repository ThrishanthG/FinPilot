import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeNest | Launch Your Coding Career',
  description:
    'Master in-demand coding skills with industry professionals. Career-ready curriculum, hands-on projects, and real mentorship.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#070b0a] text-white antialiased">{children}</body>
    </html>
  );
}
