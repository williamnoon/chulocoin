import { PrismaClient, UserTier, SignalDirection, PositionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding staging database...\n');

  // ============================================
  // 1. CREATE TEST USERS
  // ============================================
  console.log('📝 Creating test users...');

  const observerUser = await prisma.user.upsert({
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
        notifications: {
          email: false,
          push: true,
        },
      },
    },
  });

  const bronzeUser = await prisma.user.upsert({
    where: { walletAddress: '0x2222222222222222222222222222222222222222' },
    update: {},
    create: {
      walletAddress: '0x2222222222222222222222222222222222222222',
      tier: UserTier.BRONZE,
      chuloBalance: 1500,
      settings: {
        autoTrade: true,
        maxPositions: 1,
        assetFilter: ['BTC', 'ETH'],
        riskPerTrade: 0.02,
        stopLossEnabled: true,
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  const silverUser = await prisma.user.upsert({
    where: { walletAddress: '0x3333333333333333333333333333333333333333' },
    update: {},
    create: {
      walletAddress: '0x3333333333333333333333333333333333333333',
      tier: UserTier.SILVER,
      chuloBalance: 7500,
      settings: {
        autoTrade: true,
        maxPositions: 3,
        assetFilter: ['BTC', 'ETH', 'SOL'],
        riskPerTrade: 0.015,
        stopLossEnabled: true,
        takeProfitEnabled: true,
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  const goldUser = await prisma.user.upsert({
    where: { walletAddress: '0x4444444444444444444444444444444444444444' },
    update: {},
    create: {
      walletAddress: '0x4444444444444444444444444444444444444444',
      tier: UserTier.GOLD,
      chuloBalance: 30000,
      settings: {
        autoTrade: true,
        maxPositions: 5,
        assetFilter: ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX'],
        riskPerTrade: 0.01,
        stopLossEnabled: true,
        takeProfitEnabled: true,
        trailingStopEnabled: true,
        notifications: {
          email: true,
          push: true,
          telegram: true,
        },
      },
    },
  });

  const diamondUser = await prisma.user.upsert({
    where: { walletAddress: '0x5555555555555555555555555555555555555555' },
    update: {},
    create: {
      walletAddress: '0x5555555555555555555555555555555555555555',
      tier: UserTier.DIAMOND,
      chuloBalance: 150000,
      settings: {
        autoTrade: true,
        maxPositions: 10,
        assetFilter: ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX', 'ARB', 'OP'],
        riskPerTrade: 0.005,
        stopLossEnabled: true,
        takeProfitEnabled: true,
        trailingStopEnabled: true,
        customStrategies: true,
        notifications: {
          email: true,
          push: true,
          telegram: true,
          discord: true,
        },
      },
    },
  });

  console.log('✅ Created 5 test users\n');

  // ============================================
  // 2. CREATE VALIDATORS
  // ============================================
  console.log('👥 Creating validators...');

  const validator1 = await prisma.validator.upsert({
    where: { walletAddress: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    update: {},
    create: {
      walletAddress: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      stake: 10000,
      reputation: 100,
      validations: 0,
      rewardsEarned: 0,
      isActive: true,
    },
  });

  const validator2 = await prisma.validator.upsert({
    where: { walletAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB' },
    update: {},
    create: {
      walletAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      stake: 50000,
      reputation: 105,
      validations: 23,
      rewardsEarned: 450,
      isActive: true,
    },
  });

  const validator3 = await prisma.validator.upsert({
    where: { walletAddress: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC' },
    update: {},
    create: {
      walletAddress: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      stake: 100000,
      reputation: 98,
      validations: 87,
      rewardsEarned: 1340,
      isActive: true,
    },
  });

  console.log('✅ Created 3 validators\n');

  // ============================================
  // 3. CREATE TEST SIGNALS
  // ============================================
  console.log('📊 Creating test signals...');

  // Validated signals
  const validatedSignal1 = await prisma.signal.create({
    data: {
      asset: 'BTC',
      direction: SignalDirection.LONG,
      entry: 45000,
      stop: 43500,
      target: 48000,
      confidence: 85,
      strategyId: 'momentum-breakout-v1',
      minerId: 'miner-001',
      validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      validatorVotes: 3,
      status: 'validated',
    },
  });

  const validatedSignal2 = await prisma.signal.create({
    data: {
      asset: 'ETH',
      direction: SignalDirection.LONG,
      entry: 2400,
      stop: 2350,
      target: 2500,
      confidence: 78,
      strategyId: 'support-bounce-v2',
      minerId: 'miner-002',
      validatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      validatorVotes: 3,
      status: 'validated',
    },
  });

  const validatedSignal3 = await prisma.signal.create({
    data: {
      asset: 'SOL',
      direction: SignalDirection.SHORT,
      entry: 105,
      stop: 108,
      target: 98,
      confidence: 72,
      strategyId: 'resistance-rejection-v1',
      minerId: 'miner-003',
      validatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      validatorVotes: 3,
      status: 'validated',
    },
  });

  // Pending signals (awaiting validation)
  const pendingSignal1 = await prisma.signal.create({
    data: {
      asset: 'BTC',
      direction: SignalDirection.SHORT,
      entry: 46000,
      stop: 47000,
      target: 43000,
      confidence: 68,
      strategyId: 'overbought-reversal-v1',
      minerId: 'miner-001',
      validatorVotes: 1,
      status: 'pending',
    },
  });

  const pendingSignal2 = await prisma.signal.create({
    data: {
      asset: 'ETH',
      direction: SignalDirection.SHORT,
      entry: 2420,
      stop: 2450,
      target: 2350,
      confidence: 64,
      strategyId: 'bearish-divergence-v1',
      minerId: 'miner-004',
      validatorVotes: 2,
      status: 'pending',
    },
  });

  // Rejected signal
  const rejectedSignal = await prisma.signal.create({
    data: {
      asset: 'SOL',
      direction: SignalDirection.LONG,
      entry: 110,
      stop: 105,
      target: 120,
      confidence: 55,
      strategyId: 'low-confidence-test',
      minerId: 'miner-005',
      validatorVotes: 3,
      status: 'rejected',
    },
  });

  console.log('✅ Created 6 test signals (3 validated, 2 pending, 1 rejected)\n');

  // ============================================
  // 4. CREATE OPEN POSITIONS
  // ============================================
  console.log('💼 Creating open positions...');

  const openPosition1 = await prisma.position.create({
    data: {
      userId: goldUser.id,
      signalId: validatedSignal1.id,
      exchange: 'hyperliquid',
      entryPrice: 45000,
      size: 0.05, // 0.05 BTC
      leverage: 2,
      status: PositionStatus.OPEN,
      pnl: 150, // Up $150
    },
  });

  const openPosition2 = await prisma.position.create({
    data: {
      userId: silverUser.id,
      signalId: validatedSignal2.id,
      exchange: 'binance',
      entryPrice: 2400,
      size: 1.5, // 1.5 ETH
      leverage: 1,
      status: PositionStatus.OPEN,
      pnl: 75, // Up $75
    },
  });

  const openPosition3 = await prisma.position.create({
    data: {
      userId: diamondUser.id,
      signalId: validatedSignal3.id,
      exchange: 'coinbase',
      entryPrice: 105,
      size: 50, // 50 SOL
      leverage: 3,
      status: PositionStatus.OPEN,
      pnl: -105, // Down $105 (short position winning)
    },
  });

  console.log('✅ Created 3 open positions\n');

  // ============================================
  // 5. CREATE COMPLETED TRADES
  // ============================================
  console.log('📈 Creating completed trades...');

  const trade1 = await prisma.trade.create({
    data: {
      userId: goldUser.id,
      signalId: validatedSignal1.id,
      entryPrice: 44000,
      exitPrice: 46500,
      size: 0.1,
      pnl: 250,
      pnlPercent: 5.68,
      fees: 12.5,
      duration: 14400, // 4 hours
      closedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  const trade2 = await prisma.trade.create({
    data: {
      userId: silverUser.id,
      signalId: validatedSignal2.id,
      entryPrice: 2350,
      exitPrice: 2450,
      size: 2,
      pnl: 200,
      pnlPercent: 4.26,
      fees: 8,
      duration: 21600, // 6 hours
      closedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  });

  const trade3 = await prisma.trade.create({
    data: {
      userId: bronzeUser.id,
      signalId: validatedSignal3.id,
      entryPrice: 108,
      exitPrice: 102,
      size: 20,
      pnl: 120,
      pnlPercent: 5.56,
      fees: 4.5,
      duration: 10800, // 3 hours
      closedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // Losing trade
  const trade4 = await prisma.trade.create({
    data: {
      userId: silverUser.id,
      signalId: validatedSignal1.id,
      entryPrice: 45500,
      exitPrice: 44200,
      size: 0.05,
      pnl: -65,
      pnlPercent: -2.86,
      fees: 5,
      duration: 7200, // 2 hours
      closedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
  });

  const trade5 = await prisma.trade.create({
    data: {
      userId: diamondUser.id,
      signalId: validatedSignal2.id,
      entryPrice: 2380,
      exitPrice: 2510,
      size: 3,
      pnl: 390,
      pnlPercent: 5.46,
      fees: 15,
      duration: 28800, // 8 hours
      closedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created 5 completed trades\n');

  // ============================================
  // 6. CREATE EXCHANGE API KEYS
  // ============================================
  console.log('🔑 Creating exchange API keys (test data)...');

  const exchangeKey1 = await prisma.exchangeKey.create({
    data: {
      userId: goldUser.id,
      exchange: 'hyperliquid',
      encryptedKey: 'encrypted_test_key_hyperliquid_gold',
      encryptedSecret: 'encrypted_test_secret_hyperliquid_gold',
      isActive: true,
    },
  });

  const exchangeKey2 = await prisma.exchangeKey.create({
    data: {
      userId: silverUser.id,
      exchange: 'binance',
      encryptedKey: 'encrypted_test_key_binance_silver',
      encryptedSecret: 'encrypted_test_secret_binance_silver',
      isActive: true,
    },
  });

  const exchangeKey3 = await prisma.exchangeKey.create({
    data: {
      userId: diamondUser.id,
      exchange: 'coinbase',
      encryptedKey: 'encrypted_test_key_coinbase_diamond',
      encryptedSecret: 'encrypted_test_secret_coinbase_diamond',
      isActive: true,
    },
  });

  console.log('✅ Created 3 exchange API keys\n');

  // ============================================
  // 7. CREATE SYSTEM CONFIG
  // ============================================
  console.log('⚙️  Creating system configuration...');

  await prisma.config.upsert({
    where: { key: 'gas_rates' },
    update: {
      value: JSON.stringify({
        BRONZE: 10,
        SILVER: 5,
        GOLD: 2,
        DIAMOND: 1,
      }),
    },
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
    update: {
      value: JSON.stringify({
        BRONZE: 1000,
        SILVER: 5000,
        GOLD: 25000,
        DIAMOND: 100000,
      }),
    },
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

  await prisma.config.upsert({
    where: { key: 'validator_rewards' },
    update: {
      value: JSON.stringify({
        baseReward: 10,
        consensusBonus: 5,
        accuracyMultiplier: 1.5,
      }),
    },
    create: {
      key: 'validator_rewards',
      value: JSON.stringify({
        baseReward: 10,
        consensusBonus: 5,
        accuracyMultiplier: 1.5,
      }),
      description: 'Validator reward structure in CHULO tokens',
    },
  });

  await prisma.config.upsert({
    where: { key: 'signal_validation_threshold' },
    update: {
      value: '3',
    },
    create: {
      key: 'signal_validation_threshold',
      value: '3',
      description: 'Minimum validator votes required for signal validation',
    },
  });

  await prisma.config.upsert({
    where: { key: 'max_leverage' },
    update: {
      value: JSON.stringify({
        BRONZE: 2,
        SILVER: 5,
        GOLD: 10,
        DIAMOND: 20,
      }),
    },
    create: {
      key: 'max_leverage',
      value: JSON.stringify({
        BRONZE: 2,
        SILVER: 5,
        GOLD: 10,
        DIAMOND: 20,
      }),
      description: 'Maximum leverage allowed per tier',
    },
  });

  await prisma.config.upsert({
    where: { key: 'maintenance_mode' },
    update: {
      value: 'false',
    },
    create: {
      key: 'maintenance_mode',
      value: 'false',
      description: 'System maintenance mode flag',
    },
  });

  console.log('✅ Created 6 system config entries\n');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Staging database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 Summary:');
  console.log('  👤 Users: 5 (Observer, Bronze, Silver, Gold, Diamond)');
  console.log('  👥 Validators: 3');
  console.log('  📊 Signals: 6 (3 validated, 2 pending, 1 rejected)');
  console.log('  💼 Open Positions: 3');
  console.log('  📈 Completed Trades: 5');
  console.log('  🔑 Exchange Keys: 3');
  console.log('  ⚙️  Config Entries: 6\n');

  console.log('🔐 Test Wallet Addresses:');
  console.log('  Observer: 0x1111111111111111111111111111111111111111');
  console.log('  Bronze:   0x2222222222222222222222222222222222222222');
  console.log('  Silver:   0x3333333333333333333333333333333333333333');
  console.log('  Gold:     0x4444444444444444444444444444444444444444');
  console.log('  Diamond:  0x5555555555555555555555555555555555555555\n');

  console.log('✨ You can now test the staging environment!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
