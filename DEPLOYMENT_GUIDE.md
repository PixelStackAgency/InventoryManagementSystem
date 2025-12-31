# Production Deployment Guide

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update default admin password
- [ ] Configure environment-specific `.env` file
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS if needed
- [ ] Review security headers
- [ ] Enable rate limiting
- [ ] Set up WAF (Web Application Firewall)

### Database
- [ ] Switch to PostgreSQL (from SQLite)
- [ ] Configure database connection
- [ ] Run all migrations
- [ ] Set up database backups
- [ ] Test backup/restore process
- [ ] Create database user with minimal permissions
- [ ] Enable database encryption

### Infrastructure
- [ ] Choose hosting platform (Vercel, AWS, Heroku, DigitalOcean, etc.)
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Configure CDN if needed
- [ ] Set up monitoring and alerts
- [ ] Configure logging
- [ ] Set up error tracking

### Performance
- [ ] Enable caching headers
- [ ] Configure database connection pooling
- [ ] Review and optimize slow queries
- [ ] Set up static file serving
- [ ] Configure compression

---

## 🚀 Deployment Steps

### 1. Prepare Production Environment

Create production `.env` file:
```bash
# Production Environment Variables
DATABASE_URL="postgresql://user:password@host:5432/inventorypro"
JWT_SECRET="your-very-long-random-secret-key-minimum-32-characters"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

⚠️ **NEVER commit secrets to version control**

### 2. Update Dependencies

```bash
npm install --legacy-peer-deps
npm audit fix
```

### 3. Build Application

```bash
npm run build
```

Verify build completes without errors.

### 4. Database Setup

#### For PostgreSQL:

```bash
# Install PostgreSQL driver
npm install pg

# Update .env with PostgreSQL connection string
# Change prisma/schema.prisma datasource
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run migrations:
```bash
npx prisma migrate deploy
```

Seed production database:
```bash
node prisma/seed.js
```

### 5. Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Configure environment variables in Vercel dashboard.

### 6. Deploy to AWS

```bash
# Install AWS CLI
npm i -g aws-cli

# Configure AWS credentials
aws configure

# Use AWS Amplify for easy Next.js deployment
npm i -g @aws-amplify/cli
amplify init
```

### 7. Deploy to Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and push:
```bash
docker build -t inventorypro:latest .
docker push your-registry/inventorypro:latest
```

### 8. Deploy with docker-compose

Use the existing `docker-compose.yml`:
```bash
docker-compose up -d
```

---

## 🔒 Security Configuration

### 1. Environment Variables

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Store in Vercel environment variables or .env.production
JWT_SECRET="your-generated-secret"
```

### 2. Database Security

```bash
# PostgreSQL user with minimal permissions
CREATE USER inventorypro_user WITH PASSWORD 'strong_password';
CREATE DATABASE inventorypro OWNER inventorypro_user;
GRANT CONNECT ON DATABASE inventorypro TO inventorypro_user;
```

### 3. CORS Configuration (if using separate frontend)

Add to `middleware.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
```

### 4. Security Headers

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

**Using Sentry:**
```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(
  nextConfig,
  {
    org: "your-org",
    project: "inventorypro",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### 2. Database Monitoring

Set up query logging:
```typescript
// In prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

### 3. Infrastructure Monitoring

Use platform-specific monitoring:
- **Vercel**: Built-in Analytics
- **AWS**: CloudWatch
- **DigitalOcean**: Monitoring agents
- **Heroku**: New Relic or Papertrail

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build
      - run: npm test
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📈 Performance Optimization

### 1. Database Connection Pooling

For PostgreSQL:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&connection_limit=5"
```

### 2. Caching Strategy

```typescript
// In API routes
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
```

### 3. Static Generation

Use ISR (Incremental Static Regeneration) for reports:
```typescript
export const revalidate = 3600 // Revalidate every hour
```

---

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull
npx prisma db execute --stdin < script.sql
```

### Migration Issues
```bash
# Reset migrations (dev only!)
npx prisma migrate reset

# Verify migration status
npx prisma migrate status
```

### Performance Issues
```bash
# Check slow queries
npx prisma studio

# Analyze database
npx prisma db execute
```

---

## 🆘 Rollback Procedure

### Rollback Database
```bash
# Create migration
npx prisma migrate dev --name rollback_feature

# Revert to previous state
npx prisma db push
```

### Rollback Deployment

**Vercel:**
```bash
vercel rollback
```

**Docker:**
```bash
docker pull your-registry/inventorypro:previous-tag
docker-compose up -d
```

---

## 📋 Post-Deployment Checklist

- [ ] Access application in browser
- [ ] Test login with new credentials
- [ ] Verify all API endpoints working
- [ ] Test CRUD operations
- [ ] Check database connection
- [ ] Verify backups are scheduled
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test backup/restore process
- [ ] Verify HTTPS certificate
- [ ] Set up monitoring alerts
- [ ] Document any custom configurations
- [ ] Update team on deployment

---

## 🔐 Regular Maintenance

### Weekly
- Check error logs
- Monitor disk usage
- Review failed transactions

### Monthly
- Update dependencies
- Run security audit
- Review access logs
- Test backup restoration

### Quarterly
- Rotate secrets/tokens
- Update security policies
- Performance analysis
- Database optimization

---

## 📞 Support

For issues:
1. Check application logs
2. Review Sentry/error tracking
3. Check database status
4. Verify environment variables
5. Contact hosting provider support

---

Last Updated: 2025-12-31
