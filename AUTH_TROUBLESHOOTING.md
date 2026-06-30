# Authentication Troubleshooting Guide

## Current Issue: "Invalid origin" Error

### Problem
When trying to login with admin credentials, you see:
```
ERROR [Better Auth]: Invalid origin: https://vm-hair-wig-e-commerce-platform.vusercontent.net
POST /api/auth/sign-in/email 403
```

### Root Cause
Better Auth validates the origin of requests against a whitelist. In the v0 development environment, URLs change dynamically (e.g., `vm-hair-wig-e-commerce-platform.vusercontent.net`, `vm-kdfbo0f9yng.vusercontent.net`), making it impossible to pre-whitelist all possible origins.

## Permanent Solution Applied

The auth configuration has been updated to:
1. **Disable CSRF check in development**: Better Auth won't validate origins in development mode
2. **Dynamic origin handling**: Production code still validates origins properly

### File Changes

**`lib/auth.ts`** - Updated with:
```typescript
advanced: {
  // Disable CSRF validation in development to handle dynamic v0 URLs
  disableCSRFCheck: process.env.NODE_ENV === 'development',
}
```

This allows any origin in development while maintaining security in production.

## Testing the Fix

### Step 1: Verify Environment
```bash
echo $NODE_ENV
# Should show: development
```

### Step 2: Clear Browser Cache
- Clear all cookies for localhost
- Clear all cookies for your v0 domain
- Restart browser if needed

### Step 3: Restart Dev Server
```bash
pkill -f "next dev"
sleep 2
pnpm dev
```

Wait for "✓ Ready in XXXms" message.

### Step 4: Try Login
1. Go to http://localhost:3000/admin/login
2. Email: `admin@luxehair.com`
3. Click "Admin Login" button
4. You should now be logged in

## If Still Having Issues

### Check 1: Verify BETTER_AUTH_SECRET
```bash
cat .env.development.local | grep BETTER_AUTH_SECRET
# Should show a 32+ character secret
```

### Check 2: Verify Database Connection
The database should have the admin user seeded:
```bash
# The admin user should exist in the database
SELECT email FROM "user" WHERE email = 'admin@luxehair.com';
```

### Check 3: Check Dev Server Logs
```bash
tail -f /tmp/dev.log
```

Look for compilation errors or other issues.

### Check 4: Hard Refresh Browser
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- This clears cached JavaScript

## Production Deployment

In production, the auth configuration will:
1. **Enable origin validation**: Only approved origins work
2. **Require trustedOrigins**: Must match your production domain
3. **Keep CSRF protection**: Full security enabled

## Summary of Fixes Applied

| Issue | Fix | File |
|-------|-----|------|
| Invalid origin in dev | `disableCSRFCheck: true` in dev mode | `lib/auth.ts` |
| Low entropy secret | Updated to 44-char random secret | `.env.development.local` |
| Dynamic v0 URLs | Permissive origin handling in dev | `lib/auth.ts` |
| Hardcoded domains | Dynamic origin detection | `lib/auth.ts` |

## Next Steps

1. Restart the dev server
2. Try logging in again  
3. If it works, you're all set!
4. If not, check the troubleshooting steps above

---

**Need Help?** Check the logs at `http://localhost:3000` or run `pnpm dev` to see real-time errors.
