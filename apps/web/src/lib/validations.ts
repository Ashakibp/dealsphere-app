import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const idParamSchema = z.object({
  id: z.string().min(1)
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().min(1).optional()
});

// User schemas
export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().optional()
});

// Deal schemas
export const createDealSchema = z.object({
  merchantId: z.string().min(1),
  brokerId: z.string().min(1).optional(),
  requestedAmount: z.number().positive(),
  term: z.number().int().positive().optional(),
  notes: z.string().optional()
});

export const updateDealSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDERWRITING',
    'APPROVED',
    'FUNDED',
    'REJECTED',
    'PAID_OFF',
    'DEFAULTED'
  ]).optional(),
  approvedAmount: z.number().positive().optional(),
  factorRate: z.number().positive().optional(),
  term: z.number().int().positive().optional(),
  dailyPayment: z.number().positive().optional(),
  totalPayback: z.number().positive().optional(),
  fundedDate: z.string().datetime().optional(),
  maturityDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

// Merchant schemas
export const createMerchantSchema = z.object({
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().min(5).optional(),
  industry: z.string().optional(),
  monthlyRevenue: z.number().positive().optional(),
  yearsInBusiness: z.number().int().min(0).optional()
});

export const updateMerchantSchema = createMerchantSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'FLAGGED', 'SUSPENDED']).optional()
});

// Broker schemas
export const createBrokerSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().min(5).optional(),
  commissionRate: z.number().min(0).max(1).default(0.03),
  specialties: z.array(z.string()).default([])
});

export const updateBrokerSchema = createBrokerSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  tier: z.enum(['GOLD', 'SILVER', 'BRONZE', 'NEW']).optional(),
  rating: z.number().min(0).max(5).optional()
});

// Contact schemas
export const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['MERCHANT', 'BROKER', 'LEAD', 'PARTNER', 'VENDOR']).default('LEAD'),
  source: z.enum([
    'REFERRAL',
    'WEBSITE',
    'EVENT',
    'COLD_OUTREACH',
    'SOCIAL_MEDIA',
    'ADVERTISEMENT',
    'OTHER'
  ]).default('OTHER'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional()
});

export const updateContactSchema = createContactSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'POTENTIAL', 'BLOCKED']).optional(),
  relationshipScore: z.number().min(0).max(100).optional(),
  dealsPotential: z.number().int().min(0).optional()
});

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; errors?: z.ZodError }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error };
    }
    throw error;
  }
}

// Helper function to validate query params
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data?: T; errors?: z.ZodError } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error };
    }
    throw error;
  }
}