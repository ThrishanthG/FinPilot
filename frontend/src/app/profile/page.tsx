'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../lib/api';
import { ArrowLeft, User, ShieldAlert, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [annualIncome, setAnnualIncome] = useState(600000);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate form
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setAge(user.age || 30);
    setOccupation(user.occupation || '');
    setMonthlyIncome(Number(user.monthlyIncome || 50000));
    setAnnualIncome(Number(user.annualIncome || 600000));
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await apiFetch('/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          occupation,
          monthlyIncome,
          annualIncome,
        }),
      });

      setSuccess('Profile updated successfully! AI risk score re-calculations have been queued in the background.');
      
      const freshBody = await apiFetch('/auth/me');
      setUser(freshBody.user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('CRITICAL WARNING: Are you completely sure you want to permanently erase your profile and all associated logs under India DPDP Act / General Data Privacy rules? This action is immediate and completely irreversible.')) {
      return;
    }

    try {
      await apiFetch('/users/data', {
        method: 'DELETE',
      });
      alert('Your profile and financial history have been permanently purged from our databases. Redirecting to landing page.');
      setUser(null);
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!user) {
    return <div className="flex-1 flex items-center justify-center">Loading profile...</div>;
  }

  // Deduce category
  const riskCategory = user.riskScore ? (user.riskScore < 40 ? 'CONSERVATIVE' : user.riskScore > 70 ? 'AGGRESSIVE' : 'MODERATE') : 'UNASSESSED';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel border-b py-3 px-6 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-teal-700">
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </Link>
          <span className="font-extrabold text-lg bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
            My Financial Profile
          </span>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
        
        {/* Left Side: Score Board */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            
            <div className="border-t pt-4 space-y-3 text-xs text-left">
              <div className="flex justify-between font-semibold">
                <span>Risk Category:</span>
                <span className="text-teal-700 dark:text-teal-400 font-bold">{riskCategory}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Score:</span>
                <span className="font-mono font-bold">{user.riskScore ?? '--'}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Experience Score:</span>
                <span className="font-mono font-bold">{user.experienceScore ?? '--'}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Financial Literacy:</span>
                <span className="font-mono font-bold">{user.financialLiteracyScore ?? '--'}/100</span>
              </div>
            </div>
          </div>

          {/* Privacy Box */}
          <div className="glass-panel p-6 rounded-3xl border border-red-500/20 bg-red-50/10 dark:bg-red-950/5 space-y-3">
            <h4 className="font-bold text-xs text-rose-500 uppercase tracking-widest">Data Privacy (DPDP Act)</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Under compliance protocols, you have the right to request deletion of all income, savings, liabilities, and goal records permanently.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete My Account & Data</span>
            </button>
          </div>
        </div>

        {/* Right Side: Update Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 shadow-xl">
            <h3 className="text-xl font-bold border-b pb-2 mb-6">Modify Personal & Financial Parameters</h3>
            
            {success && (
              <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-start space-x-2">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-2">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Occupation</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Monthly Income (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Annual Income (₹)</label>
                  <input
                    type="number"
                    required
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center space-x-1.5"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Processing...' : 'Apply Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>

    </div>
  );
}
