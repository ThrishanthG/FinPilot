'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import { apiFetch } from '../../lib/api';
import { Compass, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';

const onboardingSchema = zod.object({
  age: zod.number({ invalid_type_error: 'Age must be a number' }).min(18, 'Must be at least 18').max(100, 'Invalid age range'),
  personalInfo: zod.object({
    gender: zod.string().min(1, 'Please select gender'),
    occupation: zod.string().min(2, 'Please state your occupation'),
    employmentStatus: zod.string().min(1, 'Please select employment status'),
    monthlyIncome: zod.number({ invalid_type_error: 'Must be a positive number' }).min(0, 'Income cannot be negative'),
    annualIncome: zod.number({ invalid_type_error: 'Must be a positive number' }).min(0, 'Income cannot be negative'),
    city: zod.string().min(2, 'Please state city'),
    country: zod.string().min(2, 'Please state country'),
  }),
  financialInfo: zod.object({
    currentSavings: zod.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative'),
    existingInvestments: zod.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative'),
    monthlyExpenses: zod.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative'),
    debtInformation: zod.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative'),
    emergencyFundStatus: zod.boolean(),
  }),
  questionnaire: zod.object({
    priorInvesting: zod.boolean(),
    experienceYears: zod.number({ invalid_type_error: 'Must be a number' }).min(0),
    knowledgeLevel: zod.string().min(1, 'Please select a literacy level'),
    riskComfort: zod.string().min(1, 'Please select risk comfort level'),
    investmentGoal: zod.string().min(1, 'Please select a goal'),
    horizonYears: zod.number({ invalid_type_error: 'Must be a number' }).min(1).max(50),
  }),
});

type OnboardingFormValues = zod.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [step, setStep] = useState(1); // Steps 1 to 3
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      personalInfo: { gender: 'Male', employmentStatus: 'Full-time' },
      financialInfo: { emergencyFundStatus: false },
      questionnaire: { priorInvesting: false, knowledgeLevel: 'Beginner', riskComfort: 'Moderate', investmentGoal: 'Wealth Creation', horizonYears: 5 },
    },
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data: OnboardingFormValues) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await apiFetch('/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      setTimeout(async () => {
        const body = await apiFetch('/auth/me');
        setUser(body.user);
        router.push('/dashboard');
      }, 2500);

    } catch (e: any) {
      setErrorMessage(e.message);
      setLoading(false);
    }
  };

  const currentProgress = (step / 3) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
            <span>Step {step} of 3: {step === 1 ? 'Personal Info' : step === 2 ? 'Financial Health' : 'Investment Profile'}</span>
            <span>{Math.round(currentProgress)}% Done</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-700 dark:bg-teal-400 h-full transition-all duration-300" style={{ width: `${currentProgress}%` }}></div>
          </div>
        </div>

        {/* Disclaimer strip above onboarding container */}
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-xl text-xs text-yellow-800 dark:text-yellow-300">
          ⚠️ <strong>SEBI Disclaimer:</strong> Questionnaire results help map mathematical allocations. These suggestions do not represent customized, regulated financial advice.
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-slate-900/60 shadow-xl">
          {errorMessage && <p className="text-rose-500 text-sm mb-4">Error: {errorMessage}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">Personal Profiles</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      placeholder="28"
                      {...register('age', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                    {errors.age && <p className="text-rose-500 text-xs mt-1">{errors.age.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Gender</label>
                    <select
                      {...register('personalInfo.gender')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Occupation</label>
                    <input
                      type="text"
                      placeholder="Software Engineer"
                      {...register('personalInfo.occupation')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                    {errors.personalInfo?.occupation && <p className="text-rose-500 text-xs mt-1">{errors.personalInfo.occupation.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Employment Status</label>
                    <select
                      {...register('personalInfo.employmentStatus')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Self-employed">Self-employed</option>
                      <option value="Student">Student</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Monthly Income (₹)</label>
                    <input
                      type="number"
                      placeholder="80000"
                      {...register('personalInfo.monthlyIncome', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                    {errors.personalInfo?.monthlyIncome && <p className="text-rose-500 text-xs mt-1">{errors.personalInfo.monthlyIncome.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Annual Income (₹)</label>
                    <input
                      type="number"
                      placeholder="960000"
                      {...register('personalInfo.annualIncome', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                    {errors.personalInfo?.annualIncome && <p className="text-rose-500 text-xs mt-1">{errors.personalInfo.annualIncome.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      {...register('personalInfo.city')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      {...register('personalInfo.country')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold flex items-center"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Financial Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">Financial Status</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Current Savings (₹)</label>
                    <input
                      type="number"
                      placeholder="150000"
                      {...register('financialInfo.currentSavings', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Existing Investments (₹)</label>
                    <input
                      type="number"
                      placeholder="200000"
                      {...register('financialInfo.existingInvestments', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      placeholder="35000"
                      {...register('financialInfo.monthlyExpenses', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Outstanding Debts (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      {...register('financialInfo.debtInformation', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <input
                    type="checkbox"
                    id="emergencyFundStatus"
                    {...register('financialInfo.emergencyFundStatus')}
                    className="h-4.5 w-4.5 rounded accent-teal-700"
                  />
                  <label htmlFor="emergencyFundStatus" className="text-xs font-semibold select-none">
                    I currently hold an Emergency Reserve of at least 3-6 months expenses.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-sm font-bold flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold flex items-center"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Experience Questionnaire */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">Investment Experience</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="priorInvesting"
                      {...register('questionnaire.priorInvesting')}
                      className="h-4.5 w-4.5 rounded accent-teal-700"
                    />
                    <label htmlFor="priorInvesting" className="text-xs font-semibold select-none">
                      I have prior investing experience
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Years of Experience</label>
                    <input
                      type="number"
                      placeholder="2"
                      {...register('questionnaire.experienceYears', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Self-Rated Knowledge</label>
                    <select
                      {...register('questionnaire.knowledgeLevel')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Risk Comfort</label>
                    <select
                      {...register('questionnaire.riskComfort')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    >
                      <option value="Low">Low (Focus on Capital Preservation)</option>
                      <option value="Moderate">Moderate (Balance Growth & Safety)</option>
                      <option value="High">High (Focus on Aggressive Growth)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Investment Goal</label>
                    <select
                      {...register('questionnaire.investmentGoal')}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    >
                      <option value="Wealth Creation">Wealth Creation</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Education">Education</option>
                      <option value="House Purchase">House Purchase</option>
                      <option value="Passive Income">Passive Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Timeline Horizon (Years)</label>
                    <input
                      type="number"
                      placeholder="5"
                      {...register('questionnaire.horizonYears', { valueAsNumber: true })}
                      className="w-full px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-sm font-bold flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold flex items-center disabled:opacity-50"
                  >
                    {loading ? 'Analyzing Profile...' : 'Complete Assessment'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
