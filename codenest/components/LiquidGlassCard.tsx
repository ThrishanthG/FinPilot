'use client';

export default function LiquidGlassCard() {
  return (
    <div
      className="liquid-glass w-[200px] h-[200px] flex flex-col items-center justify-center text-center px-5 gap-2"
      style={{ animation: 'float 6s ease-in-out infinite' }}
    >
      <div className="font-jakarta font-bold text-[12px] tracking-[0.18em] text-white/40 uppercase">
        [ 2025 ]
      </div>
      <div className="font-jakarta font-semibold text-[15px] text-white leading-snug">
        Taught by{' '}
        <span className="font-serif italic text-[#5ed29c] text-[17px]">Industry</span>{' '}
        Professionals
      </div>
      <div className="font-inter text-[11px] text-white/30 leading-relaxed mt-1 max-w-[150px]">
        Real-world experience, real results
      </div>
    </div>
  );
}
