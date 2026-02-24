import { PrismaClient, UserTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const observer = await prisma.user.upsert({
    where: { walletAddress: '0x1111111111111111111111111111111111111111' },
    update: {},
    create: {
      walletAddress: '0x1111111111111111111111111111111111111111',
      tier: UserTier.OBSERVER,
      chuloBalance: 0,
      settings: {
        autoTrade: false,
        maxPositions: 0,
        assetFilter: ['BTC', 'ETH'],
      },
    },
  });

  const bronze = await prisma.user.upsert({
    where: { walletAddress: '0x2222222222222222222222222222222222222222' },
    update: {},
    create: {
      walletAddress: '0x2222222222222222222222222222222222222222',
      tier: UserTier.BRONZE,
      chuloBalance: 1000,
      settings: {
        autoTrade: true,
        maxPositions: 1,
        assetFilter: ['BTC', 'ETH'],
        riskPerTrade: 0.02,
      },
    },
  });

  const gold = await prisma.user.upsert({
    where: { walletAddress: '0x3333333333333333333333333333333333333333' },
    update: {},
    create: {
      walletAddress: '0x3333333333333333333333333333333333333333',
      tier: UserTier.GOLD,
      chuloBalance: 25000,
      settings: {
        autoTrade: true,
        maxPositions: 5,
        assetFilter: ['BTC', 'ETH', 'SOL'],
        riskPerTrade: 0.01,
      },
    },
  });

  // Create system config
  await prisma.config.upsert({
    where: { key: 'gas_rates' },
    update: {},
    create: {
      key: 'gas_rates',
      value: JSON.stringify({
        BRONZE: 10,
        SILVER: 5,
        GOLD: 2,
        DIAMOND: 1,
      }),
      description: 'Gas rates (CHULO) per transaction for each tier',
    },
  });

  await prisma.config.upsert({
    where: { key: 'tier_thresholds' },
    update: {},
    create: {
      key: 'tier_thresholds',
      value: JSON.stringify({
        BRONZE: 1000,
        SILVER: 5000,
        GOLD: 25000,
        DIAMOND: 100000,
      }),
      description: 'CHULO balance thresholds for each tier',
    },
  });

  console.log('✅ Seed data created:', {
    users: [observer, bronze, gold],
  });
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
