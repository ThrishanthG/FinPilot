import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  consentedToDisclaimer: boolean;
  age?: number;
  occupation?: string;
  monthlyIncome?: number;
  annualIncome?: number;
  riskScore?: number;
  experienceScore?: number;
  financialLiteracyScore?: number;
}

interface UserState {
  user: User | null;
  theme: 'light' | 'dark';
  onboardingStep: number;
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
  setOnboardingStep: (step: number) => void;
  resetOnboarding: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  theme: 'dark', // Slate dark mode by default for premium visual aesthetic
  onboardingStep: 0,
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
  resetOnboarding: () => set({ onboardingStep: 0 }),
}));
