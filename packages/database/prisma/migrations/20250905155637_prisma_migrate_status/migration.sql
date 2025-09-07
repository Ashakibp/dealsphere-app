-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "public"."DealStatus" AS ENUM ('PENDING', 'UNDERWRITING', 'APPROVED', 'FUNDED', 'REJECTED', 'PAID_OFF', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "public"."MerchantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FLAGGED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."BrokerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."BrokerTier" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'NEW');

-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('MERCHANT', 'BROKER', 'LEAD', 'PARTNER', 'VENDOR');

-- CreateEnum
CREATE TYPE "public"."ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'POTENTIAL', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."ContactSource" AS ENUM ('REFERRAL', 'WEBSITE', 'EVENT', 'COLD_OUTREACH', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('BANK_STATEMENT', 'TAX_RETURN', 'CREDIT_REPORT', 'DRIVER_LICENSE', 'BUSINESS_LICENSE', 'VOIDED_CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('DEAL_UPDATE', 'PAYMENT', 'DOCUMENT', 'EMAIL', 'TEXT_MESSAGE', 'PHONE_CALL', 'MEETING', 'TASK', 'AI_ACTION', 'RISK_ALERT', 'APPROVAL', 'FOLLOW_UP', 'LEAD_QUALIFICATION', 'LEAD_RESEARCH', 'LEAD_CONVERSION');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."RiskAlertType" AS ENUM ('PAYMENT_DELAY', 'NSF_INCREASE', 'CREDIT_DECLINE', 'UNUSUAL_ACTIVITY', 'FRAUD_INDICATOR');

-- CreateEnum
CREATE TYPE "public"."RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."InsightType" AS ENUM ('OPPORTUNITY', 'RISK', 'ACHIEVEMENT', 'OPTIMIZATION');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AIAgentType" AS ENUM ('RISK_ASSESSMENT', 'DEAL_SOURCING', 'UNDERWRITING', 'MONITORING', 'OPTIMIZATION', 'CUSTOMER_SERVICE', 'DOCUMENT_ANALYSIS', 'LEAD_PROCESSOR', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('DRAFT', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TextStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'UNDELIVERED');

-- CreateEnum
CREATE TYPE "public"."TextProvider" AS ENUM ('TWILIO', 'SENDGRID', 'AMAZON_SNS');

-- CreateEnum
CREATE TYPE "public"."MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER');

-- CreateEnum
CREATE TYPE "public"."CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."CallProvider" AS ENUM ('TWILIO', 'VONAGE', 'BANDWIDTH');

-- CreateEnum
CREATE TYPE "public"."CallOutcome" AS ENUM ('CONNECTED', 'VOICEMAIL', 'NO_ANSWER', 'BUSY', 'FAILED', 'INTERESTED', 'NOT_INTERESTED', 'CALLBACK_REQUESTED', 'DEAL_CLOSED');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('WEBSITE', 'PHONE', 'EMAIL', 'SPREADSHEET_UPLOAD', 'API', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LeadStage" AS ENUM ('NEW', 'RESEARCHING', 'CONTACTED', 'QUALIFYING', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "public"."ResearchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'HANDOFF', 'FAILED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "isAIAgent" BOOLEAN NOT NULL DEFAULT false,
    "aiType" "public"."AIAgentType",
    "version" TEXT,
    "capabilities" TEXT[],
    "configuration" JSONB,
    "performance" JSONB,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deals" (
    "id" TEXT NOT NULL,
    "dealNumber" TEXT NOT NULL,
    "status" "public"."DealStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "factorRate" DOUBLE PRECISION,
    "term" INTEGER,
    "dailyPayment" DOUBLE PRECISION,
    "totalPayback" DOUBLE PRECISION,
    "fundedDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "riskScore" DOUBLE PRECISION,
    "aiScore" DOUBLE PRECISION,
    "aiRecommendation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "merchantId" TEXT NOT NULL,
    "brokerId" TEXT,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."merchants" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "industry" TEXT,
    "monthlyRevenue" DOUBLE PRECISION,
    "yearsInBusiness" INTEGER,
    "riskScore" DOUBLE PRECISION,
    "status" "public"."MerchantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brokers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "tier" "public"."BrokerTier" NOT NULL DEFAULT 'NEW',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "status" "public"."BrokerStatus" NOT NULL DEFAULT 'ACTIVE',
    "specialties" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "location" TEXT,
    "type" "public"."ContactType" NOT NULL DEFAULT 'LEAD',
    "status" "public"."ContactStatus" NOT NULL DEFAULT 'POTENTIAL',
    "relationshipScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dealsPotential" INTEGER NOT NULL DEFAULT 0,
    "source" "public"."ContactSource" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "notes" TEXT,
    "lastContactDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "priority" "public"."Priority" NOT NULL DEFAULT 'LOW',
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "dealId" TEXT,
    "contactId" TEXT,
    "merchantId" TEXT,
    "leadId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."emails" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "bcc" TEXT[],
    "replyTo" TEXT,
    "threadId" TEXT,
    "messageId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "emailStatus" "public"."EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."texts" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "provider" "public"."TextProvider" NOT NULL DEFAULT 'TWILIO',
    "messageId" TEXT,
    "status" "public"."TextStatus" NOT NULL DEFAULT 'PENDING',
    "direction" "public"."MessageDirection" NOT NULL DEFAULT 'OUTBOUND',
    "mediaUrls" TEXT[],
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "segments" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."phones" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "direction" "public"."CallDirection" NOT NULL DEFAULT 'OUTBOUND',
    "status" "public"."CallStatus" NOT NULL DEFAULT 'INITIATED',
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "transcription" TEXT,
    "voicemailUrl" TEXT,
    "callSid" TEXT,
    "provider" "public"."CallProvider" NOT NULL DEFAULT 'TWILIO',
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "outcome" "public"."CallOutcome",
    "answeredAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_alerts" (
    "id" TEXT NOT NULL,
    "type" "public"."RiskAlertType" NOT NULL,
    "severity" "public"."RiskSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT,
    "merchantId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "risk_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_insights" (
    "id" TEXT NOT NULL,
    "type" "public"."InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "priority" "public"."Priority" NOT NULL DEFAULT 'LOW',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bank_statements" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "avgDailyBalance" DOUBLE PRECISION NOT NULL,
    "deposits" DOUBLE PRECISION NOT NULL,
    "withdrawals" DOUBLE PRECISION NOT NULL,
    "nsfFees" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credit_reports" (
    "id" TEXT NOT NULL,
    "creditScore" INTEGER,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "tradelines" JSONB,
    "inquiries" JSONB,
    "collections" JSONB,
    "bankruptcies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "credit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commissions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "dealAmount" DOUBLE PRECISION NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brokerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."broker_relations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,

    CONSTRAINT "broker_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."merchant_relations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,

    CONSTRAINT "merchant_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "businessName" TEXT,
    "requestedAmount" DOUBLE PRECISION,
    "monthlyRevenue" DOUBLE PRECISION,
    "industry" TEXT,
    "source" "public"."LeadSource" NOT NULL,
    "stage" "public"."LeadStage" NOT NULL DEFAULT 'NEW',
    "extraData" JSONB,
    "researchData" JSONB,
    "researchStatus" "public"."ResearchStatus" NOT NULL DEFAULT 'PENDING',
    "researchedAt" TIMESTAMP(3),
    "importBatchId" TEXT,
    "originalRow" JSONB,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "convertedToContactId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_assignments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "reason" TEXT,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "lead_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "deals_dealNumber_key" ON "public"."deals"("dealNumber");

-- CreateIndex
CREATE UNIQUE INDEX "brokers_email_key" ON "public"."brokers"("email");

-- CreateIndex
CREATE INDEX "activities_type_status_scheduledAt_idx" ON "public"."activities"("type", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "activities_userId_createdAt_idx" ON "public"."activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activities_dealId_createdAt_idx" ON "public"."activities"("dealId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "emails_activityId_key" ON "public"."emails"("activityId");

-- CreateIndex
CREATE INDEX "emails_from_to_sentAt_idx" ON "public"."emails"("from", "to", "sentAt");

-- CreateIndex
CREATE INDEX "emails_threadId_idx" ON "public"."emails"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "texts_activityId_key" ON "public"."texts"("activityId");

-- CreateIndex
CREATE INDEX "texts_from_to_status_idx" ON "public"."texts"("from", "to", "status");

-- CreateIndex
CREATE UNIQUE INDEX "phones_activityId_key" ON "public"."phones"("activityId");

-- CreateIndex
CREATE INDEX "phones_from_to_status_idx" ON "public"."phones"("from", "to", "status");

-- CreateIndex
CREATE INDEX "phones_callSid_idx" ON "public"."phones"("callSid");

-- CreateIndex
CREATE UNIQUE INDEX "broker_relations_userId_brokerId_key" ON "public"."broker_relations"("userId", "brokerId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_relations_userId_merchantId_key" ON "public"."merchant_relations"("userId", "merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_convertedToContactId_key" ON "public"."leads"("convertedToContactId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deals" ADD CONSTRAINT "deals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."merchants" ADD CONSTRAINT "merchants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brokers" ADD CONSTRAINT "brokers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."emails" ADD CONSTRAINT "emails_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."texts" ADD CONSTRAINT "texts_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."phones" ADD CONSTRAINT "phones_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_alerts" ADD CONSTRAINT "risk_alerts_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_alerts" ADD CONSTRAINT "risk_alerts_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_alerts" ADD CONSTRAINT "risk_alerts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_insights" ADD CONSTRAINT "ai_insights_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_insights" ADD CONSTRAINT "ai_insights_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_statements" ADD CONSTRAINT "bank_statements_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_statements" ADD CONSTRAINT "bank_statements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_reports" ADD CONSTRAINT "credit_reports_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_reports" ADD CONSTRAINT "credit_reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commissions" ADD CONSTRAINT "commissions_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."brokers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commissions" ADD CONSTRAINT "commissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."broker_relations" ADD CONSTRAINT "broker_relations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."broker_relations" ADD CONSTRAINT "broker_relations_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."brokers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."merchant_relations" ADD CONSTRAINT "merchant_relations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."merchant_relations" ADD CONSTRAINT "merchant_relations_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_convertedToContactId_fkey" FOREIGN KEY ("convertedToContactId") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_assignments" ADD CONSTRAINT "lead_assignments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_assignments" ADD CONSTRAINT "lead_assignments_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
