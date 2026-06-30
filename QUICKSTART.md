# 🚀 LuxeHair - Quick Start (5 Minutes)

Get the Hair & Wig E-commerce platform running in 5 minutes!

## Prerequisites
- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- Neon database account (free tier available)

## Step 1: Clone & Install (1 min)
```bash
git clone <your-repo>
cd luxehair
pnpm install
```

## Step 2: Database Setup (2 min)

### Option A: Neon (Cloud, Recommended)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string

### Option B: Local PostgreSQL
```bash
createdb luxehair
# Connection: postgresql://user:password@localhost:5432/luxehair
```

## Step 3: Configure Environment (1 min)

Create `.env.local`:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/db

# Auth secret (run: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-generated-secret-here

# URLs
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run Server (1 min)
```bash
pnpm dev
```

Visit: **http://localhost:3000** ✅

---

## 📚 What's Included

| Feature | Status |
|---------|--------|
| Product Browsing | ✅ Complete |
| Shopping Cart | ✅ Complete |
| Checkout | ✅ Complete |
| User Accounts | ✅ Complete |
| Orders & Tracking | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Reviews & Ratings | ✅ Complete |
| Wishlist | ✅ Complete |
| Search & Filters | ✅ Complete |
| Authentication | ✅ Complete |

---

## 🔗 Quick Links

- **Home**: http://localhost:3000
- **Products**: http://localhost:3000/products
- **Sign Up**: http://localhost:3000/sign-up
- **Sign In**: http://localhost:3000/sign-in
- **Admin**: http://localhost:3000/admin (after login)
- **Account**: http://localhost:3000/account

---

## 🧪 Test Features

### 1. Create Account
1. Go to `/sign-up`
2. Enter email & password (min 8 chars)
3. Submit

### 2. Browse Products
1. Click "Products" in header
2. Search by name
3. Filter by category/price

### 3. Add to Cart
1. Click product
2. Increase quantity
3. "Add to Cart"
4. View cart

### 4. Checkout
1. Go to `/checkout`
2. Fill shipping info
3. Select payment method
4. Place order

### 5. Admin Panel
1. Go to `/admin`
2. View dashboard metrics
3. Browse products/orders
4. Manage inventory

---

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
PORT=3001 pnpm dev
```

### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Auth Secret Error
```bash
# Generate new secret
openssl rand -base64 32

# Update .env.local
BETTER_AUTH_SECRET=<paste-here>

# Restart server
```

### Clear Cache
```bash
rm -rf .next node_modules
pnpm install
pnpm dev
```

---

## 📖 Full Documentation

- **README.md** - Complete feature list & tech stack
- **SETUP.md** - Detailed setup instructions  
- **DEPLOYMENT.md** - Deploy to production
- **PROJECT_SUMMARY.md** - Full project overview

---

## 🚀 Deploy to Vercel

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import repository
# 4. Add environment variables:
#    - DATABASE_URL
#    - BETTER_AUTH_SECRET
#    - BETTER_AUTH_URL (your domain)
#    - NEXT_PUBLIC_APP_URL (your domain)

# 5. Deploy!
```

---

## 💡 Pro Tips

1. **Use Test Data**: Browse sample products in `/products`
2. **Admin Access**: Use admin panel at `/admin` after signing in
3. **Check Logs**: Terminal shows server logs with `[v0]` prefix
4. **Mobile Test**: Resize browser or use DevTools for mobile preview
5. **Fast Reload**: Changes auto-save, browser hot-reloads

---

## ✨ What's Next?

1. ✅ Get it running
2. ✅ Test the platform
3. ✅ Add sample products
4. ✅ Customize branding
5. ✅ Deploy to production

---

## 📞 Having Issues?

1. Check console logs (terminal)
2. Read **SETUP.md** troubleshooting
3. Verify `.env.local` settings
4. Check database connection
5. Review error messages carefully

---

## 🎉 Success!

You now have a fully functional Hair & Wig E-commerce platform running locally!

**Next Step**: Read SETUP.md for advanced configuration options.

---

**Time to Production**: ~10-15 minutes with deployment  
**Built with**: Next.js 16 • React 19 • TypeScript • TailwindCSS • Neon  
**Status**: ✅ Production Ready
