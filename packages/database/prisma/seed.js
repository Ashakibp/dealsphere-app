const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean database
  console.log('🧹 Cleaning database...');
  await prisma.activity.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.merchantRelation.deleteMany();
  await prisma.brokerRelation.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.creditReport.deleteMany();
  await prisma.bankStatement.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.riskAlert.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.broker.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organizations
  console.log('🏢 Creating organizations...');
  const org1 = await prisma.organization.create({
    data: {
      name: 'DealSphere Financial',
      slug: 'dealsphere',
      description: 'Primary MCA funding organization',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'FastFund Capital',
      slug: 'fastfund',
      description: 'Alternative funding solutions',
    },
  });

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dealsphere.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org1.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@dealsphere.com',
      firstName: 'Manager',
      lastName: 'Smith',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: org1.id,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'john@dealsphere.com',
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
      role: 'USER',
      organizationId: org1.id,
    },
  });

  // Create AI Agent user
  const aiAgent = await prisma.user.create({
    data: {
      email: 'ai.underwriter@dealsphere.com',
      firstName: 'AI',
      lastName: 'Underwriter',
      password: hashedPassword,
      role: 'USER',
      isAIAgent: true,
      aiType: 'UNDERWRITING',
      version: '1.0.0',
      capabilities: ['risk_assessment', 'document_analysis', 'fraud_detection'],
      organizationId: org1.id,
    },
  });

  // Create brokers
  console.log('🤝 Creating brokers...');
  const broker1 = await prisma.broker.create({
    data: {
      name: 'Michael Johnson',
      company: 'Prime Funding Solutions',
      email: 'mjohnson@primefunding.com',
      phone: '555-0101',
      address: '123 Wall Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      tier: 'GOLD',
      rating: 4.8,
      commissionRate: 0.04,
      specialties: ['Restaurant', 'Retail', 'Healthcare'],
      organizationId: org1.id,
    },
  });

  const broker2 = await prisma.broker.create({
    data: {
      name: 'Sarah Williams',
      company: 'Quick Capital Brokers',
      email: 'swilliams@quickcapital.com',
      phone: '555-0102',
      tier: 'SILVER',
      rating: 4.2,
      commissionRate: 0.035,
      specialties: ['Construction', 'Manufacturing'],
      organizationId: org1.id,
    },
  });

  // Create merchants
  console.log('🏪 Creating merchants...');
  const merchant1 = await prisma.merchant.create({
    data: {
      businessName: 'Joe\'s Pizza Palace',
      ownerName: 'Joe Marinara',
      email: 'joe@pizzapalace.com',
      phone: '555-0201',
      address: '456 Main St',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      industry: 'Restaurant',
      monthlyRevenue: 75000,
      yearsInBusiness: 5,
      riskScore: 680,
      organizationId: org1.id,
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      businessName: 'TechStart Solutions',
      ownerName: 'Alice Chen',
      email: 'alice@techstart.com',
      phone: '555-0202',
      address: '789 Innovation Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      industry: 'Technology',
      monthlyRevenue: 150000,
      yearsInBusiness: 2,
      riskScore: 720,
      organizationId: org1.id,
    },
  });

  const merchant3 = await prisma.merchant.create({
    data: {
      businessName: 'Green Gardens Landscaping',
      ownerName: 'Robert Green',
      email: 'robert@greengardens.com',
      phone: '555-0203',
      industry: 'Landscaping',
      monthlyRevenue: 45000,
      yearsInBusiness: 8,
      riskScore: 650,
      status: 'ACTIVE',
      organizationId: org1.id,
    },
  });

  // Create deals
  console.log('💰 Creating deals...');
  const deal1 = await prisma.deal.create({
    data: {
      dealNumber: 'DEAL-2024-001',
      status: 'FUNDED',
      requestedAmount: 50000,
      approvedAmount: 45000,
      factorRate: 1.25,
      term: 6,
      dailyPayment: 375,
      totalPayback: 56250,
      fundedDate: new Date('2024-01-15'),
      maturityDate: new Date('2024-07-15'),
      riskScore: 72,
      aiScore: 78,
      aiRecommendation: 'Low risk, strong revenue history',
      merchantId: merchant1.id,
      brokerId: broker1.id,
      organizationId: org1.id,
      userId: managerUser.id,
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      dealNumber: 'DEAL-2024-002',
      status: 'UNDERWRITING',
      requestedAmount: 100000,
      riskScore: 68,
      merchantId: merchant2.id,
      brokerId: broker2.id,
      organizationId: org1.id,
      userId: regularUser.id,
      notes: 'Awaiting bank statements for final review',
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      dealNumber: 'DEAL-2024-003',
      status: 'PENDING',
      requestedAmount: 30000,
      merchantId: merchant3.id,
      organizationId: org1.id,
      userId: regularUser.id,
    },
  });

  // Create payments for funded deal
  console.log('💳 Creating payments...');
  const paymentDates = [];
  const startDate = new Date('2024-01-16');
  
  for (let i = 0; i < 90; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + i);
    
    // Skip weekends
    if (dueDate.getDay() === 0 || dueDate.getDay() === 6) continue;
    
    const payment = await prisma.payment.create({
      data: {
        amount: 375,
        dueDate: dueDate,
        paidDate: i < 30 ? dueDate : null,
        status: i < 30 ? 'PAID' : i < 35 ? 'OVERDUE' : 'PENDING',
        dealId: deal1.id,
      },
    });
  }

  // Create contacts
  console.log('📧 Creating contacts...');
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jmartinez@retailchain.com',
      phone: '555-0301',
      company: 'Retail Chain LLC',
      position: 'CFO',
      location: 'Miami, FL',
      type: 'MERCHANT',
      status: 'ACTIVE',
      relationshipScore: 85,
      dealsPotential: 5,
      source: 'REFERRAL',
      tags: ['high-value', 'retail', 'florida'],
      organizationId: org1.id,
      userId: regularUser.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'dthompson@example.com',
      phone: '555-0302',
      type: 'LEAD',
      status: 'POTENTIAL',
      source: 'WEBSITE',
      tags: ['new-lead', 'needs-followup'],
      organizationId: org1.id,
      userId: regularUser.id,
    },
  });

  // Create activities
  console.log('📋 Creating activities...');
  await prisma.activity.create({
    data: {
      type: 'DEAL_UPDATE',
      title: 'Deal Funded',
      description: 'Deal DEAL-2024-001 has been funded successfully',
      status: 'COMPLETED',
      completedAt: new Date('2024-01-15'),
      dealId: deal1.id,
      userId: managerUser.id,
      organizationId: org1.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'FOLLOW_UP',
      title: 'Follow up with merchant',
      description: 'Check on payment status and business performance',
      priority: 'MEDIUM',
      status: 'PENDING',
      scheduledAt: new Date('2024-02-01'),
      merchantId: merchant1.id,
      userId: regularUser.id,
      organizationId: org1.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'DOCUMENT',
      title: 'Bank statements received',
      description: 'Received 3 months of bank statements for review',
      status: 'COMPLETED',
      completedAt: new Date('2024-01-10'),
      dealId: deal2.id,
      userId: regularUser.id,
      organizationId: org1.id,
    },
  });

  // Create risk alerts
  console.log('⚠️ Creating risk alerts...');
  await prisma.riskAlert.create({
    data: {
      type: 'PAYMENT_DELAY',
      severity: 'MEDIUM',
      title: 'Payment delays detected',
      description: 'Merchant has missed 2 consecutive payments',
      resolved: false,
      dealId: deal1.id,
      merchantId: merchant1.id,
      organizationId: org1.id,
    },
  });

  // Create AI insights
  console.log('🤖 Creating AI insights...');
  await prisma.aIInsight.create({
    data: {
      type: 'OPPORTUNITY',
      title: 'Upsell opportunity detected',
      description: 'Merchant revenue has increased 30% - eligible for higher funding',
      confidence: 0.85,
      actionable: true,
      priority: 'HIGH',
      dealId: deal1.id,
      organizationId: org1.id,
      metadata: {
        currentFunding: 45000,
        suggestedFunding: 75000,
        revenueGrowth: '30%',
      },
    },
  });

  // Create bank statements
  console.log('🏦 Creating bank statements...');
  const months = ['January', 'February', 'March'];
  for (let i = 0; i < 3; i++) {
    await prisma.bankStatement.create({
      data: {
        month: months[i],
        year: 2024,
        avgDailyBalance: 25000 + (i * 2000),
        deposits: 75000 + (i * 5000),
        withdrawals: 70000 + (i * 4000),
        nsfFees: i === 2 ? 2 : 0,
        merchantId: merchant1.id,
        organizationId: org1.id,
      },
    });
  }

  // Create commissions
  console.log('💵 Creating commissions...');
  await prisma.commission.create({
    data: {
      amount: 1800,
      rate: 0.04,
      dealAmount: 45000,
      status: 'PAID',
      paidDate: new Date('2024-01-20'),
      brokerId: broker1.id,
      organizationId: org1.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  
  console.log('\n📊 Database Summary:');
  console.log(`- Organizations: 2`);
  console.log(`- Users: 4 (including 1 AI agent)`);
  console.log(`- Brokers: 2`);
  console.log(`- Merchants: 3`);
  console.log(`- Deals: 3`);
  console.log(`- Contacts: 2`);
  console.log(`- Activities: 3`);
  console.log(`- Risk Alerts: 1`);
  console.log(`- AI Insights: 1`);
  
  console.log('\n🔐 Login Credentials:');
  console.log('Admin: admin@dealsphere.com / password123');
  console.log('Manager: manager@dealsphere.com / password123');
  console.log('User: john@dealsphere.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });