# DealSphere Monorepo

A modern Turborepo-based monorepo for the DealSphere application, featuring automated lead research with AI agents, background job processing, and a comprehensive lead management system.

## 🏗️ Architecture Overview

This project has been transformed from a single Next.js application into a fully-featured monorepo with separate applications and shared packages:

```
dealsphere-app/
├── apps/
│   ├── web/          # Next.js web application (main frontend)
│   └── jobs/         # Background workers service (standalone executable)
├── packages/
│   ├── database/     # Prisma client and database schemas
│   ├── shared/       # Shared utilities, services, and types
│   └── tsconfig/     # Shared TypeScript configuration
├── turbo.json        # Turborepo pipeline configuration
└── package.json      # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/dealsphere?schema=public"
   
   # AI Configuration
   OPENAI_API_KEY="your-openai-api-key"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   
   # Environment
   NODE_ENV="development"
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development servers:**
   ```bash
   # Start web app only
   npm run dev:web
   
   # Start jobs service only
   npm run dev:jobs
   
   # Start both (in separate terminals)
   npm run dev
   ```

## 📦 Applications & Packages

### Apps

#### 🌐 Web App (`apps/web`)
- **Framework:** Next.js 15.5.2 with Turbopack
- **Features:**
  - AI Lead Intake with intelligent field mapping
  - Real-time lead status tracking
  - Background research status monitoring
  - Spreadsheet upload with CSV/Excel support
  - Automated lead assignment to AI agents
- **Port:** http://localhost:3000

#### ⚙️ Jobs Service (`apps/jobs`)
- **Purpose:** Background job processing and AI research workers
- **Features:**
  - Research Worker: Automatically processes leads every 45 seconds
  - Parallel processing of up to 5 leads at once
  - OpenAI integration for company research
  - Activity logging and status tracking
  - Graceful shutdown handling
- **Standalone executable:** Can run independently of web app

### Packages

#### 🗄️ Database (`packages/database`)
- **Technology:** Prisma ORM with PostgreSQL
- **Features:**
  - Centralized database client
  - Environment variable auto-loading with smart path resolution
  - Global singleton pattern for development
  - Complete schema definitions for leads, users, activities
- **Exports:** `db` (PrismaClient), all Prisma types

#### 🔧 Shared (`packages/shared`)
- **Purpose:** Common utilities and services across applications
- **Key Exports:**
  - `researchWorker`: Background research processing
  - `analyzeHeaders`, `processRow`: AI-powered field mapping
  - `FieldMapping`, `ResearchResult`: TypeScript types
- **Features:**
  - OpenAI integration for field analysis
  - Intelligent CSV/Excel header mapping
  - Research workflow management

#### 📋 TSConfig (`packages/tsconfig`)
- **Purpose:** Shared TypeScript configuration
- **Provides:** Base configurations for apps and packages

## 🤖 AI Features

### Intelligent Field Mapping
- **Technology:** OpenAI GPT-4 with structured output
- **Capability:** Automatically maps CSV/Excel headers to database fields
- **Flexibility:** Handles variations, abbreviations, and different formats
- **Fallback:** Regex-based mapping if AI fails

### Automated Research Workers
- **Frequency:** Processes leads every 45 seconds
- **Concurrency:** Up to 5 leads processed simultaneously
- **Intelligence:** 
  - Company information research
  - Industry classification
  - Revenue estimation
  - Contact validation
- **Activity Tracking:** Comprehensive logging of all research activities

### Research Pipeline
1. **Lead Assignment:** Automatic assignment to AI agents
2. **Research Initiation:** Background worker picks up pending leads
3. **AI Processing:** OpenAI analysis of business information
4. **Data Enhancement:** Updates lead records with discovered information
5. **Activity Logging:** Creates detailed activity trail
6. **Status Updates:** Real-time status updates in UI

## 🛠️ Development

### Available Scripts

#### Root Level
```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev:web         # Start web app only
npm run dev:jobs        # Start jobs service only

# Building
npm run build           # Build all packages
npm run build:web       # Build web app only
npm run build:jobs      # Build jobs service only

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Lint all packages
npm run type-check      # TypeScript type checking
npm run clean           # Clean build artifacts
```

#### Package-Specific Scripts
```bash
# Database operations (from any directory)
turbo db:generate --filter=@dealsphere/database
turbo db:push --filter=@dealsphere/database

# Development with filtering
turbo dev --filter=@dealsphere/web
turbo dev --filter=@dealsphere/jobs
```

### Environment Variable Handling

The monorepo uses a sophisticated environment variable loading system:

1. **Root `.env` file:** Single source of truth for all environment variables
2. **Smart path resolution:** Automatically finds `.env` from different working directories
3. **Package-level loading:** Database and jobs packages load environment variables independently
4. **Fallback paths:** Multiple path attempts ensure reliable loading across contexts
5. **Debug logging:** Detailed path resolution logging for troubleshooting

### Database Schema

Key entities include:
- **Lead:** Core lead information with research status tracking
- **User:** Human users and AI agents with role-based permissions
- **Activity:** Comprehensive activity logging for all lead interactions
- **Assignment:** Lead assignment tracking with history
- **Organization:** Multi-tenant organization support

## 🔄 Workflow

### Lead Processing Workflow
1. **Upload:** User uploads CSV/Excel file
2. **Field Mapping:** AI analyzes and maps headers to database fields
3. **Import:** Leads imported with automatic AI agent assignment
4. **Research Queue:** Leads marked as `PENDING` for research
5. **Background Processing:** Research worker picks up and processes leads
6. **AI Research:** OpenAI analyzes company information
7. **Data Enhancement:** Lead records updated with research findings
8. **Activity Logging:** All steps logged for audit trail
9. **Status Updates:** UI reflects real-time processing status

### Research Status Flow
```
PENDING → IN_PROGRESS → COMPLETED
                    ↘ FAILED
```

## 🏛️ Architecture Decisions

### Monorepo Benefits
- **Code Sharing:** Common utilities and types shared across apps
- **Consistent Dependencies:** Unified version management
- **Atomic Changes:** Cross-application changes in single commits
- **Simplified Deployment:** Coordinated releases

### Turborepo Advantages
- **Intelligent Caching:** Faster builds with cache optimization
- **Parallel Processing:** Simultaneous package building
- **Dependency Awareness:** Proper build ordering
- **Remote Caching:** Team-wide build acceleration (configurable)

### Environment Variable Strategy
- **Single Source:** Root `.env` file prevents configuration drift
- **Smart Loading:** Robust path resolution for different execution contexts
- **Package Independence:** Each package loads environment variables as needed
- **Debugging Support:** Comprehensive logging for troubleshooting

## 🚨 Migration History

This project was migrated from a single Next.js application to a monorepo. Key transformations:

### Import Path Updates
- `@/lib/db` → `@dealsphere/database`
- `@/lib/field-mapper` → `@dealsphere/shared`
- `@/services/research-worker` → `@dealsphere/shared`

### Package Structure Changes
- Web app moved from root to `apps/web/`
- Background services extracted to `apps/jobs/`
- Common code centralized in `packages/shared/`
- Database client isolated in `packages/database/`

### Configuration Updates
- Turborepo pipeline configuration in `turbo.json`
- Workspace dependencies using `file:` protocol for npm compatibility
- Environment variable loading implemented in each package
- TypeScript path mapping updated for monorepo structure

### Build System Migration
- From single Next.js build to Turborepo pipeline
- Parallel builds with dependency awareness
- Individual package building capabilities
- Caching optimization for faster development

## 📝 Contributing

1. **Development Setup:** Follow the Getting Started guide
2. **Code Style:** Use provided ESLint and TypeScript configurations
3. **Database Changes:** Update Prisma schema and run migrations
4. **Environment Variables:** Update root `.env.example` for new variables
5. **Testing:** Ensure both web app and jobs service work independently
6. **Commits:** Make atomic changes that work across the monorepo

## 🔧 Troubleshooting

### Environment Variables Not Loading
- Ensure `.env` file exists in project root
- Check database package logs for path resolution details (`[DATABASE]` prefix)
- Verify file permissions on `.env` file
- Check working directory context: `process.cwd()` vs `__dirname`

### Build Failures
- Run `npm run clean` to clear build cache
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`
- Verify Turbo cache: delete `node_modules/.cache/turbo`

### Database Connection Issues
- Verify `DATABASE_URL` in `.env` file
- Ensure PostgreSQL is running
- Run `npm run db:generate` after schema changes
- Check Prisma client initialization logs

### Jobs Service Issues
- Verify OpenAI API key is valid
- Check research worker interval settings
- Monitor activity logs in database
- Ensure AI agents exist in database

## 📊 Performance

- **Build Cache:** Turborepo caching reduces build times by 60-80%
- **Parallel Processing:** Jobs service processes 5 leads simultaneously
- **Incremental Builds:** Only changed packages rebuild
- **Hot Reload:** Fast development with Turbopack
- **Smart Dependencies:** Packages only rebuild when dependencies change

## 🔐 Security

- **Environment Variables:** Sensitive data in `.env` files (not committed)
- **API Keys:** OpenAI keys loaded securely with validation
- **Database:** Prisma ORM prevents SQL injection
- **Type Safety:** Full TypeScript coverage prevents runtime errors
- **Input Validation:** Zod schemas for API validation

## 🗂️ Additional Documentation

- **DATABASE_SCHEMA.md:** Complete database schema documentation
- **MIGRATION_GUIDE.md:** Database migration procedures
- **PRISMA_USAGE_GUIDE.md:** Prisma ORM usage patterns
- **RESEARCH_SYSTEM.md:** AI research system architecture

---

**Built with:** Turborepo, Next.js 15, Prisma, PostgreSQL, OpenAI GPT-4, TypeScript

**Migration Completed:** Single Next.js app → Full-featured monorepo with AI workers
