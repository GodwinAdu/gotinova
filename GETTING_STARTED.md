# Getting Started with LuxeHair Platform

## Quick Start (5 minutes)

### 1. Verify Environment Variables
Ensure your `.env.local` has:
```
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_auth_secret
UPLOADTHING_TOKEN=your_uploadthing_token (optional for now)
```

### 2. Seed the Database
```bash
pnpm seed
```

This creates:
- ✅ Admin account (admin@luxehair.com / Admin@123456)
- ✅ Demo customer account (customer@luxehair.com)
- ✅ 5 product categories
- ✅ 6 demo products with images

### 3. Start Development Server
```bash
pnpm dev
```

Visit: http://localhost:3000

---

## Account Access

### Customer Experience
**Sign In**: http://localhost:3000/sign-in
- Email: customer@luxehair.com
- Or create new account via sign-up

**Features Available**:
- Browse products
- Add to cart
- Wishlist
- Checkout
- Order tracking
- Leave reviews

### Admin Portal
**Admin Login**: http://localhost:3000/admin/login
- Email: admin@luxehair.com
- Password: Admin@123456

**Admin Features**:
- Dashboard with analytics
- Product management (CRUD)
- Order management
- Customer insights
- Revenue tracking

---

## Uploading Product Images

### Setup UploadThing (if not done)

1. Go to https://uploadthing.com
2. Create free account
3. Create app and get API token
4. Add to `.env.local`:
```
UPLOADTHING_TOKEN=your_token
```

### Using Image Upload

In admin product creation:
1. Click drag-and-drop area
2. Select product image (max 16MB, 5 files)
3. Image uploads to CDN
4. URL automatically saved

---

## Testing All Features

### 1. Browse Products
- Home page shows featured products
- Click products to view details
- Filter by category on /products

### 2. Shopping Cart
- Add products to cart
- Adjust quantities
- View cart summary
- Proceed to checkout

### 3. Checkout Process
- Enter shipping address
- Select shipping method
- Review order
- Complete purchase

### 4. Order Tracking
- View orders at /orders
- Click order to see tracking
- Simulated tracking updates

### 5. Reviews
- Leave product reviews
- Upload review images
- View average ratings

### 6. Admin Dashboard
- View total revenue
- See top products
- Monitor customer growth
- Manage products and orders

---

## Troubleshooting

### "Database connection failed"
- Verify DATABASE_URL is correct
- Check Neon dashboard for active connections
- Test connection: `psql $DATABASE_URL`

### "Auth not working"
- Verify BETTER_AUTH_SECRET is set
- Regenerate: `openssl rand -base64 32`
- Clear browser cookies
- Restart dev server

### "Images not uploading"
- Check UPLOADTHING_TOKEN is set
- Verify token is valid
- Check network tab for errors
- See UPLOADTHING_SETUP.md for detailed help

### "Admin login shows 'Unauthorized'"
- Run `pnpm seed` to create admin account
- Check adminUsers table in database
- Verify user email matches admin table

---

## Production Deployment

### Deploy to Vercel
```bash
git push origin main
```

Vercel will automatically:
1. Install dependencies
2. Build project
3. Run migrations
4. Deploy

### Environment Variables in Vercel
Add these in Vercel project settings:
- DATABASE_URL
- BETTER_AUTH_SECRET
- UPLOADTHING_TOKEN (optional)
- NODE_ENV=production

### Seed Production Database
```bash
# After deployment
vercel env pull
pnpm seed
```

### Custom Domain
1. Add domain in Vercel settings
2. Update DNS records
3. Wait for SSL certificate

---

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── (auth pages)
│   ├── admin/           # Admin dashboard
│   ├── products/        # Product pages
│   ├── cart/           # Shopping cart
│   ├── checkout/       # Checkout flow
│   ├── orders/         # Order management
│   └── api/            # API routes
├── components/         # Reusable components
├── lib/
│   ├── auth.ts        # Authentication config
│   ├── db/            # Database setup
│   ├── uploadthing.ts # Image upload config
│   └── store.ts       # Zustand stores
├── scripts/
│   └── seed.ts        # Database seeding
└── public/            # Static files
```

---

## Key Technologies

- **Framework**: Next.js 16 + React 19
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Better Auth with email/password
- **File Upload**: UploadThing CDN
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **UI**: TailwindCSS + shadcn/ui
- **Mobile**: 100% responsive

---

## Common Tasks

### Add New Product Category
1. Go to Admin → Products
2. Create new category
3. Products will filter by category

### Reset Database
```bash
# Warning: This deletes all data
DROP DATABASE your_db;
CREATE DATABASE your_db;
pnpm seed
```

### Change Admin Password
1. Sign in as admin
2. Go to Account settings
3. Update password
4. Changes reflected immediately

### Backup Database
```bash
# Neon provides automatic backups
# Manual backup:
pg_dump $DATABASE_URL > backup.sql
```

---

## Support

- Check DOCUMENTATION_INDEX.md for all guides
- Read README.md for architecture overview
- See ADMIN_AUTHENTICATION.md for auth details
- Check MOBILE_RESPONSIVENESS.md for mobile setup

---

## You're Ready! 🚀

The platform is fully functional and production-ready.

**Next Steps**:
1. Run `pnpm seed` to populate database
2. Start `pnpm dev` server
3. Visit http://localhost:3000
4. Login as admin@luxehair.com / Admin@123456
5. Start managing your luxury hair business!
