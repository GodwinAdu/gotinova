# LuxeHair Deployment Guide

Complete guide for deploying the Hair & Wig E-commerce platform to production.

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`pnpm type-check`)
- [ ] No console.log statements left (except `[v0]` debug logs)
- [ ] All environment variables documented
- [ ] No secrets in source code
- [ ] Database migrations tested locally

### Testing
- [ ] Sign-up/Sign-in flow works
- [ ] Cart functionality tested
- [ ] Checkout process verified
- [ ] Orders can be created
- [ ] Admin panel accessible
- [ ] Mobile responsive design checked

### Performance
- [ ] Images are optimized
- [ ] No N+1 database queries
- [ ] API response times acceptable
- [ ] Bundle size is reasonable

### Security
- [ ] Database credentials not in repo
- [ ] API secrets configured
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless integration with Next.js and automatic deployments.

#### Step 1: Prepare Repository

```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore

# Commit all changes
git add .
git commit -m "Ready for deployment"
```

#### Step 2: Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in
3. Click "Add New" → "Project"
4. Select your GitHub repository

#### Step 3: Configure Environment Variables

In Vercel dashboard:

```
Production Environment:
- DATABASE_URL: Your Neon production database URL
- BETTER_AUTH_SECRET: Your auth secret
- BETTER_AUTH_URL: Your production domain (e.g., https://luxehair.com)
- NEXT_PUBLIC_APP_URL: Your production domain
```

#### Step 4: Deploy

Vercel will automatically deploy when you push to main branch.

```bash
# Push to trigger deployment
git push origin main
```

Monitor deployment progress in Vercel dashboard.

### Option 2: Self-Hosted (Docker)

For self-hosted deployments on any server.

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy app
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t luxehair:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="..." \
  -e BETTER_AUTH_URL="https://your-domain.com" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  luxehair:latest
```

#### Docker Compose (Production)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
      NODE_ENV: production
    restart: always
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: luxehair
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
```

Deploy with:

```bash
docker-compose up -d
```

## Database Setup for Production

### Using Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Create production project
3. Copy connection string
4. Configure in Vercel/Docker environment

### Using AWS RDS

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier luxehair-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password ${DB_PASSWORD}
```

## SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure auto-renewal
sudo systemctl enable certbot.timer
```

### Using Vercel (Automatic)

Vercel automatically provisions SSL certificates for your domain.

## Domain Configuration

### DNS Records

Add these DNS records for your domain:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (if using Vercel)

Type: A
Name: @
Value: Your server IP (if self-hosted)
```

### Configure Domain in Vercel

1. Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Verify domain

## Production Monitoring

### Application Monitoring

```typescript
// Add to your API routes for monitoring
export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const data = await fetchData()
    const duration = Date.now() - startTime
    
    console.log(`[PERF] Request took ${duration}ms`)
    
    return Response.json(data)
  } catch (error) {
    console.error('[ERROR] Request failed:', error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### Error Tracking

Integrate Sentry for error tracking:

```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.mjs`:

```javascript
withSentryConfig(nextConfig, {
  org: "your-org",
  project: "luxehair",
})
```

### Performance Monitoring

Monitor Core Web Vitals in Vercel dashboard or use Google Analytics.

## Backup Strategy

### Database Backups

#### Neon (Automatic)
- Neon automatically backs up daily
- 7-day retention
- Can restore from backup in dashboard

#### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240620.sql
```

### File Backups

```bash
# Backup entire application
tar -czf luxehair-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Store in S3 or cloud storage
```

## Post-Deployment

### Verify Production

1. **Test URL**: Visit https://your-domain.com
2. **Test Sign-up**: Create a test account
3. **Test Shopping**: Add items to cart, complete checkout
4. **Test Admin**: Access admin panel
5. **Check Performance**: Use Lighthouse or PageSpeed Insights

### Configure Analytics

Add Google Analytics:

```typescript
// In app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Set Up Email Notifications

Configure transactional emails for:
- Order confirmations
- Shipping updates
- Password resets

## Scaling Strategies

### Horizontal Scaling

```bash
# Multiple Vercel deployments behind CDN
# Or use load balancer with multiple Docker containers

# Example with Nginx load balancer
upstream backend {
  server app1:3000;
  server app2:3000;
  server app3:3000;
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
  }
}
```

### Database Scaling

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_created ON orders(createdAt);
```

## Disaster Recovery

### Disaster Recovery Plan

1. **Regular Backups**: Daily automated backups
2. **Backup Verification**: Test restore procedures monthly
3. **Geographic Redundancy**: Store backups in different regions
4. **Documentation**: Keep recovery procedures documented

### Rollback Procedure

```bash
# Revert to previous deployment on Vercel
# 1. Dashboard → Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Or manually revert code
git revert <commit-hash>
git push origin main
```

## Performance Optimization

### Cache Strategy

```typescript
// Cache static content for 1 hour
export const revalidate = 3600

// Cache API responses
export const fetchCache = 'force-cache'
```

### CDN Configuration

```javascript
// next.config.mjs
export default {
  images: {
    domains: ['cdn.example.com'],
  },
}
```

## Security in Production

### Environment Security

- [ ] No secrets in code
- [ ] Use environment variables
- [ ] Rotate secrets regularly
- [ ] Use secret manager (AWS Secrets Manager, Vercel Secrets)

### API Security

```typescript
// Rate limiting
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: Request) {
  const ip = request.ip || 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  // Process request
}
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
vercel logs  # For Vercel

# Check environment variables
# Verify all required env vars are set

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### High Latency

- Check database query performance
- Verify CDN configuration
- Review Vercel Analytics

### Database Issues

- Check connection pool limits
- Review slow queries
- Monitor disk space

## Support & Monitoring

### Uptime Monitoring

Use services like UptimeRobot:
1. Create monitor for https://your-domain.com
2. Set 5-minute check interval
3. Configure alerts for downtime

### Log Aggregation

Use ELK Stack or Datadog:
- Centralize logs
- Set up alerts
- Monitor metrics

## Maintenance Schedule

```
Daily:
- Monitor error logs
- Check uptime status

Weekly:
- Review analytics
- Check performance metrics

Monthly:
- Test backup restoration
- Security audit
- Performance optimization

Quarterly:
- Full security review
- Capacity planning
- Update dependencies
```

---

**Last Updated**: June 2026
