/**
 * Standalone SQLite seed script.
 * Uses string literals for role/riskLevel since SQLite schema has no enums.
 * Run with:
 *   $env:DATABASE_URL="file:./prisma/dev.db"; node node_modules/ts-node/dist/bin.js --skip-project -e "require('ts-node').register({transpileOnly:true}); require('./prisma/seed.sqlite.ts')"
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import * as path from 'path';

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});

async function main() {
  console.log('Seeding SQLite database...');

  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('admin1234', 10);
  const userHash = await bcrypt.hash('user1234', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@smartfinance.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: true,
      consentedToDisclaimer: true,
      consentedAt: new Date(),
    },
  });
  console.log(`✓ Admin: ${admin.email}`);

  const user = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'user@smartfinance.com',
      passwordHash: userHash,
      role: 'USER',
      emailVerified: true,
      consentedToDisclaimer: true,
      consentedAt: new Date(),
      age: 28,
      occupation: 'Software Engineer',
      monthlyIncome: 95000,
      annualIncome: 1140000,
      riskScore: 68,
      experienceScore: 75,
      financialLiteracyScore: 80,
    },
  });
  console.log(`✓ User: ${user.email}`);

  await prisma.assessment.create({
    data: {
      userId: user.id,
      riskLevel: 'MODERATE',
      answers: JSON.stringify({
        age: 28,
        personalInfo: {
          gender: 'Male',
          occupation: 'Software Engineer',
          employmentStatus: 'Full-time',
          monthlyIncome: 95000,
          annualIncome: 1140000,
          city: 'Mumbai',
          country: 'India',
        },
        financialInfo: {
          currentSavings: 150000,
          existingInvestments: 200000,
          monthlyExpenses: 45000,
          debtInformation: 0,
          emergencyFundStatus: true,
        },
        questionnaire: {
          priorInvesting: true,
          experienceYears: 3,
          knowledgeLevel: 'Intermediate',
          riskComfort: 'Moderate',
          investmentGoal: 'Wealth Creation',
          horizonYears: 5,
        },
      }),
    },
  });

  await prisma.investment.createMany({
    data: [
      { userId: user.id, investmentType: 'STOCKS',       amount: 80000, date: new Date('2026-04-15') },
      { userId: user.id, investmentType: 'MUTUAL_FUNDS', amount: 70000, date: new Date('2026-05-10') },
      { userId: user.id, investmentType: 'BONDS',        amount: 50000, date: new Date('2026-06-01') },
    ],
  });

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        goalName: 'Emergency Reserve fund',
        targetAmount: 200000,
        currentAmount: 150000,
        targetDate: new Date('2026-12-31'),
      },
      {
        userId: user.id,
        goalName: 'Post-Grad Education SIP',
        targetAmount: 500000,
        currentAmount: 50000,
        targetDate: new Date('2029-06-30'),
      },
    ],
  });

  console.log('✓ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
