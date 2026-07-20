# GotiNova - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

You need a PostgreSQL database. Here are your options:

#### Option A: Neon (Recommended — Free & Serverless)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (name it "gotinova" or anything)
3. Copy the connection string — it looks like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste it as your `DATABASE_URL` in `.env`

#### Option B: Supabase (Free tier)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings > Database > Connection string
3. Copy the URI (use "Transaction" mode for serverless)
4. Paste it as your `DATABASE_URL` in `.env`

#### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Provision PostgreSQL"
3. Go to Variables tab and copy `DATABASE_URL`
4. Paste it in your `.env`

#### Option D: Local PostgreSQL

If you have PostgreSQL installed locally:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gotinova
```

Create the database first:
```bash
psql -U postgres -c "CREATE DATABASE gotinova;"
```

### 3. Set Up Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Then fill in your values:

```env
# Your PostgreSQL connection string from Step 2
DATABASE_URL=postgresql://...

# Generate a random secret (32+ chars)
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=paste-your-generated-secret-here

# Your app URL
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Database Tables

Run the seed script to create all tables:

```bash
npm run seed
```

Or manually push the schema using the SQL in `scripts/seed.sql`.

### 5. Set Up Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **"Create Credentials"** > **"OAuth client ID"**
5. Select **"Web application"**
6. Set the following:
   - **Name**: GotiNova (or anything)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
7. Click Create and copy the **Client ID** and **Client Secret**
8. Add to your `.env`:

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

> **For production**: Add your production domain to both origins and redirect URIs:
> - Origin: `https://yourdomain.com`
> - Redirect: `https://yourdomain.com/api/auth/callback/google`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live!

---

## Database Schema

Better Auth automatically creates its own tables (`user`, `session`, `account`, `verification`) when the first auth request is made. The app tables (products, orders, etc.) are created by the seed script.

### Tables created by Better Auth:
- `user` — User accounts
- `session` — Active sessions
- `account` — OAuth provider links (Google, etc.)
- `verification` — Email verification tokens

### App tables (created by seed):
- `categories` — Product categories
- `products` — Product catalog
- `productAttributes` — Product specs (length, color, etc.)
- `cartItems` — Shopping cart
- `wishlistItems` — User wishlists
- `orders` — Customer orders
- `orderItems` — Items in each order
- `reviews` — Product reviews
- `deliveryTracking` — Shipment tracking
- `coupons` — Discount codes
- `analytics` — Sales analytics
- `adminUsers` — Admin access control
- `frequentlyBoughtTogether` — Product recommendations

---

## Production Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add all environment variables from your `.env` file
4. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Update Google OAuth redirect URI to include your production domain
6. Deploy!

---

## Troubleshooting

### "Connection refused" / Database errors
- Make sure your `DATABASE_URL` is correct
- If using Neon/Supabase, ensure `?sslmode=require` is in the URL
- Check that your IP is allowed (some providers have IP allowlists)

### Google sign-in not working
- Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Make sure both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check Google Cloud Console for any errors in the OAuth consent screen

### Auth cookies not being set
- Make sure `BETTER_AUTH_URL` matches where you access the app
- In development, cookies use `sameSite: 'none'` which requires HTTPS in some browsers
