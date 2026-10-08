'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, CheckCircle2, ChevronRight, Play, GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  content: string;
}

export default function LearnPage() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [readModules, setReadModules] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const modules: Module[] = [
    {
      id: "beg-1",
      title: "What is a Stock & Mutual Fund?",
      category: "Beginner",
      summary: "Learn the absolute basics of public equity ownership and aggregate asset pools.",
      content: `A **Stock** (or share) represents fractional ownership in a corporation. When you purchase a stock, you own a tiny slice of that company's assets and future earnings. Companies issue shares to raise expansion capital.

A **Mutual Fund** pools capital from thousands of retail investors to invest in a diversified basket of stocks, bonds, or gold. Instead of choosing 50 different individual companies, you buy units in a single fund overseen by a professional fund manager. This reduces single-entity risk significantly.

**Key takeaway:** Stocks give high ownership potential but carry high individual risk. Mutual Funds offer immediate diversification and are overseen by professionals.`
    },
    {
      id: "beg-2",
      title: "How Compound Interest & SIP Works",
      category: "Beginner",
      summary: "Understand the math behind compounding yields using Systematic Investment Plans.",
      content: `Compounding is the process where asset earnings are reinvested to generate additional yields over time. Albert Einstein famously called compounding the "eighth wonder of the world."

A **Systematic Investment Plan (SIP)** is a method where you invest a fixed sum of money into mutual funds at set intervals (e.g. monthly). This enforces financial discipline and executes **rupee cost averaging**—buying more units when prices are low, and fewer units when prices are high.

**The Compound Formula:**
A = P * (1 + r/n)^(nt)
Over long periods, the exponential growth curve accelerates dramatically. A monthly SIP of ₹5,000 for 25 years compiles massive capital gains.`
    },
    {
      id: "int-1",
      title: "The Art of Diversification",
      category: "Intermediate",
      summary: "Master asset allocation logic to insulate portfolios from market crashes.",
      content: `Diversification is the only "free lunch" in investing. It is the strategy of spreading capital across asset classes (equities, debt, gold, real estate) and sectors (technology, banking, energy) so that they do not move in sync.

When public stock markets drop, defensive assets like government bonds or gold typically hold value or rise. A balanced portfolio ensures that a drop in one category is offset by gains in another, protecting your capital.

**Model Portfolio Asset splits:**
- **Aggressive:** 70% Equities, 20% Bonds, 10% Gold/Alternative
- **Moderate:** 50% Equities, 35% Bonds, 15% Gold
- **Conservative:** 30% Equities, 55% Bonds, 15% Cash/FD`
    },
    {
      id: "adv-1",
      title: "Hedging Risks & Value Metrics",
      category: "Advanced",
      summary: "Introduction to fundamental ratios like P/E, debt-to-equity, and risk hedging tools.",
      content: `Sophisticated investors evaluate target companies using concrete fundamental ratios:
1. **Price-to-Earnings (P/E) Ratio:** The current stock price divided by its earnings per share. It tells you how much the market is willing to pay per rupee of current earnings.
2. **Debt-to-Equity:** Evaluates the company's leverage. High leverage means high bankruptcy risk during downturns.

**Hedging** involves taking offsets to reduce downside exposure. In options trading, a put option behaves like insurance, paying out if the stock index falls. This is a risk mitigation tool rather than a speculative asset.`
    }
  ];

  const quizQuestions = [
    {
      q: "Which financial concept involves investing a set amount monthly to capture rupee cost averaging?",
      options: ["Lump Sum", "Systematic Investment Plan (SIP)", "Day Trading", "Fixed Deposits"],
      correct: 1
    },
    {
      q: "What is the primary benefit of asset class diversification?",
      options: ["Guarantees 20% future yields", "Protects against tax collection", "Reduces risk exposure by avoiding concentration", "Enables high leverage borrowing"],
      correct: 2
    },
    {
      q: "What ratio compares current stock market prices to its annual earnings per share?",
      options: ["P/E Ratio", "Debt-to-Equity", "Quick Ratio", "Beta Index"],
      correct: 0
    }
  ];

  const handleMarkAsRead = (id: string) => {
    if (!readModules.includes(id)) {
      setReadModules(prev => [...prev, id]);
    }
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    const nextAnswers = [...quizAnswers, optionIdx];
    setQuizAnswers(nextAnswers);

    if (activeQuizQuestion + 1 < quizQuestions.length) {
      setActiveQuizQuestion(prev => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      nextAnswers.forEach((ans, idx) => {
        if (ans === quizQuestions[idx].correct) score++;
      });
      setQuizScore(score);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers([]);
    setActiveQuizQuestion(0);
    setQuizScore(null);
  };

  const totalProgress = Math.round((readModules.length / modules.length) * 100);

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
            Educational Learning Center
          </span>
          <div className="text-xs font-bold text-teal-700 dark:text-teal-400">
            Progress: {totalProgress}%
          </div>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
        
        {/* Module Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <h3 className="font-bold text-base flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <span>Course Catalog</span>
            </h3>
            
            {/* Progress status bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Modules Read</span>
                <span>{readModules.length} / {modules.length}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-700 h-full transition-all duration-300" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((cat) => (
                <div key={cat} className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{cat}</div>
                  {modules.filter(m => m.category === cat).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModule(m); setShowQuiz(false); }}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${selectedModule?.id === m.id && !showQuiz ? 'bg-teal-700 text-white border-teal-700' : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 dark:border-slate-800'}`}
                    >
                      <span>{m.title}</span>
                      {readModules.includes(m.id) && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 ml-2" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowQuiz(true); setSelectedModule(null); resetQuiz(); }}
              className={`w-full text-center py-3 rounded-xl text-xs font-extrabold transition-all border ${showQuiz ? 'bg-teal-700 text-white border-teal-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-350 dark:border-amber-900/50 hover:opacity-90'}`}
            >
              Start Comprehension Quiz
            </button>
          </div>
        </div>

        {/* Lesson View Area */}
        <div className="md:col-span-2">
          {showQuiz ? (
            /* Quiz layout */
            <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-bold">Comprehension Quiz</h3>
                <p className="text-xs text-slate-500">Test your finance basics. Answers are not graded but confirm knowledge updates.</p>
              </div>

              {quizScore === null ? (
                <div className="space-y-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Question {activeQuizQuestion + 1} of {quizQuestions.length}
                  </div>
                  <h4 className="text-lg font-bold">{quizQuestions[activeQuizQuestion].q}</h4>
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {quizQuestions[activeQuizQuestion].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerQuiz(idx)}
                        className="w-full text-left p-4 bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-950 rounded-2xl text-xs font-bold transition-all border dark:border-slate-850 hover:border-teal-700"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                  <Award className="h-16 w-16 text-amber-500 mx-auto" />
                  <h4 className="text-2xl font-extrabold">Quiz Completed!</h4>
                  <p className="text-sm">You scored **{quizScore} out of {quizQuestions.length}** correct answers.</p>
                  <button 
                    onClick={resetQuiz} 
                    className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>
          ) : selectedModule ? (
            /* Module Content */
            <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 space-y-6">
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-350 px-2 py-0.5 rounded-full font-mono">
                    {selectedModule.category}
                  </span>
                  <h3 className="text-2xl font-bold mt-2">{selectedModule.title}</h3>
                </div>
                {!readModules.includes(selectedModule.id) && (
                  <button
                    onClick={() => handleMarkAsRead(selectedModule.id)}
                    className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-line space-y-4">
                {selectedModule.content}
              </div>

              <div className="mt-8 pt-4 border-t text-xs text-slate-500 flex items-start space-x-2">
                <ShieldAlert className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Educational Note:</strong> Articles represent general investment studies. Ratios like P/E vary by industry sectors.
                </span>
              </div>
            </div>
          ) : (
            /* Landing View */
            <div className="glass-panel p-12 rounded-3xl bg-white dark:bg-slate-900/60 text-center space-y-6">
              <BookOpen className="h-16 w-16 text-teal-750/30 mx-auto" />
              <h3 className="text-2xl font-bold">Select a Course Module</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Pick a study module from the course catalog on the left to read guides or execute the quiz.
              </p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
