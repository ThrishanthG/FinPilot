import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset users
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('admin1234', 10);
  const userPasswordHash = await bcrypt.hash('user1234', 10);
  const userThrishanthHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@smartfinance.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
      consentedToDisclaimer: true,
      consentedAt: new Date(),
    },
  });
  console.log(`Created Admin user: ${admin.email}`);

  // 2. Create Standard User
  const user = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'user@smartfinance.com',
      passwordHash: userPasswordHash,
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
  console.log(`Created Standard user: ${user.email}`);

  // 3. Create User thrishanth8588@gmail.com
  const thrishanth = await prisma.user.create({
    data: {
      name: 'Thrishanth',
      email: 'thrishanth8588@gmail.com',
      passwordHash: userThrishanthHash,
      role: 'USER',
      emailVerified: true,
      consentedToDisclaimer: true,
      consentedAt: new Date(),
      age: 25,
      occupation: 'Developer',
      monthlyIncome: 100000,
      annualIncome: 1200000,
      riskScore: 72,
      experienceScore: 80,
      financialLiteracyScore: 85,
    },
  });
  console.log(`Created Thrishanth user: ${thrishanth.email}`);

  // 4. Seed initial assessment and investments
  const assessment = await prisma.assessment.create({
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
      {
        userId: user.id,
        investmentType: 'STOCKS',
        amount: 80000,
        date: new Date('2026-04-15'),
      },
      {
        userId: user.id,
        investmentType: 'MUTUAL_FUNDS',
        amount: 70000,
        date: new Date('2026-05-10'),
      },
      {
        userId: user.id,
        investmentType: 'BONDS',
        amount: 50000,
        date: new Date('2026-06-01'),
      },
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

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
