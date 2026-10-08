'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useUserStore } from '../store/userStore';
import { apiFetch, WS_URL } from '../lib/api';
import {
  TrendingUp, ShieldAlert, Compass, Calculator, BookOpen,
  ChevronRight, ArrowUpRight, ArrowDownRight, Menu, X,
  Users, Award, CheckCircle, Star, Zap, RefreshCw,
  Mail, Phone, MapPin, Github, Twitter, Linkedin
} from 'lucide-react';

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const NAV_LINKS = [
  { label: 'FEATURES', href: '#features' },
  { label: 'PLATFORMS', href: '#platforms' },
  { label: 'LEARN', href: '#learn-more' },
  { label: 'FAQ', href: '#faq' },
];

const TICKER_UPDATE_INTERVAL = 1200;

export default function LandingPage() {
  const { user } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [tickers, setTickers] = useState<Ticker[]>([]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const id = href.replace('#', '');
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -80;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const platforms = [
    { name: 'Zerodha',   sebi: 'INZ000031633', features: 'Flat ₹20 discount brokerage, Kite terminal, Console logs.', pros: 'Best-in-class charting UI, no spam, highly reliable infrastructure.', cons: 'No direct advisory support, account opening charge (₹200).' },
    { name: 'Groww',     sebi: 'INZ000301838', features: 'Zero maintenance fees, simple mutual fund integrations.', pros: 'Highly intuitive layout for beginners, instant paperless onboarding.', cons: 'Slightly basic charting utilities for sophisticated day traders.' },
    { name: 'Upstox',    sebi: 'INZ000185137', features: 'Advanced options analytics tools, Pro-Mode interface.', pros: 'Fast order executions, free account opening packages often active.', cons: 'Mobile application interface can feel cluttered with notifications.' },
    { name: 'Angel One', sebi: 'INZ000161534', features: 'Integrated robo-advisory tools, extensive sub-broker networks.', pros: 'Offers direct research calls, robust offline support branches.', cons: 'In-app marketing banners can distract from trading panels.' },
  ];

  const features = [
    { icon: Compass,   color: '#5ed29c', title: 'AI Asset Suggestions',        desc: 'Receive customized, mathematical model portfolio splits matching your aggressive or conservative goals. Plain english, no jargon.' },
    { icon: Calculator,color: '#5ed29c', title: 'Budget & Investable Calc',    desc: 'Plug in salaries, savings ratios, liabilities, and debt to calculate transparently how much capital can be invested monthly.' },
    { icon: BookOpen,  color: '#5ed29c', title: 'Modular Learning Center',     desc: 'Access guided courses on large caps, mutual fund compounding, SIP logic, tax hedging, and diversification theory.' },
    { icon: Zap,       color: '#5ed29c', title: 'Live Market Data',            desc: 'Real-time index feeds across NIFTY, SENSEX, NASDAQ, S&P 500 so you always know where the market stands.' },
    { icon: RefreshCw, color: '#5ed29c', title: 'Risk Assessment Engine',      desc: 'Answer a structured onboarding questionnaire and receive a personalized risk score that shapes your asset model.' },
    { icon: Award,     color: '#5ed29c', title: 'SEBI Compliant Framework',    desc: 'Every output is framed as educational illustration only. We follow disclosure standards so you stay protected.' },
  ];

  const stats = [
    { icon: Users,        value: '12,000+', label: 'Active Users' },
    { icon: Star,         value: '4.8',     label: 'Average Rating' },
    { icon: Award,        value: '100%',    label: 'SEBI Compliant' },
    { icon: CheckCircle,  value: '95%',     label: 'Satisfaction Rate' },
  ];

  // Scroll & Active Section Tracker
  useEffect(() => {
    let ticking = false;

    const fn = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setScrolled(scrollY > 20);

        // Compute reading scroll progress bar percentage
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)) : 0;
        setScrollProgress(progress);

        // Detect section currently in view
        const sectionIds = ['features', 'platforms', 'learn-more', 'faq'];
        let current = '';
        for (const id of sectionIds) {
          const elem = document.getElementById(id);
          if (elem) {
            const rect = elem.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 120) {
              current = id;
              break;
            }
          }
        }
        setActiveSection(current);

        ticking = false;
      });
    };

    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Fetch initial tickers from backend, then stream live updates via WebSocket
  useEffect(() => {
    apiFetch('/market-data/tickers')
      .then(body => setTickers(body.tickers))
      .catch(() => {
        setTickers([
          { symbol: '^NSEI',  name: 'NIFTY 50', price: 22450.80, change: 125.40,  changePercent: 0.56 },
          { symbol: '^BSESN', name: 'SENSEX',   price: 73910.50, change: 410.20,  changePercent: 0.56 },
          { symbol: '^IXIC',  name: 'NASDAQ',   price: 16180.45, change: 185.30,  changePercent: 1.16 },
        ]);
      });

    let lastUpdate = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let latestData: Ticker[] | null = null;

    const flushTickers = () => {
      if (!latestData) return;
      lastUpdate = Date.now();
      setTickers(latestData);
      latestData = null;
      timeoutId = null;
    };

    const socket = io(WS_URL, {
      transports: ['websocket'],
      upgrade: false,
    });

    socket.on('market-tick', (data: Ticker[]) => {
      latestData = data;
      const elapsed = Date.now() - lastUpdate;
      if (elapsed >= TICKER_UPDATE_INTERVAL) {
        flushTickers();
        return;
      }
      if (!timeoutId) {
        timeoutId = setTimeout(flushTickers, TICKER_UPDATE_INTERVAL - elapsed);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, []);

  // HLS Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
    if (prefersReducedMotion || isSmallScreen) return;

    const src = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
    let hlsInstance: { destroy: () => void } | null = null;
    const init = () => {
      const W = window as any;
      if (W.Hls?.isSupported()) {
        const hls = new W.Hls({
          enableWorker: true,
          capLevelToPlayerSize: true,
          startLevel: 0,
          maxBufferLength: 12,
          backBufferLength: 0,
        });
        hlsInstance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(W.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src; video.play().catch(() => {});
      }
    };
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js';
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);

    return () => {
      hlsInstance?.destroy();
      video.pause();
      video.removeAttribute('src');
      video.load();
      s.remove();
    };
  }, []);

  const tickerTape = useMemo(() => [...tickers, ...tickers], [tickers]);

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: '#070b0a', color: '#fff' }}>

      {/* ── NAVBAR ──────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md"
        style={{
          background: scrolled ? 'rgba(7, 11, 10, 0.95)' : 'rgba(7, 11, 10, 0.85)',
          borderBottom: scrolled ? '1px solid rgba(94, 210, 156, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.8)' : '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18" style={{ height: 72 }}>
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ background: '#5ed29c' }}>
              <TrendingUp className="h-4 w-4" style={{ color: '#070b0a' }} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              FinPilot
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => {
              const targetId = l.href.replace('#', '');
              const isActive = activeSection === targetId;
              return (
                <a key={l.label} href={l.href} onClick={(e) => scrollToSection(e, l.href)}
                  className="relative py-2 font-bold text-xs tracking-widest transition-all duration-300 flex flex-col items-center group"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: isActive ? '#5ed29c' : 'rgba(255,255,255,0.7)',
                    letterSpacing: '0.12em',
                    textShadow: isActive ? '0 0 12px rgba(94, 210, 156, 0.4)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = '#5ed29c';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  <span>{l.label}</span>
                  {/* Glowing Underline Indicator */}
                  <span
                    className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '100%' : '0%',
                      background: '#5ed29c',
                      boxShadow: '0 0 8px #5ed29c',
                    }}
                  />
                </a>
              );
            })}

            <Link href="/auth?tab=register"
              className="btn-shine px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-300 hover:scale-105"
              style={{ background: '#5ed29c', color: '#070b0a', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4ab885'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(94,210,156,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5ed29c'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              Get Started
            </Link>
          </nav>

          {/* Hamburger */}
          <button className="md:hidden p-2 transition-colors" style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Scroll progress bar at bottom edge of fixed header */}
        <div className="w-full h-[2px] bg-white/5 overflow-hidden">
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, #5ed29c 0%, #34d399 100%)',
              boxShadow: '0 0 10px #5ed29c',
            }}
          />
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: 'rgba(7,11,10,0.98)' }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={(e) => scrollToSection(e, l.href)}
              className="font-bold text-3xl transition-colors duration-300"
              style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#5ed29c')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >{l.label}</a>
          ))}
          <Link href="/auth?tab=register" onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide"
            style={{ background: '#5ed29c', color: '#070b0a', fontFamily: 'Inter, sans-serif' }}>
            Get Started
          </Link>
        </div>
      )}

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Video background — isolated on its own GPU layer */}
        <video ref={videoRef} muted loop playsInline preload="metadata"
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          style={{ opacity: 0.55, transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
        {/* Overlays — static, no animation, promoted once */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #070b0a 0%, rgba(7,11,10,0.85) 35%, transparent 65%)', transform: 'translateZ(0)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #070b0a 0%, rgba(7,11,10,0.6) 30%, transparent 60%)', transform: 'translateZ(0)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px" style={{ left: `${p}%`, background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
        {/* Glow — blur is static; only opacity animates (compositor-thread only) */}
        <div className="absolute pointer-events-none hero-glow" style={{
          top: '10%', left: '50%', transform: 'translateX(-50%) translateZ(0)',
          width: 600, height: 280,
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between gap-16 w-full"
          style={{ paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 580 }}>
            {/* Eyebrow */}
            <div className="animate-fade-up delay-100 inline-flex items-center gap-2 mb-6">
              <div style={{ width: 4, height: 16, background: '#5ed29c', borderRadius: 2 }} />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c' }}>
                AI-Powered Financial Guidance
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-200"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 'clamp(38px, 6vw, 68px)', lineHeight: 0.92, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: 24 }}>
              INVEST<br />SMARTER<br />
              <span style={{ color: '#5ed29c' }}>WITH AI.</span>
            </h1>

            {/* Description */}
            <p className="animate-fade-up delay-300"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
              Assess your risk tolerance, build personalized asset models, and master investment theory. No black boxes — completely transparent, SEBI-compliant guidance.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-400 flex flex-wrap items-center gap-4" style={{ marginBottom: 32 }}>
              <Link href="/auth?tab=register"
                className="btn-shine inline-flex items-center gap-3 rounded-full font-bold uppercase tracking-wide"
                style={{ background: '#5ed29c', color: '#070b0a', padding: '14px 32px', fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, background 0.2s ease' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#4ab885'; el.style.boxShadow = '0 0 28px rgba(94,210,156,0.38)'; el.style.transform = 'scale(1.04) translateZ(0)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#5ed29c'; el.style.boxShadow = 'none'; el.style.transform = 'scale(1) translateZ(0)'; }}
              >
                Start Free Assessment
                <ChevronRight size={18} strokeWidth={2.5} />
              </Link>

            </div>

            {/* SEBI disclaimer */}
            <div className="animate-fade-up delay-500 flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.15)', maxWidth: 480 }}>
              <ShieldAlert size={16} style={{ color: 'rgba(255,200,100,0.8)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,200,100,0.75)', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: 'rgba(255,200,100,0.95)' }}>SEBI Advisory:</strong> Model suggestions are based on mathematical algorithms, not regulated advice. Investments are subject to market risks.
              </p>
            </div>
          </div>

          {/* Liquid Glass Card */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-3 animate-float animate-fade-up delay-500"
            style={{ width: 200, height: 200, flexShrink: 0 }}
          >
            <div className="liquid-glass w-full h-full flex flex-col items-center justify-center text-center gap-2 px-5">
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                [ SEBI ] [ 2025 ]
              </div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', lineHeight: 1.4 }}>
                Guided by{' '}
                <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#5ed29c', fontSize: 16 }}>
                  Financial
                </span>{' '}
                Intelligence
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Transparent. Compliant. Empowering.
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute pointer-events-none flex flex-col items-center gap-2"
          style={{ bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 24, height: 40, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 4, height: 8, background: '#5ed29c', borderRadius: 2, animation: 'bounce-dot 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER BAR ─────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: '10px 0' }}>
        <div className="animate-ticker flex items-center gap-12 whitespace-nowrap" style={{ width: 'max-content' }}>
          {tickerTape.map((t, i) => (
            <div key={`${t.symbol}-${i}`} className="flex items-center gap-2" style={{ fontSize: 13 }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>{t.name}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}>
                {t.name.includes('INR') ? '' : ''}
                {t.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="flex items-center font-bold" style={{ fontSize: 11, color: t.change >= 0 ? '#5ed29c' : '#f87171', fontFamily: 'Inter, sans-serif' }}>
                {t.change >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                {t.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </span>
              <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block', marginLeft: 8 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────── */}
      <section id="features" className="py-16 md:py-20 px-6" style={{ background: '#070b0a' }}>
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-divider mb-12" />
          <div className="text-center mb-16">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', display: 'block', marginBottom: 16 }}>
              WHY FINPILOT
            </span>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 }}>
              Features Engineered for{' '}
              <span style={{ color: '#5ed29c' }}>Wealth Building</span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
              Everything a beginner or intermediate investor needs to develop clear long-term growth roadmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                className="glass-card-hover p-8 relative overflow-hidden group" 
                style={{ background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: 'rgba(94,210,156,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(94,210,156,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(94,210,156,0.1)')}
                >
                  <f.icon size={22} style={{ color: '#5ed29c' }} />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12, transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#5ed29c')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >{f.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{f.desc}</p>
                <div className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none transition-opacity duration-500"
                  style={{ background: 'radial-gradient(350px circle at 50% 0%, rgba(94,210,156,0.06), transparent 60%)' }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────────── */}
      <div className="section-divider" />
      <section className="py-12 md:py-16 px-6" style={{ background: '#070b0a' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div 
              key={i} 
              className="glass-card-hover p-8 text-center" 
              style={{ background: 'rgba(255,255,255,0.02)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(94,210,156,0.1)' }}>
                <s.icon size={24} style={{ color: '#5ed29c' }} />
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3vw,36px)', marginBottom: 4, color: '#fff' }}>{s.value}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ───────────────────────────── */}
      <section id="platforms" className="py-16 md:py-20 px-6" style={{ background: '#070b0a' }}>
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-divider mb-12" />
          <div className="text-center mb-16">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', display: 'block', marginBottom: 16 }}>
              INVESTMENT PLATFORMS
            </span>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
              Navigating Popular{' '}
              <span style={{ color: '#5ed29c' }}>Brokerages</span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
              Informational profiles of SEBI-registered brokerages to help you pick the right tool for trade execution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((p, i) => (
              <motion.div 
                key={i} 
                className="glass-card-hover p-8 lg:p-10 relative overflow-hidden" 
                style={{ background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span style={{ position: 'absolute', top: 20, right: 24, fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 80, color: 'rgba(255,255,255,0.02)', lineHeight: 1, userSelect: 'none' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-start justify-between mb-4">
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22, color: '#5ed29c' }}>{p.name}</h3>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                    SEBI: {p.sebi}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.7 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Key Utility: </span>{p.features}
                </p>
                <div className="space-y-2">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#5ed29c' }}><strong>Pros:</strong> {p.pros}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#f87171' }}><strong>Cons:</strong> {p.cons}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 560, margin: '32px auto 0' }}>
            💡 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Platform Disclosures:</strong> FinPilot is not affiliated with, sponsored by, or partner to any platform listed above. Information is compiled solely for educational comparison.
          </div>
        </motion.div>
      </section>

      {/* ── LEARN ───────────────────────────────── */}
      <section id="learn-more" className="py-16 md:py-20 px-6" style={{ background: '#070b0a' }}>
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-divider mb-12" />
          <div className="text-center mb-16">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', display: 'block', marginBottom: 16 }}>
              FINANCIAL BASICS
            </span>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Mastering Financial{' '}
              <span style={{ color: '#5ed29c' }}>Planning Basics</span>
            </h2>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <motion.div 
              className="flex flex-col md:flex-row items-center gap-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex-1">
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c' }}>STEP 1: EMERGENCY BUFFERS</span>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 16 }}>Create your safety net first</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                  Before allocating a single rupee to the stock markets, financial logic dictates building an emergency reserve worth 6 to 9 months of active household expenditures. Keep this buffer in high-liquidity fixed deposits or short-term treasury funds.
                </p>
              </div>
              <div className="flex-1 glass-card-hover p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Emergency Reserve Rule</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 36, color: '#5ed29c' }}>₹1,50,000</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Typical buffer for ₹25,000/month expenditure</div>
              </div>
            </motion.div>

            <div className="section-divider" />

            {/* Step 2 */}
            <motion.div 
              className="flex flex-col md:flex-row-reverse items-center gap-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex-1">
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c' }}>STEP 2: DIVERSIFICATION</span>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22, marginTop: 8, marginBottom: 16 }}>Never concentrate your capital</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                  Diversification mitigates single-entity risks. By spreading wealth across domestic equities, government bonds, and inflation hedges like gold, you ensure one stock drop doesn't collapse your portfolio.
                </p>
              </div>
              <div className="flex-1 glass-card-hover p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="space-y-4">
                  {[
                    { label: 'Mutual Funds (Large Cap)', pct: 50, color: '#5ed29c' },
                    { label: 'Government Bonds', pct: 30, color: '#60a5fa' },
                    { label: 'Gold ETFs / Fixed Deposits', pct: 20, color: '#fbbf24' },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between mb-1.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{r.pct}%</span>
                      </div>
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: 6, borderRadius: 3 }}>
                        <div style={{ width: `${r.pct}%`, background: r.color, height: 6, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-20 px-6" style={{ background: '#070b0a' }}>
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-divider mb-12" />
          <div className="text-center mb-16">
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', display: 'block', marginBottom: 16 }}>
              SUPPORT
            </span>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Frequently Asked{' '}
              <span style={{ color: '#5ed29c' }}>Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is the asset suggestion personal financial advice?', a: 'No. Suggestions generated by our ML profiles are illustrative allocation benchmarks built on standard mathematical templates. They do not constitute regulated advisory and should be cross-verified with a SEBI-registered Investment Adviser before committing capital.' },
              { q: 'Can I connect my brokerage account directly?', a: 'To guarantee user data security and follow strict regulatory compliance, we do not link active brokerage accounts or process trade execution orders. You log investment amounts manually to track assets safely.' },
              { q: 'How is my financial info protected?', a: 'We implement bank-grade JWT access token rotations in cookies, hash passwords, and support full data deletion flows. You can clear your account records permanently at any time.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="glass-card-hover p-7" 
                style={{ background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#fff' }}>{item.q}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA BANNER ──────────────────────────── */}
      <div className="section-divider" />
      <section className="py-12 md:py-16 px-6" style={{ background: '#070b0a' }}>
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', display: 'block', marginBottom: 16 }}>
            GET STARTED
          </span>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 }}>
            Ready to Build Your{' '}
            <span style={{ color: '#5ed29c' }}>Financial Future?</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join thousands of investors who use FinPilot to make smarter, data-driven decisions about their money.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth?tab=register"
              className="btn-shine inline-flex items-center gap-3 rounded-full font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105"
              style={{ background: '#5ed29c', color: '#070b0a', padding: '16px 40px', fontSize: 14, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4ab885'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(94,210,156,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5ed29c'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              Start Free Assessment
              <ChevronRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer style={{ background: '#070b0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#5ed29c' }}>
                  <TrendingUp size={16} style={{ color: '#070b0a' }} strokeWidth={2.5} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>FinPilot</span>
              </Link>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, maxWidth: 300, marginBottom: 24 }}>
                AI-powered financial literacy and investment simulation platform. Build your risk profile and learn how to grow your portfolio.
              </p>
              <div className="flex gap-3">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(94,210,156,0.2)'; (e.currentTarget as HTMLElement).style.color = '#5ed29c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
                  ><Icon size={18} /></a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Platform', links: ['Dashboard', 'Assessment', 'Portfolio', 'Learning'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'SEBI Disclosures', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>{col.title}</div>
                <ul className="space-y-3" style={{ listStyle: 'none', padding: 0 }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.3s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#5ed29c')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact + Bottom */}
          <div className="section-divider mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6">
              {[{ Icon: Mail, text: 'hello@finpilot.io' }, { Icon: Phone, text: '+91 98765 43210' }, { Icon: MapPin, text: 'Mumbai, India' }].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  <Icon size={14} style={{ color: '#5ed29c' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              © 2025 FinPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce-dot {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity:0.12; }
          50% { opacity:0.26; }
        }
      `}</style>
    </div>
  );
}
