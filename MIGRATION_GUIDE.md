# Prisma Migration Guide for DealSphere

## Understanding Prisma Migrations

Prisma migrations work by tracking changes to your `schema.prisma` file and creating SQL migration files that transform your database schema.

## Key Concepts

### 1. Migration Files
- Stored in `prisma/migrations/`
- Named with timestamp + descriptive name
- Contains SQL to transform database
- Tracked in git for team collaboration

### 2. Migration States
- **Development**: Flexible, can be reset
- **Production**: Forward-only, no data loss

## Core Commands Explained

### Development Workflow

#### 1. First-Time Setup
```bash
# Start your database
docker-compose up -d

# Create initial migration and apply it
npm run db:migrate:dev -- --name init

# This will:
# - Create migration file in prisma/migrations/
# - Apply migration to database
# - Generate Prisma Client
```

#### 2. Making Schema Changes
```bash
# Edit schema.prisma file
# Then create and apply migration
npm run db:migrate:dev -- --name add_user_fields

# Or create migration without applying (to review SQL first)
npm run db:migrate:create -- --name add_user_fields
# Review the SQL in prisma/migrations/
# Then apply it
npm run db:migrate:dev
```

#### 3. Quick Prototyping (No Migration File)
```bash
# Push schema changes directly to DB (dev only!)
npm run db:push

# Warning: This doesn't create migration files
# Use only for rapid prototyping
```

#### 4. Reset Database (Dev Only)
```bash
# Drop database, recreate, apply all migrations, run seed
npm run db:reset

# This will:
# - Drop all tables
# - Apply all migrations from scratch
# - Run seed file if exists
```

### Production Workflow

#### Deploy Migrations
```bash
# Apply pending migrations in production
npm run db:migrate:prod

# This only applies migrations, doesn't create new ones
# Safe for production - forward only
```

#### Check Migration Status
```bash
# See which migrations are pending
npm run db:migrate:status
```

## Common Scenarios

### Scenario 1: Adding a New Field
```prisma
// In schema.prisma, add to User model:
phoneNumber String?
```
```bash
npm run db:migrate:dev -- --name add_phone_to_user
```

### Scenario 2: Creating a New Model
```prisma
model Note {
  id        String   @id @default(cuid())
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```
```bash
npm run db:migrate:dev -- --name create_notes_table
```

### Scenario 3: Renaming a Field
```prisma
// Change: firstName -> givenName
model User {
  givenName String // was firstName
}
```
```bash
# Create migration without applying
npm run db:migrate:create -- --name rename_firstname_to_givenname

# Edit the migration SQL to handle data migration
# Then apply
npm run db:migrate:dev
```

### Scenario 4: Adding Required Field to Existing Table
```bash
# First, add as optional
# Apply migration
# Backfill data
# Then make required
# Apply second migration
```

## Utilities

### Prisma Studio (Database GUI)
```bash
npm run db:studio
# Opens at http://localhost:5555
# Visual database editor
```

### Generate Prisma Client
```bash
npm run db:generate
# Regenerates TypeScript types
# Run after schema changes
```

### Format Schema File
```bash
npm run db:format
# Auto-formats schema.prisma
```

## Migration Best Practices

1. **Always Review Migration SQL**
   - Check prisma/migrations/ folder
   - Ensure SQL does what you expect

2. **Name Migrations Descriptively**
   ```bash
   # Good
   npm run db:migrate:dev -- --name add_stripe_customer_id_to_users
   
   # Bad
   npm run db:migrate:dev -- --name update
   ```

3. **Handle Data Migrations Carefully**
   - For complex data transformations, create custom migration
   - Test on copy of production data first

4. **Never Edit Applied Migrations**
   - Once applied, migrations are immutable
   - Create new migration to fix issues

5. **Commit Migration Files**
   - Always commit prisma/migrations to git
   - Team members need same migrations

## Troubleshooting

### Migration Failed
```bash
# Check status
npm run db:migrate:status

# If needed, mark as applied (careful!)
npx prisma migrate resolve --applied "20240101000000_migration_name"

# Or rollback (dev only)
npm run db:reset
```

### Out of Sync
```bash
# Database doesn't match schema
npm run db:push --force-reset
# Warning: Can cause data loss
```

### Production Emergency
```bash
# Create hotfix migration locally
# Test thoroughly
# Deploy with: npm run db:migrate:prod
```

## Team Collaboration

1. **Pull migrations from git**
2. **Run `npm run db:migrate:dev`** to apply team's migrations
3. **Create your schema changes**
4. **Generate migration**
5. **Commit and push migration files**

## Example Full Workflow

```bash
# 1. Start database
docker-compose up -d

# 2. Initial setup (first time only)
npm run db:migrate:dev -- --name init

# 3. Make schema change in schema.prisma

# 4. Create migration
npm run db:migrate:dev -- --name your_change_description

# 5. Seed database (optional)
npm run db:seed

# 6. Open Studio to verify
npm run db:studio

# 7. Commit changes
git add prisma/
git commit -m "Add migration: your_change_description"
```