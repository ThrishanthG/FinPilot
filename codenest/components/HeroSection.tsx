'use client';

import { ArrowRight } from 'lucide-react';
import VideoBackground from './VideoBackground';
import LiquidGlassCard from './LiquidGlassCard';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <VideoBackground />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #070b0a 0%, rgba(7,11,10,0.8) 30%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #070b0a 0%, rgba(7,11,10,0.6) 30%, transparent 60%)',
        }}
      />

      {/* Grid Lines (desktop) */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {[25, 50, 75].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${pos}%`, background: 'rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>

      {/* Central Glow Ellipse */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(94,210,156,0.15) 0%, transparent 70%)',
          filter: 'blur(25px)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-custom pt-28 pb-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
        {/* Left: Text */}
        <div className="max-w-[580px]">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <div className="w-1 h-4 bg-[#5ed29c] rounded-full" />
            <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c]">
              Career-Ready Curriculum
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-inter font-black text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] uppercase leading-[0.9] tracking-tighter text-white mb-6 animate-fade-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            LAUNCH YOUR<br />
            CODING<br />
            <span>
              CAREER
              <span className="text-[#5ed29c]">.</span>
            </span>
          </h1>

          {/* Description */}
          <p
            className="font-inter text-[14px] md:text-[16px] text-white/70 leading-relaxed max-w-[480px] mb-10 animate-fade-up"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            Master in-demand coding skills with hands-on projects, industry mentors, 
            and a curriculum built for today's job market.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            <a
              href="#enroll"
              id="enroll"
              className="btn-shine inline-flex items-center gap-3 bg-[#5ed29c] text-[#070b0a] font-inter font-bold text-[13px] uppercase tracking-wide px-8 py-4 rounded-full hover:bg-[#4ab885] transition-all duration-300 hover:shadow-[0_0_30px_rgba(94,210,156,0.4)] hover:scale-105"
            >
              Get Started
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-white/50 font-inter text-[13px] hover:text-[#5ed29c] transition-colors duration-300 px-4 py-4"
            >
              Explore Features →
            </a>
          </div>
        </div>

        {/* Right: Liquid Glass Card */}
        <div
          className="hidden lg:flex items-center justify-center animate-fade-up"
          style={{ animationDelay: '0.5s', opacity: 0 }}
        >
          <LiquidGlassCard />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow pointer-events-none">
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#5ed29c] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
