'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import { apiFetch, WS_URL } from '../../lib/api';
import { 
  TrendingUp, Compass, Calculator, BookOpen, ShieldAlert, Award, 
  Trash2, Plus, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, 
  LogOut, User as UserIcon, Settings, PlusCircle, HelpCircle, MessageSquare,
  Bot, Send, Sparkles, RotateCcw, X
} from 'lucide-react';
import { io } from 'socket.io-client';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[];
}

const TICKER_UPDATE_INTERVAL = 1200;

interface Goal {
  id: string;
  goalName: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
}

interface Investment {
  id: string;
  investmentType: string;
  amount: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, theme, toggleTheme } = useUserStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'investments'>('overview');
  
  // States
  const [mounted, setMounted] = useState(false);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [suggestions, setSuggestions] = useState<any>(null);
  
  // Calculator States
  const [calcSavingsRatio, setCalcSavingsRatio] = useState(30); // 30% savings default
  const [calcReturnRate, setCalcReturnRate] = useState(12); // 12% returns expected
  const [calcYears, setCalcYears] = useState(10);

  // Logout Confirmation Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create Goal Modal / State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState(100000);
  const [goalDate, setGoalDate] = useState('2030-12-31');

  // Create Investment Modal / State
  const [showInvModal, setShowInvModal] = useState(false);
  const [invType, setInvType] = useState('MUTUAL_FUNDS');
  const [invAmount, setInvAmount] = useState(25000);
  const [invDate, setInvDate] = useState('2026-06-19');
  const [invWarning, setInvWarning] = useState<string | null>(null);

  // FinBot Floating Chat Widget State
  const [showFinbot, setShowFinbot] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: "Hello! I'm FinBot, your AI financial assistant for FinPilot. Ask me anything about your goals, portfolio logs, or investment concepts!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (showFinbot) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, chatLoading, showFinbot]);

  // Run on mount to hydrate client
  useEffect(() => {
    setMounted(true);
    
    apiFetch('/auth/me')
      .then(body => setUser(body.user))
      .catch(() => router.push('/auth'));
  }, []);

  // Fetch Goals, Investments & Suggestions
  useEffect(() => {
    if (!mounted || !user) return;
    
    Promise.all([
      apiFetch('/goals'),
      apiFetch('/investments'),
      apiFetch('/assessments/suggestions'),
    ]).then(([goalsData, investmentsData, suggestionsData]) => {
      setGoals(goalsData);
      setInvestments(investmentsData);
      setSuggestions(suggestionsData);
    }).catch(() => {
      // Keep the user on dashboard if user is already authenticated; fallback errors handled elsewhere.
    });
  }, [mounted, user]);

  // Connect to Websocket Gateway for Live price feeds
  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

  // Calculate Projection Curves whenever inputs change
  const projectionData = useMemo(() => {
    if (!user) return [];
    const income = Number(user.monthlyIncome || 50000);
    const monthlySaved = (income * calcSavingsRatio) / 100;
    
    // Call Python FastAPI or execute local compound math
    // compound math: f = P * (1+r)^t + PMT * (((1+r)^t - 1)/r)
    const rate = calcReturnRate / 100;
    const data = [];
    let principal = 0;
    let balance = 0;
    const annualContrib = monthlySaved * 12;
    
    for (let yr = 1; yr <= calcYears; yr++) {
      principal += annualContrib;
      balance = balance * (1 + rate) + annualContrib;
      data.push({
        year: `Yr ${yr}`,
        Invested: Math.round(principal),
        Growth: Math.round(balance)
      });
    }
    return data;
  }, [user, calcSavingsRatio, calcReturnRate, calcYears]);

  // Logout Handler — opens confirmation modal
  const handleLogout = () => setShowLogoutConfirm(true);

  // Called when user confirms logout (discard changes)
  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // Save calculator preferences then logout
  const saveAndLogout = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcSavingsRatio,
          calcReturnRate,
          calcYears,
        }),
      });
    } catch {
      // If save fails, log out anyway — data is best-effort
    } finally {
      setIsSaving(false);
    }
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // Add Goal Handler
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = await apiFetch('/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalName,
        targetAmount: Number(goalTarget),
        currentAmount: 0,
        targetDate: goalDate,
      }),
    });
    setGoals(prev => [newGoal, ...prev]);
    setShowGoalModal(false);
    setGoalName('');
  };

  // Add Investment Handler
  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvWarning(null);
    const body = await apiFetch('/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investmentType: invType,
        amount: Number(invAmount),
        date: invDate,
      }),
    });
    if (body.success) {
      setInvestments(prev => [body.investment, ...prev]);
      if (body.warning) {
        setInvWarning(body.warning);
      } else {
        setShowInvModal(false);
      }
    }
  };

  // Send FinBot Chat Message
  const handleSendFinbotChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userText = trimmed;
    setChatInput('');
    
    const updatedLog = [...chatLog, { sender: 'user' as const, text: userText }];
    setChatLog(updatedLog);
    setChatLoading(true);

    try {
      const conversationHistory = updatedLog.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text,
      }));

      const res = await apiFetch('/finbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, conversationHistory }),
      });

      const botReply = res?.reply || res?.answer || "FinBot couldn't process your request right now. Please try again.";
      setChatLog(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('FinBot Error:', error);
      setChatLog(prev => [
        ...prev,
        { sender: 'bot', text: "FinBot couldn't respond right now. Please check your connection or try again in a moment." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Recharts parameters
  const pieColors = ['#0f766e', '#0284c7', '#d97706', '#be123c', '#4d7c0f', '#6d28d9'];
  const chartData = useMemo(() => {
    if (!suggestions?.suggestedAllocation) return [];
    return Object.entries(suggestions.suggestedAllocation).map(([name, val]) => ({
      name,
      value: Number(val)
    }));
  }, [suggestions]);

  // Aggregate stats
  const totalNetWorth = useMemo(() => {
    const savings = Number(user?.monthlyIncome || 0) * 1.5; // illustrative
    const portfolio = investments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return savings + portfolio;
  }, [user, investments]);

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [investments]);

  if (!mounted || !user) {
    return <div className="flex-1 flex items-center justify-center">Loading session profiles...</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel border-b py-3 px-6 transition-all duration-300 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-teal-700 text-white p-2 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-teal-200">
              FinPilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <button onClick={() => setActiveTab('overview')} className={`transition-colors ${activeTab === 'overview' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'}`}>Overview</button>
            <button onClick={() => setActiveTab('goals')} className={`transition-colors ${activeTab === 'goals' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'}`}>Goal Tracker</button>
            <button onClick={() => setActiveTab('investments')} className={`transition-colors ${activeTab === 'investments' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'}`}>Portfolio Logs</button>
            <Link href="/learn" className="text-slate-500 hover:text-teal-700">Learning Center</Link>
          </nav>

          <div className="flex items-center space-x-4">

            <span className="text-xs font-bold border border-teal-700/20 px-2.5 py-1 rounded-full text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300">
              Risk: {user.riskScore ? (user.riskScore < 40 ? 'Conservative' : user.riskScore > 70 ? 'Aggressive' : 'Moderate') : 'Pending'}
            </span>

            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors duration-200" aria-label="Sign Out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 pt-20">
        
        {/* Ticker strip for active prices */}
        {tickers.length > 0 && (
          <div className="w-full glass-panel py-3 px-4 rounded-2xl overflow-hidden shadow-sm flex items-center space-x-6">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest border-r pr-4 shrink-0">Live ticks</div>
            <div className="flex items-center space-x-8 overflow-x-auto select-none no-scrollbar">
              {tickers.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs shrink-0">
                  <span className="font-semibold text-slate-600 dark:text-slate-350">{t.name}</span>
                  <span className="font-mono font-bold">₹{t.price.toLocaleString('en-IN')}</span>
                  <span className={`font-mono font-bold ${t.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.change >= 0 ? '+' : ''}{t.changePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 dark:bg-teal-400/5 rounded-bl-[120px]"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Assets Value</span>
                <div className="text-3xl font-extrabold mt-2 font-mono">₹{totalNetWorth.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-500 mt-2">Includes current savings and logged investments.</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Logged Portfolio</span>
                <div className="text-3xl font-extrabold mt-2 font-mono text-teal-700 dark:text-teal-400">₹{totalInvested.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-500 mt-2">Aggregated investment logs across all categories.</div>
              </div>

              <div className="glass-panel p-6 rounded-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Scores</span>
                <div className="flex items-center space-x-4 mt-2">
                  <div>
                    <div className="text-2xl font-bold font-mono">{user.riskScore ?? '--'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Risk (0-100)</div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="text-2xl font-bold font-mono">{user.experienceScore ?? '--'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Experience</div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="text-2xl font-bold font-mono">{user.financialLiteracyScore ?? '--'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Stability</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Allocations & Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Suggested allocation */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Suggested Model Asset Allocation</h3>
                  
                  {suggestions?.suggestedAllocation ? (
                    <div className="space-y-4">
                      
                      {/* Interactive Visual Pie */}
                      <div className="w-full h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                              isAnimationActive={false}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend formatter={(value) => <span className="text-xs font-bold uppercase">{value}</span>} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 pl-3">
                        {suggestions.explanation}
                      </p>

                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-slate-500 mb-4">Please submit onboarding questionnaire to view model allocation suggestors.</p>
                      <Link href="/onboarding" className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold">Start Onboarding</Link>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start space-x-2 text-[10px] leading-relaxed text-slate-500">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                  <span>
                    <strong>Educational Suggestion Disclaimer:</strong> Suggestions are based on mathematical benchmarks. Do not treat as tailored SEBI financial advice. Past outcomes do not guarantee future yields.
                  </span>
                </div>
              </div>

              {/* Card 2: Investable Calculator */}
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Investment Growth Calculator</h3>
                  <p className="text-xs text-slate-500">Calculate future portfolio growths using variables below.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Monthly Savings Target</span>
                      <span>{calcSavingsRatio}% of Income (₹{((Number(user.monthlyIncome || 50000) * calcSavingsRatio) / 100).toLocaleString('en-IN')}/mo)</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={calcSavingsRatio}
                      onChange={(e) => setCalcSavingsRatio(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1">Expected Return CAGR (%)</label>
                      <input
                        type="number"
                        value={calcReturnRate}
                        onChange={(e) => setCalcReturnRate(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Horizon (Years)</label>
                      <input
                        type="number"
                        value={calcYears}
                        onChange={(e) => setCalcYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Projection chart visualization */}
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Area type="monotone" dataKey="Growth" stroke="#0f766e" fill="#0f766e" fillOpacity={0.15} isAnimationActive={false} />
                      <Area type="monotone" dataKey="Invested" stroke="#64748b" fill="#64748b" fillOpacity={0.05} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <p className="text-[10px] text-slate-400 italic text-center">
                  Growth logic: compounded annually where future sum = P * (1+r)^t + PMT * (((1+r)^t - 1)/r).
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Goals Tab content */}
        {activeTab === 'goals' && (
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Financial Goals Tracker</h3>
                <p className="text-xs text-slate-500">Log long-term target assets and verify monthly accumulations.</p>
              </div>
              <button 
                onClick={() => setShowGoalModal(true)} 
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-teal-700/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Goal</span>
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No target goals found. Create your first goal to begin.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((g, idx) => {
                  const target = Number(g.targetAmount);
                  const current = Number(g.currentAmount);
                  const pct = Math.min(100, Math.round((current / target) * 100));
                  return (
                    <div key={idx} className="p-5 border dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-base">{g.goalName}</h4>
                          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">{pct}% Completed</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-4 font-mono">
                          <span>Target: ₹{target.toLocaleString('en-IN')}</span>
                          <span>Timeline: {new Date(g.targetDate).toLocaleDateString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden mb-2">
                          <div className="bg-teal-700 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Portfolio Logs Tab */}
        {activeTab === 'investments' && (
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Portfolio Investment Logs</h3>
                <p className="text-xs text-slate-500">Record transaction assets manually to calculate growth and monitor patterns.</p>
              </div>
              <button 
                onClick={() => { setShowInvModal(true); setInvWarning(null); }} 
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-teal-700/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Log Asset Purchase</span>
              </button>
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No recorded portfolio transactions. Log an asset to build charts.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Asset Category</th>
                      <th className="pb-3">Logged Date</th>
                      <th className="pb-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                        <td className="py-3 font-semibold text-teal-700 dark:text-teal-400">{inv.investmentType.replace('_', ' ')}</td>
                        <td className="py-3 font-mono text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="py-3 text-right font-bold font-mono">₹{Number(inv.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ----------------- Modals & Drawers ----------------- */}

      {/* ── FINBOT FLOATING BOT BUTTON ─────────────── */}
      <button
        onClick={() => setShowFinbot(prev => !prev)}
        aria-label="Toggle FinBot"
        className="fixed bottom-7 right-7 z-50 group"
        style={{ outline: 'none', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
      >
        {/* Pulsing ambient glow ring */}
        <span style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,214,180,0.22) 0%, transparent 70%)',
          animation: showFinbot ? 'none' : 'finbot-aura 2.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Outer speech-bubble shell */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50% 50% 50% 36% / 50% 50% 42% 50%',
          background: 'radial-gradient(145deg at 30% 25%, #e8edf4 0%, #c2cdd8 45%, #8fa0b0 100%)',
          boxShadow: showFinbot
            ? '0 4px 24px rgba(56,214,180,0.5), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.5)'
            : '0 6px 28px rgba(56,214,180,0.45), 0 12px 40px rgba(0,180,255,0.25), 0 2px 8px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s ease',
        }}
          className="group-hover:scale-110 group-active:scale-95"
        >
          {/* Specular highlight on shell */}
          <div style={{
            position: 'absolute', top: 8, left: 12, width: 28, height: 14,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }} />

          {/* Inner dark sphere */}
          <div style={{
            width: 62, height: 62,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 36% 32%, #1c2e44 0%, #0d1822 55%, #060d12 100%)',
            boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.9), inset 0 -1px 4px rgba(56,214,180,0.12), 0 1px 3px rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle inner glow reflection */}
            <div style={{
              position: 'absolute', top: 6, left: 10, width: 18, height: 8,
              borderRadius: '50%',
              background: 'rgba(56,214,180,0.08)',
              filter: 'blur(3px)',
              pointerEvents: 'none',
            }} />
            {/* Glowing cyan eye — left */}
            <div style={{
              width: 11, height: 20,
              borderRadius: 8,
              background: 'linear-gradient(170deg, #7df4ff 0%, #22d3ee 40%, #0ea5e9 100%)',
              boxShadow: '0 0 10px 4px rgba(34,211,238,0.85), 0 0 20px 6px rgba(14,165,233,0.4)',
              animation: 'finbot-blink 3.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            {/* Glowing cyan eye — right */}
            <div style={{
              width: 11, height: 20,
              borderRadius: 8,
              background: 'linear-gradient(170deg, #7df4ff 0%, #22d3ee 40%, #0ea5e9 100%)',
              boxShadow: '0 0 10px 4px rgba(34,211,238,0.85), 0 0 20px 6px rgba(14,165,233,0.4)',
              animation: 'finbot-blink 3.5s ease-in-out infinite 0.22s',
              flexShrink: 0,
            }} />
          </div>

          {/* Online notification dot */}
          {!showFinbot && (
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 13, height: 13,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #4ade80, #16a34a)',
              border: '2.5px solid #060d12',
              boxShadow: '0 0 6px 2px rgba(74,222,128,0.7)',
              animation: 'pulse 1.8s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Label tag */}
        <span style={{
          position: 'absolute', bottom: '108%', right: 0,
          background: 'linear-gradient(135deg, rgba(6,13,18,0.96), rgba(13,24,34,0.96))',
          color: '#38d6b4',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          padding: '5px 12px', borderRadius: 9,
          whiteSpace: 'nowrap',
          opacity: 0, pointerEvents: 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          border: '1px solid rgba(56,214,180,0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transform: 'translateY(4px)',
        }}
          className="group-hover:opacity-100 group-hover:translate-y-0"
        >FinBot — AI Assistant</span>
      </button>

      {/* ── FINBOT FLOATING CHAT WIDGET ───────────── */}
      {showFinbot && (
        <div 
          className="fixed bottom-[88px] right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[540px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-teal-500/30 bg-slate-900/95 backdrop-blur-xl text-slate-100"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.65)', animation: 'slideInFromBottom 0.35s cubic-bezier(0.22,1,0.36,1) forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">FinBot</h3>
                </div>
                <p className="text-[11px] text-slate-400">AI Financial Assistant • Online</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setChatLog([{ sender: 'bot', text: "Hello! I'm FinBot, your AI financial assistant for FinPilot. Ask me anything about your goals, portfolio logs, or investment concepts!" }])}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setShowFinbot(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close FinBot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
            {chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start items-start space-x-2.5'}`}
              >
                {chat.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                )}

                <div 
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    chat.sender === 'user'
                      ? 'bg-teal-500 text-slate-950 font-semibold rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none shadow-sm'
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-slate-400 flex items-center space-x-1.5 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 mr-1">FinBot is thinking</span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <form onSubmit={handleSendFinbotChat} className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFinbotChat();
                }
              }}
              disabled={chatLoading}
              placeholder="Ask FinBot a financial question..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 focus:border-teal-500/50 rounded-xl outline-none text-slate-100 placeholder-slate-500 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={chatLoading || !chatInput.trim()}
              className="p-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 rounded-xl transition-all font-bold shadow-md flex items-center justify-center shrink-0"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Create Target Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-bold">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy House, Emergency Reserve"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold">Target Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Target Date</label>
                  <input
                    type="date"
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowGoalModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-700 text-white rounded-xl font-bold">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Log Portfolio Asset</h3>
            
            {/* Warning block for erratic transaction detection */}
            {invWarning && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-450 flex items-start space-x-2 animate-shake">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Erratic Pattern Flagged:</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{invWarning}</p>
                  <button 
                    onClick={() => setShowInvModal(false)} 
                    className="mt-2.5 px-3 py-1 bg-rose-700 text-white text-[10px] font-bold rounded-lg"
                  >
                    Adjust Asset Split
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleAddInvestment} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-bold">Asset Type</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                >
                  <option value="MUTUAL_FUNDS">Mutual Funds</option>
                  <option value="STOCKS">Direct Equities</option>
                  <option value="BONDS">Bonds / Debt Instruments</option>
                  <option value="ETF">Exchange Traded Funds</option>
                  <option value="CRYPTO">Cryptocurrency</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold">Amount Invested (₹)</label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowInvModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-700 text-white rounded-xl font-bold">Log Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION MODAL ───────────── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="relative flex flex-col items-center gap-6 rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(15,23,30,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              width: '100%',
              maxWidth: 380,
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <LogOut size={24} style={{ color: '#ef4444' }} />
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8 }}>
                Sign out of FinPilot?
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                You will be returned to the home page. Any unsaved changes will be lost.
              </p>
            </div>

            {/* Buttons — stacked layout for 3 options */}
            <div className="flex flex-col w-full gap-3">

              {/* Save & Log Out — primary accent action */}
              <button
                onClick={saveAndLogout}
                disabled={isSaving}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: isSaving ? 'rgba(94,210,156,0.1)' : 'rgba(94,210,156,0.12)',
                  border: '1px solid rgba(94,210,156,0.3)',
                  color: '#5ed29c',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!isSaving) { (e.currentTarget as HTMLElement).style.background = '#5ed29c'; (e.currentTarget as HTMLElement).style.color = '#070b0a'; } }}
                onMouseLeave={e => { if (!isSaving) { (e.currentTarget as HTMLElement).style.background = 'rgba(94,210,156,0.12)'; (e.currentTarget as HTMLElement).style.color = '#5ed29c'; } }}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Saving…
                  </>
                ) : 'Save Changes & Log Out'}
              </button>

              {/* Bottom row: Cancel + Log Out */}
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!isSaving) { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                  onMouseLeave={e => { if (!isSaving) { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; } }}
                >
                  Log Out
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
