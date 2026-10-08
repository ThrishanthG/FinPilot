'use client';

import './globals.css';
import Providers from '../components/Providers';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useUserStore();

  useEffect(() => {
    // Sync class list for dark/light transitions
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <html lang="en" className={theme}>
      <head>
        <title>FinPilot | Educational Wealth Guidance</title>
        <meta 
          name="description" 
          content="AI-assisted financial literacy and investment simulation platform. Build your risk category profile and learn how to grow portfolio assets." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#070b0a] text-white transition-colors duration-300">
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Providers>

      </body>
    </html>
  );
}
