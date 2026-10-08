/**
 * Prisma enum compatibility shim.
 * In SQLite/Standalone mode, @prisma/client doesn't export enum types.
 * This module provides string-literal equivalents for use across the codebase.
 */

export type Role = 'USER' | 'ADMIN';
export const Role = {
  USER: 'USER' as Role,
  ADMIN: 'ADMIN' as Role,
};

export type RiskLevel = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
export const RiskLevel = {
  CONSERVATIVE: 'CONSERVATIVE' as RiskLevel,
  MODERATE: 'MODERATE' as RiskLevel,
  AGGRESSIVE: 'AGGRESSIVE' as RiskLevel,
};

export type InvestmentType = 'STOCKS' | 'MUTUAL_FUNDS' | 'ETF' | 'BONDS' | 'CRYPTO' | 'REAL_ESTATE' | 'FIXED_DEPOSIT';
export const InvestmentType = {
  STOCKS: 'STOCKS' as InvestmentType,
  MUTUAL_FUNDS: 'MUTUAL_FUNDS' as InvestmentType,
  ETF: 'ETF' as InvestmentType,
  BONDS: 'BONDS' as InvestmentType,
  CRYPTO: 'CRYPTO' as InvestmentType,
  REAL_ESTATE: 'REAL_ESTATE' as InvestmentType,
  FIXED_DEPOSIT: 'FIXED_DEPOSIT' as InvestmentType,
};
