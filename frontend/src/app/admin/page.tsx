'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../lib/api';
import { ShieldAlert, Trash2, ArrowLeft, ShieldCheck, UserCheck, Activity } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number | null;
  riskScore: number | null;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ipAddress: string;
  createdAt: string;
  admin: { name: string; email: string };
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [auditsList, setAuditsList] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'audits'>('users');

  // Verify Admin session
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (user.role !== 'ADMIN') {
      setError('ACCESS FORBIDDEN: You do not possess the required administrator credentials to view this endpoint.');
      return;
    }

    Promise.all([apiFetch('/admin/users'), apiFetch('/admin/audits')])
      .then(([usersData, auditsData]) => {
        setUsersList(usersData);
        setAuditsList(auditsData);
      })
      .catch((e: any) => setError(e.message));
  }, [user]);

  const handleDeleteUser = async (targetId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account and erase all associated portfolio, goal, and calculation history? This action is irreversible.')) {
      return;
    }

    try {
      await apiFetch(`/admin/users/${targetId}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== targetId));
      const audits = await apiFetch('/admin/audits');
      setAuditsList(audits);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md p-8 glass-panel rounded-3xl space-y-4">
          <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold">Unauthorized Access</h3>
          <p className="text-sm text-slate-500">{error}</p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel border-b py-3 px-6 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-teal-700">
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </Link>
          <h2 className="font-extrabold text-lg flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <span>Admin Control Panel</span>
          </h2>
          <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-350 px-2 py-0.5 rounded-full font-mono font-bold">
            Root Admin session
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 pt-20">
        
        {/* Toggle navigation tabs */}
        <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-all ${activeTab === 'users' ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400' : 'border-transparent text-slate-500'}`}
          >
            <UserCheck className="h-4.5 w-4.5" />
            <span>User Accounts Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-all ${activeTab === 'audits' ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400' : 'border-transparent text-slate-500'}`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span>Security Audit Trail Logs</span>
          </button>
        </div>

        {activeTab === 'users' ? (
          /* User management panel */
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base">Registered Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-center">Risk Score</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                      <td className="py-3 font-semibold">{u.name}</td>
                      <td className="py-3 font-mono text-slate-500">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold">{u.riskScore ?? '--'}</td>
                      <td className="py-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete user account and all data permanently"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Audit logger panel */
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-base">Administrative Action History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Executor</th>
                    <th className="pb-3">Operation</th>
                    <th className="pb-3">Client IP</th>
                    <th className="pb-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditsList.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                      <td className="py-3 font-mono text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-3 font-semibold">{log.admin?.name || 'System'}</td>
                      <td className="py-3 font-bold text-teal-700 dark:text-teal-400">{log.action}</td>
                      <td className="py-3 font-mono text-xs">{log.ipAddress}</td>
                      <td className="py-3 font-mono text-xs text-slate-650 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
