# LuxeHair Setup Guide

This guide will help you get the LuxeHair e-commerce platform up and running.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager (`npm install -g pnpm`)
- Neon PostgreSQL account or self-hosted PostgreSQL
- A code editor (VS Code recommended)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd luxehair

# Install dependencies
pnpm install
```

## Step 2: Set Up Database

### Option A: Neon (Recommended)

1. Go to [Neon](https://neon.tech)
2. Create a new database project
3. Copy the connection string
4. It should look like: `postgresql://user:password@ep-xxx.region.neon.tech/neondb`

### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```bash
   createdb luxehair
   ```
3. Connection string: `postgresql://user:password@localhost:5432/luxehair`

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (copy from Neon or your local setup)
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-generated-secret-here

# Auth URL (for local development)
BETTER_AUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate BETTER_AUTH_SECRET

Run this command to generate a secure random secret:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

## Step 4: Initialize Database Schema

The database schema has already been set up through Neon MCP during development. If you need to reset:

```bash
# List current tables
psql $DATABASE_URL -c "\dt"

# The following tables should exist:
# - user, session, account, verification (auth)
# - categories, products, productAttributes
# - cartItems, wishlistItems
# - orders, orderItems, deliveryTracking
# - reviews, coupons, analytics, adminUsers, frequentlyBoughtTogether
```

## Step 5: Run Development Server

```bash
pnpm dev
```

The application will start at `http://localhost:3000`

## Step 6: Create Test Account

1. Visit `http://localhost:3000/sign-up`
2. Enter an email and password (min 8 characters)
3. Create account and sign in

## Step 7: Admin Setup

To access the admin panel, you'll need to set a user as admin in the database:

```sql
-- Connect to your database
psql $DATABASE_URL

-- Create or modify a user to be admin
INSERT INTO "adminUsers" (id, "userId", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'YOUR_USER_ID',
  'admin',
  true,
  now(),
  now()
);
```

Then visit `http://localhost:3000/admin`

## Common Issues & Solutions

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- For Neon: Ensure database is active

### Auth Error: "BETTER_AUTH_SECRET not set"

**Problem**: Authentication fails on startup

**Solution**:
```bash
# Generate new secret
openssl rand -base64 32

# Update .env.local with the generated value
BETTER_AUTH_SECRET=<paste-generated-value>

# Restart dev server
pnpm dev
```

### Module Not Found Errors

**Problem**: `Module not found: can't resolve '@/lib/...`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

## Seed Database with Sample Data

To add sample products and categories:

```bash
# Create a new file: scripts/seed.ts
# Then run:
pnpm ts-node scripts/seed.ts
```

Example seed script structure (create if needed):

```typescript
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'

async function seed() {
  // Add categories
  // Add products
  // Add reviews
  console.log('Seeding complete!')
}

seed().catch(console.error)
```

## Project Structure Reference

```
/app                 # Next.js app routes and pages
  /api              # API endpoints
  /admin            # Admin pages
  /products         # Product pages
  /orders           # Order pages
  layout.tsx        # Root layout

/components          # React components
  /ui               # Reusable UI components
  
/lib                 # Utilities and configs
  /db               # Database setup
  auth.ts           # Authentication config
  store.ts          # Global state (Zustand)
  constants.ts      # App constants
  
/public              # Static files
middleware.ts        # Route middleware
```

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Edit components in `/components`
   - Add pages in `/app`
   - Update database operations in actions

3. **Test locally**
   ```bash
   pnpm dev
   ```

4. **Format and lint**
   ```bash
   pnpm format
   pnpm lint
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   ```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy
```

### Set Environment Variables on Vercel

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (production URL)
   - `NEXT_PUBLIC_APP_URL`

## Monitoring and Logs

### View Logs in Development

```bash
# Logs appear in terminal where you ran `pnpm dev`
pnpm dev  # Watch for [v0] console.log statements
```

### View Production Logs

Visit Vercel dashboard → Functions/Logs

## Performance Optimization

- Images are automatically optimized by Next.js
- Database queries use Drizzle ORM for optimization
- Zustand stores for client-side state management
- Server-side rendering where appropriate

## Security Checklist

- [ ] Database URL hidden in .env.local (not committed)
- [ ] BETTER_AUTH_SECRET is random and strong
- [ ] CORS headers properly configured
- [ ] Environment variables set on production
- [ ] Database backups configured
- [ ] SSL/TLS enabled

## Getting Help

- Check docs in `/SETUP.md` and `/README.md`
- Review example code in `/components` and `/app`
- Check console for `[v0]` debug messages
- Look at error stack traces carefully

## Next Steps

1. ✅ Database set up
2. ✅ Environment configured
3. ✅ Dev server running
4. 👉 Create sample products
5. 👉 Test shopping flow
6. 👉 Set up admin panel
7. 👉 Configure deployment

## Support

For issues or questions:
- Check the README.md
- Review error messages in console
- Check Neon dashboard for database status
- Verify environment variables are set

---

**Last Updated**: June 2026
