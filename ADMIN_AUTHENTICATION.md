# Admin Authentication System

This document explains how admin authentication is implemented and managed in LuxeHair.

## Overview

The LuxeHair platform has a **dual-tier authentication system**:
- **Customer Authentication** - Regular users at `/sign-in` and `/sign-up`
- **Admin Authentication** - Administrators at `/admin/login`

## Architecture

### 1. Database Schema

#### User Table
All users (customers and admins) start as regular users:

```sql
CREATE TABLE "user" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "name" text,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
)
```

#### Admin Users Table
Only admins have records in this table:

```sql
CREATE TABLE "adminUsers" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "role" text NOT NULL DEFAULT 'admin',
  "permissions" text,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
)
```

**Admin Roles:**
- `admin` - Full access to all admin features
- `moderator` - Limited access (can view but not edit)
- `analyst` - Read-only analytics access

## Authentication Flow

### Customer Sign-In

```
1. User visits /sign-in
2. Enters email & password
3. Better Auth validates credentials
4. Session cookie set (httpOnly, secure)
5. User redirected to /
6. Header shows "Welcome [User]"
```

### Admin Sign-In

```
1. Admin visits /admin/login
2. Enters email & password
3. Better Auth validates credentials
4. System checks adminUsers table
5. If admin exists and isActive = true:
   - Session cookie set
   - Admin redirected to /admin
6. If not admin:
   - Redirect back to /admin/login with error
   - User can access customer site instead
```

## Separation of Auth Pages

### Customer Pages

**Location:** `/app/sign-in/page.tsx` and `/app/sign-up/page.tsx`

```tsx
export default async function SignInPage() {
  // Customer sign-in form
  // Shows "Sign Up" link
  // Shows "Admin Login" link
}
```

**Features:**
- Email/password registration and login
- "Forgot password?" functionality
- Link to admin login for admins
- Social login ready (future feature)

### Admin Pages

**Location:** `/app/admin/login/page.tsx`

```tsx
export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    // Check if user is admin
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, session.user.id))
    
    if (adminUser.length > 0) {
      redirect('/admin')
    }
  }
}
```

**Features:**
- Security notice at top
- Separate branding (Admin Portal)
- Contact support link
- Back to store option

## Authentication Middleware

### Location: `/middleware.ts`

The middleware protects admin routes:

```tsx
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.redirect('/admin/login')
    }
    
    // Check if user is admin
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, session.user.id))
    
    if (adminUser.length === 0) {
      return NextResponse.redirect('/')
    }
  }
}
```

## Setting Up an Admin Account

### Step 1: Create User Account

1. Visit `/sign-up`
2. Create account with email: `admin@luxehair.com`
3. Verify email (if required)

### Step 2: Add to Admin Users

Connect to Neon database:

```sql
INSERT INTO "adminUsers" (id, "userId", role, permissions, "isActive")
VALUES (
  'admin_1',
  'user_id_from_user_table',
  'admin',
  '["products.create","products.edit","products.delete","orders.view","customers.view"]',
  true
)
```

### Step 3: Verify Access

1. Sign out (if logged in as customer)
2. Visit `/admin/login`
3. Enter credentials
4. Should redirect to `/admin` dashboard

## Middleware Protection

### Admin Routes Protected

All routes under `/app/admin/*` require:
- Valid session (logged in)
- Admin record in database
- `isActive = true`

Protected routes:
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/analytics` - Analytics dashboard

### Public Routes

Available to anyone (customer or admin):
- `/` - Home
- `/products` - Product catalog
- `/sign-in` - Customer login
- `/sign-up` - Customer registration
- `/admin/login` - Admin login (redirects if already admin)

## Session Management

### Session Cookie

Better Auth automatically manages sessions:

```typescript
// Cookie details:
{
  name: 'auth.better-auth',
  httpOnly: true,      // Not accessible from JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: 'lax',     // CSRF protection
  path: '/',           // Available site-wide
  maxAge: 7 * 24 * 60 * 60  // 7 days
}
```

### Session Validation

On every protected request:

```typescript
const session = await auth.api.getSession({ headers: await headers() })

if (!session?.user) {
  // Not logged in
  return redirect('/sign-in')
}

// User is authenticated
const user = session.user
```

## Admin Permissions System

### Permission Model

Future extensible permission system:

```typescript
interface AdminPermissions {
  products: {
    create: boolean
    edit: boolean
    delete: boolean
    view: boolean
  }
  orders: {
    view: boolean
    update: boolean
    cancel: boolean
  }
  customers: {
    view: boolean
    manage: boolean
  }
  analytics: {
    view: boolean
  }
  settings: {
    manage: boolean
  }
}
```

### Stored as JSON

In the `permissions` column (stored as JSON string):

```sql
UPDATE "adminUsers" 
SET permissions = '["products.create","products.edit","orders.view","customers.view"]'
WHERE "userId" = 'user_123'
```

## Security Best Practices

### 1. Password Security

- Passwords hashed with bcrypt (Better Auth handles)
- Minimum 8 characters required
- Strength validation enforced
- Never logged or stored in plain text

### 2. Session Security

```tsx
// Development: Allow cross-site cookies for v0 preview
if (NODE_ENV === 'development') {
  defaultCookieAttributes: {
    sameSite: 'none',
    secure: true
  }
}
```

### 3. Admin Access Logging

Future feature to log:
- Admin login/logout times
- Actions performed
- Data modifications
- Sensitive operations

### 4. Rate Limiting

Implement rate limiting on:
- Login attempts (max 5 per minute)
- API endpoints (protect from abuse)
- File uploads (max size/frequency)

## Sign-Out Process

### Customer Sign-Out

```tsx
const handleLogout = async () => {
  await authClient.signOut()
  router.push('/')
  router.refresh()
}
```

Results in:
- Session cookie cleared
- User logged out
- Redirected to home page
- Any private data removed from cache

### Admin Sign-Out

Same as customer, but:
- Redirects to home page (not `/admin/login`)
- Can access customer features
- Can access `/admin/login` again

## Multi-Account Support

A user can:
1. Have customer account and be logged in
2. Visit `/admin/login`
3. Sign in with admin credentials
4. Access admin dashboard
5. No need to log out as customer

However, only one session per browser at a time. Signing in as admin logs out as customer.

## Testing Authentication

### Test Cases

```typescript
// Test 1: Customer sign-up and login
1. Navigate to /sign-up
2. Fill form and submit
3. Should show success
4. Navigate to /sign-in
5. Login should work

// Test 2: Admin login fails for non-admins
1. Create customer account
2. Navigate to /admin/login
3. Try to login with customer email
4. Should show error or redirect

// Test 3: Admin login works for admins
1. Create admin user in database
2. Navigate to /admin/login
3. Login with admin email
4. Should redirect to /admin

// Test 4: Protected routes
1. Try to access /admin without login
2. Should redirect to /admin/login
3. Login as admin
4. Should access /admin successfully
```

## Troubleshooting

### Can't Login to Admin

1. Check email exists in `user` table
2. Check `adminUsers` table has entry
3. Check `isActive = true`
4. Verify `BETTER_AUTH_SECRET` is set
5. Check session cookie isn't blocked

### Session Lost After Refresh

- Verify `BETTER_AUTH_URL` is set correctly
- Check `trustedOrigins` includes current domain
- Clear browser cookies and try again
- Check browser allows third-party cookies

### Admin Credentials Work on Customer Login

- This is expected behavior
- Admins can access customer features
- Use `/admin/login` for admin-specific access
- Set up separate admin email if preferred

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS/Email verification
   - Authenticator app support
   - Backup codes

2. **Social Login**
   - Google OAuth
   - Apple ID
   - Microsoft account

3. **Session Management**
   - Login from multiple devices
   - View active sessions
   - Revoke remote sessions

4. **Audit Logging**
   - Track all admin actions
   - IP address logging
   - Suspicious activity alerts

5. **Role-Based Access Control (RBAC)**
   - Custom roles
   - Fine-grained permissions
   - Team collaboration features
