# LuxeHair - Premium Hair & Wig E-Commerce Platform

A production-ready, enterprise-grade e-commerce platform for premium hair and wig products. Built with modern web technologies including Next.js 16, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse all hair and wig products with advanced filtering and search
- **Product Details**: Detailed product pages with images, specifications, reviews, and related products
- **Shopping Cart**: Add/remove items, adjust quantities, persistent cart storage
- **Wishlist**: Save favorite products for later
- **Checkout**: Complete checkout workflow with multiple payment options
- **Order Management**: View order history, track deliveries, manage orders
- **User Accounts**: User profiles, address management, order history
- **Reviews & Ratings**: Leave product reviews with ratings and photos
- **Delivery Tracking**: Real-time tracking with status updates and estimated delivery

### Admin Features
- **Product Management**: Create, edit, delete products with inventory management
- **Order Management**: View all orders, update status, manage payments
- **Customer Management**: View customer database, track customer activity
- **Analytics Dashboard**: Revenue trends, top products, customer insights
- **Role-Based Access Control**: Different permission levels for admin users

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js Route Handlers** - API endpoints
- **Better Auth** - Authentication
- **Drizzle ORM** - Database queries
- **Node.js** - Runtime

### Database
- **Neon PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe queries

### Infrastructure
- **Vercel** - Deployment platform
- **Neon** - Database hosting

## 📁 Project Structure

```
/app
  /api              # API route handlers
  /admin            # Admin dashboard pages
  /auth             # Authentication pages
  /products         # Product pages
  /orders           # Order pages
  /checkout         # Checkout page
  /account          # User account pages
  /(public)         # Public pages
  layout.tsx        # Root layout
  page.tsx          # Home page

/components
  /ui               # Reusable UI components
  header.tsx        # Header component
  footer.tsx        # Footer component
  product-card.tsx  # Product card component
  auth-form.tsx     # Authentication form

/lib
  auth.ts           # Better Auth config
  auth-client.ts    # Auth client
  db/               # Database setup
  store.ts          # Zustand stores
  constants.ts      # App constants
  validations.ts    # Zod schemas
  api.ts            # API utilities
  utils/            # Helper functions

/public             # Static assets

middleware.ts       # Route middleware
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm
- Neon PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd luxehair
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL=postgresql://...

   # Auth
   BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
   BETTER_AUTH_URL=http://localhost:3000

   # Public URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run migrations** (if needed)
   ```bash
   pnpm db:migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## 📊 Database Schema

### Core Tables
- **user** - Customer accounts
- **session** - Authentication sessions
- **account** - OAuth accounts
- **verification** - Email verification codes

### Product Tables
- **categories** - Product categories
- **products** - Product catalog
- **productAttributes** - Product specifications

### Shopping Tables
- **cartItems** - Shopping cart items
- **wishlistItems** - Wishlisted products

### Order Tables
- **orders** - Customer orders
- **orderItems** - Items in orders
- **deliveryTracking** - Shipment tracking

### Management Tables
- **reviews** - Product reviews
- **coupons** - Discount codes
- **analytics** - Business metrics
- **adminUsers** - Admin accounts

## 🔐 Authentication

The platform uses Better Auth for secure authentication with:
- Email/password signup and login
- Secure httpOnly cookies
- Session management
- Password reset functionality

### User Roles
- **Customer** - Browse products, place orders
- **Admin** - Manage products, orders, customers
- **Super Admin** - Full system access

## 💳 Payment Options

- **Cash on Delivery (COD)** - Pay when order arrives
- **Advance Payment** - Pay before order confirmation

## 📦 Product Management

### Product Attributes
- Hair Type (Straight, Wave, Curly, Coily, etc.)
- Hair Length (8" to 24"+)
- Hair Color (Natural, Blonde, Red, Ombre, etc.)
- Specifications (Density, Cap Size, etc.)

### Pricing
- Original price (for discounts)
- Sale price
- Automatic discount calculation

## 🛒 Shopping Cart

- Add/remove products
- Adjust quantities
- Persistent storage (localStorage)
- Real-time total calculation
- Tax and shipping calculation

## 📮 Checkout Process

1. Review cart items
2. Enter shipping information
3. Select payment method
4. Review order summary
5. Place order
6. Confirmation page with order details

## 📊 Order Tracking

Customers can track their orders with:
- Order status updates (Pending, Confirmed, Shipped, Delivered)
- Real-time tracking information
- Estimated delivery dates
- Delivery partner contact

## ⭐ Reviews & Ratings

- Leave product reviews with ratings (1-5 stars)
- Add photos to reviews
- View other customer reviews
- Average rating calculation

## 🎯 Admin Dashboard

### Analytics
- Total revenue
- Order count
- Customer statistics
- Growth metrics
- Top selling products

### Management Interfaces
- **Products**: Create, edit, delete products
- **Orders**: View and manage orders
- **Customers**: Track customer information
- **Inventory**: Manage product stock

## 🔍 Search & Filter

- Full-text search on product names and descriptions
- Filter by category
- Filter by price range
- Filter by rating
- Sort by newest, best-selling, price, rating

## 🌐 Localization

- Currency: PKR (Pakistani Rupee)
- Language: English
- Date Format: Local date format

## 📱 Responsive Design

- Mobile-first approach
- Fully responsive layouts
- Touch-friendly interface
- Optimized for all screen sizes

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

## 🚀 Performance

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Server-side rendering where appropriate
- Static generation for SEO
- Optimized database queries

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
BETTER_AUTH_SECRET=random-string-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e
```

## 📦 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

```bash
vercel deploy
```

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@luxehair.com or create an issue in the repository.

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎯 Roadmap

- [ ] Multiple payment gateways integration
- [ ] Wishlist sharing
- [ ] Gift cards
- [ ] Loyalty program
- [ ] Subscription model
- [ ] Mobile app
- [ ] International shipping
- [ ] Multi-language support
- [ ] Live chat support
- [ ] AI-powered recommendations

## 👥 Team

Developed by the LuxeHair Team

---

**Last Updated**: June 2026
