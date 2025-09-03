# Prisma Usage Guide for DealSphere

## Table of Contents
1. [Quick Start](#quick-start)
2. [Basic CRUD Operations](#basic-crud-operations)
3. [Relations & Includes](#relations--includes)
4. [Advanced Queries](#advanced-queries)
5. [Transactions](#transactions)
6. [Best Practices](#best-practices)

## Quick Start

### Import Prisma Client
```typescript
import { db } from '@/lib/db';
// or
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

## Basic CRUD Operations

### CREATE

```typescript
// Simple create
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: hashedPassword,
    role: 'USER',
    organizationId: 'org_id_here'
  }
});

// Create with relations
const deal = await db.deal.create({
  data: {
    dealNumber: 'DEAL-2024-001',
    status: 'PENDING',
    requestedAmount: 50000,
    merchant: {
      connect: { id: merchantId }  // Connect existing
    },
    broker: {
      create: {  // Create new broker
        name: 'New Broker',
        email: 'broker@example.com',
        phone: '555-0000',
        organizationId: orgId
      }
    },
    organizationId: orgId,
    userId: userId
  },
  include: {
    merchant: true,
    broker: true
  }
});

// Create many
const contacts = await db.contact.createMany({
  data: [
    { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', organizationId: orgId, userId: userId },
    { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', organizationId: orgId, userId: userId }
  ]
});
```

### READ

```typescript
// Find unique (by unique field)
const user = await db.user.findUnique({
  where: { email: 'user@example.com' }
});

// Find first matching
const deal = await db.deal.findFirst({
  where: {
    status: 'FUNDED',
    requestedAmount: { gte: 50000 }
  }
});

// Find many with filters
const merchants = await db.merchant.findMany({
  where: {
    monthlyRevenue: { gte: 100000 },
    status: 'ACTIVE',
    state: { in: ['NY', 'CA', 'TX'] }
  },
  orderBy: { monthlyRevenue: 'desc' },
  take: 10,  // Limit
  skip: 0    // Offset
});

// Count
const dealCount = await db.deal.count({
  where: { status: 'FUNDED' }
});

// Aggregate
const stats = await db.deal.aggregate({
  where: { status: 'FUNDED' },
  _sum: { approvedAmount: true },
  _avg: { factorRate: true },
  _count: true
});
```

### UPDATE

```typescript
// Update one
const updatedDeal = await db.deal.update({
  where: { id: dealId },
  data: {
    status: 'APPROVED',
    approvedAmount: 45000,
    factorRate: 1.25
  }
});

// Update many
const result = await db.payment.updateMany({
  where: {
    dueDate: { lt: new Date() },
    status: 'PENDING'
  },
  data: { status: 'OVERDUE' }
});

// Upsert (update or create)
const merchant = await db.merchant.upsert({
  where: { email: 'merchant@example.com' },
  update: { monthlyRevenue: 80000 },
  create: {
    businessName: 'New Business',
    ownerName: 'Owner Name',
    email: 'merchant@example.com',
    phone: '555-1234',
    organizationId: orgId
  }
});
```

### DELETE

```typescript
// Delete one
const deleted = await db.contact.delete({
  where: { id: contactId }
});

// Delete many
const result = await db.activity.deleteMany({
  where: {
    status: 'COMPLETED',
    completedAt: { lt: new Date('2023-01-01') }
  }
});
```

## Relations & Includes

### Including Relations

```typescript
// Include all fields of relation
const dealWithRelations = await db.deal.findUnique({
  where: { id: dealId },
  include: {
    merchant: true,
    broker: true,
    user: true,
    payments: true,
    documents: true
  }
});

// Select specific fields
const dealWithSelect = await db.deal.findUnique({
  where: { id: dealId },
  select: {
    dealNumber: true,
    status: true,
    merchant: {
      select: {
        businessName: true,
        ownerName: true,
        email: true
      }
    },
    payments: {
      where: { status: 'OVERDUE' },
      select: {
        amount: true,
        dueDate: true
      }
    }
  }
});

// Nested includes
const organization = await db.organization.findUnique({
  where: { id: orgId },
  include: {
    users: {
      include: {
        deals: {
          include: {
            merchant: true
          }
        }
      }
    }
  }
});
```

### Working with Relations

```typescript
// Connect existing relation
await db.deal.update({
  where: { id: dealId },
  data: {
    broker: {
      connect: { id: brokerId }
    }
  }
});

// Disconnect relation
await db.deal.update({
  where: { id: dealId },
  data: {
    broker: {
      disconnect: true
    }
  }
});

// Create with nested relations
const merchant = await db.merchant.create({
  data: {
    businessName: 'New Business',
    ownerName: 'John Doe',
    email: 'john@business.com',
    phone: '555-1234',
    organizationId: orgId,
    deals: {
      create: {
        dealNumber: 'DEAL-NEW-001',
        status: 'PENDING',
        requestedAmount: 50000,
        organizationId: orgId,
        userId: userId
      }
    }
  },
  include: {
    deals: true
  }
});
```

## Advanced Queries

### Complex Filtering

```typescript
// OR conditions
const deals = await db.deal.findMany({
  where: {
    OR: [
      { status: 'FUNDED' },
      { approvedAmount: { gte: 100000 } },
      { merchant: { riskScore: { gte: 700 } } }
    ]
  }
});

// AND conditions
const merchants = await db.merchant.findMany({
  where: {
    AND: [
      { status: 'ACTIVE' },
      { monthlyRevenue: { gte: 50000 } },
      { yearsInBusiness: { gte: 2 } }
    ]
  }
});

// NOT conditions
const contacts = await db.contact.findMany({
  where: {
    NOT: {
      status: 'BLOCKED'
    }
  }
});

// Combining conditions
const complexQuery = await db.deal.findMany({
  where: {
    AND: [
      { status: { in: ['FUNDED', 'APPROVED'] } },
      {
        OR: [
          { requestedAmount: { gte: 50000 } },
          { merchant: { riskScore: { gte: 700 } } }
        ]
      },
      {
        NOT: {
          broker: null
        }
      }
    ]
  }
});
```

### String Filtering

```typescript
const merchants = await db.merchant.findMany({
  where: {
    businessName: {
      contains: 'Pizza',    // Case-sensitive
      // startsWith: 'Tech',
      // endsWith: 'LLC',
    }
  }
});

// Case-insensitive (PostgreSQL)
const merchants = await db.merchant.findMany({
  where: {
    businessName: {
      contains: 'pizza',
      mode: 'insensitive'
    }
  }
});
```

### Date Filtering

```typescript
const recentDeals = await db.deal.findMany({
  where: {
    createdAt: {
      gte: new Date('2024-01-01'),
      lt: new Date('2024-12-31')
    }
  }
});

// Last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentActivities = await db.activity.findMany({
  where: {
    createdAt: { gte: thirtyDaysAgo }
  }
});
```

### Pagination

```typescript
async function getPaginatedDeals(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [deals, total] = await Promise.all([
    db.deal.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: true,
        broker: true
      }
    }),
    db.deal.count()
  ]);

  return {
    deals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### Full-Text Search

```typescript
// Search across multiple fields
const searchResults = await db.merchant.findMany({
  where: {
    OR: [
      { businessName: { contains: searchTerm, mode: 'insensitive' } },
      { ownerName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }
});
```

## Transactions

### Interactive Transactions

```typescript
// Transfer deal from one user to another
const result = await db.$transaction(async (prisma) => {
  // Step 1: Update deal
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { userId: newUserId }
  });

  // Step 2: Create activity log
  const activity = await prisma.activity.create({
    data: {
      type: 'DEAL_UPDATE',
      title: 'Deal transferred',
      description: `Deal transferred to new user`,
      dealId: deal.id,
      userId: newUserId,
      organizationId: deal.organizationId,
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });

  // Step 3: Update metrics
  const oldUserMetrics = await prisma.user.update({
    where: { id: oldUserId },
    data: { /* update metrics */ }
  });

  return { deal, activity };
});
```

### Sequential Transactions

```typescript
// Create deal with all related entities
const [merchant, broker, deal] = await db.$transaction([
  db.merchant.create({ data: merchantData }),
  db.broker.create({ data: brokerData }),
  db.deal.create({ data: dealData })
]);
```

## Best Practices

### 1. Use Proper Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  const user = await db.user.create({
    data: userData
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists');
    }
    if (error.code === 'P2025') {
      // Record not found
      throw new Error('Record not found');
    }
  }
  throw error;
}
```

### 2. Use Select to Minimize Data Transfer

```typescript
// Bad - fetches all fields
const users = await db.user.findMany();

// Good - only fetch needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true
  }
});
```

### 3. Use Indexes for Performance

```prisma
model Deal {
  // ... fields
  
  @@index([status, createdAt])
  @@index([merchantId, status])
  @@index([userId, createdAt])
}
```

### 4. Batch Operations

```typescript
// Bad - N+1 queries
for (const payment of payments) {
  await db.payment.update({
    where: { id: payment.id },
    data: { status: 'PAID' }
  });
}

// Good - Single query
await db.payment.updateMany({
  where: { id: { in: paymentIds } },
  data: { status: 'PAID' }
});
```

### 5. Use Middleware for Common Logic

```typescript
// In lib/db.ts
prisma.$use(async (params, next) => {
  if (params.model === 'User' && params.action === 'create') {
    // Hash password before saving
    params.args.data.password = await hashPassword(params.args.data.password);
  }
  
  const result = await next(params);
  
  // Log all database operations
  console.log(`${params.model}.${params.action}`, result);
  
  return result;
});
```

### 6. Type Safety

```typescript
import { Deal, Merchant, Prisma } from '@prisma/client';

// Use generated types
type DealWithMerchant = Deal & {
  merchant: Merchant;
};

// Use Prisma namespace for input types
type DealCreateInput = Prisma.DealCreateInput;
type DealWhereInput = Prisma.DealWhereInput;

// Type-safe queries
async function getDealsbyStatus(
  status: Prisma.EnumDealStatusFilter
): Promise<Deal[]> {
  return db.deal.findMany({ where: { status } });
}
```

### 7. Connection Management

```typescript
// Singleton pattern (already in lib/db.ts)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Clean shutdown
process.on('beforeExit', async () => {
  await db.$disconnect();
});
```

## Common Patterns

### Soft Deletes

```typescript
// Add deletedAt field to model
model Contact {
  // ... other fields
  deletedAt DateTime?
}

// Query only non-deleted
const activeContacts = await db.contact.findMany({
  where: { deletedAt: null }
});

// Soft delete
await db.contact.update({
  where: { id: contactId },
  data: { deletedAt: new Date() }
});
```

### Audit Trail

```typescript
async function createDealWithAudit(dealData: any, userId: string) {
  return db.$transaction(async (prisma) => {
    const deal = await prisma.deal.create({
      data: dealData
    });

    await prisma.activity.create({
      data: {
        type: 'DEAL_UPDATE',
        title: 'Deal created',
        description: `Deal ${deal.dealNumber} created`,
        dealId: deal.id,
        userId: userId,
        organizationId: deal.organizationId,
        status: 'COMPLETED',
        completedAt: new Date(),
        metadata: { dealData }
      }
    });

    return deal;
  });
}
```

### Computed Fields

```typescript
// Extend Prisma result
async function getDealWithMetrics(dealId: string) {
  const deal = await db.deal.findUnique({
    where: { id: dealId },
    include: {
      payments: true
    }
  });

  if (!deal) return null;

  const totalPaid = deal.payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = deal.payments
    .filter(p => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    ...deal,
    metrics: {
      totalPaid,
      totalOverdue,
      completionPercentage: (totalPaid / (deal.totalPayback || 1)) * 100
    }
  };
}
```