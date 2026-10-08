'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'PROJECTS', href: '#projects' },
  { label: 'BLOG', href: '#blog' },
  { label: 'ABOUT', href: '#about' },
  { label: 'RESUME', href: '#resume' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#070b0a]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5ed29c] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-[#070b0a] font-inter font-black text-sm">C</span>
            </div>
            <span className="text-white font-inter font-bold text-xl tracking-tight">
              CodeNest
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="link-underline font-inter font-medium text-[13px] tracking-[0.12em] text-white/70 hover:text-[#5ed29c] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#enroll"
              className="btn-shine ml-2 px-5 py-2.5 rounded-full bg-[#5ed29c] text-[#070b0a] font-inter font-bold text-[12px] uppercase tracking-wide hover:bg-[#4ab885] transition-all duration-300 hover:shadow-[0_0_20px_rgba(94,210,156,0.4)]"
            >
              Get Started
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-[#5ed29c] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#070b0a]/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-inter font-bold text-[28px] text-white/70 hover:text-[#5ed29c] transition-colors duration-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#enroll"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-4 rounded-full bg-[#5ed29c] text-[#070b0a] font-inter font-bold text-[14px] uppercase tracking-wide hover:bg-[#4ab885] transition-all duration-300"
          >
            Get Started
          </a>
        </div>
      )}
    </>
  );
}
