'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../lib/api';
import { ShieldAlert, TrendingUp, Lock, Mail, User, CheckCircle } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
  consentedToDisclaimer: zod.literal(true, {
    errorMap: () => ({ message: 'You must consent to the SEBI advisory disclaimer to register' }),
  }),
});

export default function AuthPage() {
  const router = useRouter();
  const { setUser, user } = useUserStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<zod.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<zod.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmitLogin = async (data: zod.infer<typeof loginSchema>) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const body = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setUser(body.user);
      setSuccessMessage('Logged in successfully. Redirecting...');
      
      setTimeout(() => {
        if (body.user.riskScore !== null) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }, 1500);

    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRegister = async (data: zod.infer<typeof registerSchema>) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setSuccessMessage('Account created successfully! Switching to Login...');
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('login');
      }, 2000);

    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex min-h-screen" style={{ background: '#070b0a' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{
          top: '15%', left: '20%',
          width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(94,210,156,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 relative z-10 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5ed29c' }}>
            <TrendingUp size={20} style={{ color: '#070b0a' }} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>FinPilot</span>
        </Link>
        {/* Center content */}
        <div className="relative z-10">
          <div className="liquid-glass p-8 rounded-2xl mb-12" style={{ maxWidth: 400 }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5ed29c', marginBottom: 16 }}>
              [ SEBI COMPLIANT ] [ 2025 ]
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 28, lineHeight: 1.2, marginBottom: 16, color: '#fff' }}>
              Build your financial future with{' '}
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#5ed29c' }}>intelligence.</span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              Get a personalized risk profile, AI-powered asset models, and educational resources — all in one place.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.15)', maxWidth: 400 }}>
            <ShieldAlert size={16} style={{ color: 'rgba(255,200,100,0.8)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,200,100,0.7)', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: 'rgba(255,200,100,0.9)' }}>SEBI Advisory:</strong> This platform generates educational model suggestions only, not regulated investment advice.
            </p>
          </div>
        </div>
        {/* Bottom */}
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 10 }}>
          © 2025 FinPilot. All rights reserved.
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
        {/* Mobile logo */}
        <Link href={user ? "/dashboard" : "/"} className="lg:hidden flex items-center gap-2.5 mb-10 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#5ed29c' }}>
            <TrendingUp size={16} style={{ color: '#070b0a' }} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff' }}>FinPilot</span>
        </Link>

        <div className="w-full" style={{ maxWidth: 420 }}>
          <div className="mb-8">
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
              {activeTab === 'login' ? 'Sign in to your FinPilot account' : 'Start your financial journey today'}
            </p>
          </div>

          {/* Auth Box */}
          <div className="liquid-glass p-8 rounded-2xl">
            {/* Tabs */}
            <div className="flex mb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', gap: 0 }}>
              {(['login', 'register'] as const).map(tab => (
                <button key={tab}
                  onClick={() => { setActiveTab(tab); setErrorMessage(null); }}
                  style={{
                    flex: 1, paddingBottom: 14, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
                    background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.3s',
                    borderBottom: activeTab === tab ? '2px solid #5ed29c' : '2px solid transparent',
                    color: activeTab === tab ? '#5ed29c' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {tab === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <ShieldAlert size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#f87171' }}>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl"
                style={{ background: 'rgba(94,210,156,0.08)', border: '1px solid rgba(94,210,156,0.2)' }}>
                <CheckCircle size={15} style={{ color: '#5ed29c', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#5ed29c' }}>{successMessage}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="space-y-4">
                <div>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                    <input type="email" placeholder="name@company.com" {...registerLogin('email')}
                      className="fp-input" />
                  </div>
                  {loginErrors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Inter, sans-serif' }}>{loginErrors.email.message}</p>}
                </div>
                <div>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Password</label>
                  <div className="relative">
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                    <input type="password" placeholder="••••••••" {...registerLogin('password')}
                      className="fp-input" />
                  </div>
                  {loginErrors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Inter, sans-serif' }}>{loginErrors.password.message}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="btn-shine w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 disabled:opacity-50"
                  style={{ background: '#5ed29c', color: '#070b0a', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
                >
                  {loading ? 'Authenticating…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit(onSubmitRegister)} className="space-y-4">
                <div>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Full Name</label>
                  <div className="relative">
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                    <input type="text" placeholder="Aarav Sharma" {...registerRegister('name')} className="fp-input" />
                  </div>
                  {registerErrors.name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Inter, sans-serif' }}>{registerErrors.name.message}</p>}
                </div>
                <div>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                    <input type="email" placeholder="name@company.com" {...registerRegister('email')} className="fp-input" />
                  </div>
                  {registerErrors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Inter, sans-serif' }}>{registerErrors.email.message}</p>}
                </div>
                <div>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>Password</label>
                  <div className="relative">
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                    <input type="password" placeholder="••••••••" {...registerRegister('password')} className="fp-input" />
                  </div>
                  {registerErrors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Inter, sans-serif' }}>{registerErrors.password.message}</p>}
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="consentedToDisclaimer" {...registerRegister('consentedToDisclaimer')}
                      style={{ marginTop: 3, accentColor: '#5ed29c', flexShrink: 0 }} />
                    <label htmlFor="consentedToDisclaimer" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, cursor: 'pointer', userSelect: 'none' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.6)' }}>I consent to the compliance disclaimer:</strong> I understand suggestions represent educational model asset splits, not regulated advice.
                    </label>
                  </div>
                  {registerErrors.consentedToDisclaimer && (
                    <p style={{ color: '#f87171', fontSize: 11, marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      ⚠️ {registerErrors.consentedToDisclaimer.message}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={loading}
                  className="btn-shine w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 disabled:opacity-50"
                  style={{ background: '#5ed29c', color: '#070b0a', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
                >
                  {loading ? 'Creating Account…' : 'Register'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
