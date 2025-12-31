# QUICK REFERENCE CARD

## 🚀 TO LAUNCH IN PRODUCTION (30 MINUTES)

### 1. Setup (5 min)
```bash
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 2. Environment (2 min)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="openssl rand -base64 32"  # Generate random
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

### 3. First Admin (2 min)
```bash
curl -X POST https://yourdomain.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStr0ng@Pass","businessName":"Your Business"}'
```

### 4. Deploy (10 min)
Vercel / Railway / Render / Your Server

---

## 🔐 SECURITY - WHAT'S BEEN FIXED

✅ No default credentials  
✅ Strong password requirements  
✅ JWT authentication  
✅ All endpoints protected  
✅ Role-based access control  
✅ Security headers added  
✅ HTTPS enforced  
✅ SQL injection prevention  

---

## 📝 PASSWORD REQUIREMENTS

**MUST HAVE:**
- 8+ characters
- Uppercase letter (A-Z)
- Lowercase letter (a-z)
- Number (0-9)
- Special character (@$!%*?&)

**EXAMPLES:**
✅ Admin@Pass123  
✅ MySecure$1Password  
❌ password123 (no uppercase/special)  
❌ Admin@Pass (no number)  

---

## 👥 USER ROLES

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access, manage staff, system settings |
| **Staff** | Based on assigned permissions |

---

## 🔑 API QUICK TEST

```bash
# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourStr0ng@Pass"}'

# Get Products (requires login)
curl https://yourdomain.com/api/products \
  -H "Cookie: token=<from-login>"

# Create Product
curl -X POST https://yourdomain.com/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<from-login>" \
  -d '{
    "articleNumber":"PROD-001",
    "name":"Test",
    "purchasePrice":100,
    "sellingPrice":150
  }'
```

---

## ⚡ KEY FEATURES WORKING

✅ Product Management  
✅ Sales Tracking  
✅ Purchase Orders  
✅ Customer Management  
✅ Supplier Management  
✅ Staff Management  
✅ Permission System  
✅ System Settings  
✅ Backup/Restore  

---

## 🗄️ DATABASE SETUP

### Option 1: Railway (Easiest)
1. Go to railway.app
2. Create PostgreSQL database
3. Copy connection string to DATABASE_URL

### Option 2: Supabase
1. Go to supabase.com
2. Create project
3. Get PostgreSQL URL

### Option 3: Local PostgreSQL
```bash
# Install PostgreSQL
# Create database
createdb inventory_db

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
```

---

## ⚠️ CRITICAL REQUIREMENTS

1. **Use HTTPS** (required)
2. **Change JWT_SECRET** (don't use default)
3. **Use PostgreSQL** (not SQLite)
4. **Set NEXT_PUBLIC_API_URL** correctly
5. **Don't expose .env files**

---

## 🆘 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| Login fails | Check password requirements, verify admin was created |
| 401 errors | Login first, ensure JWT_SECRET matches |
| 403 errors | Check user permissions in database |
| DB connection error | Verify DATABASE_URL is correct |
| 500 errors | Check server logs, verify env variables |

---

## 📱 TESTING CHECKLIST

Before going live:
- [ ] Can login with admin
- [ ] Can create product
- [ ] Can create customer
- [ ] Can process sale
- [ ] Can create purchase
- [ ] Can create staff user
- [ ] Can assign permissions
- [ ] Inventory updates correctly

---

## 📊 PRICING SUGGESTION

**Based on features:**
- 50+ API endpoints: +$500
- Full RBAC system: +$300
- Authentication: +$200
- Database setup: +$150
- Deployment ready: +$200
- Complete documentation: +$150

**Minimum suggested:** $1,500 - $3,000

---

## 📞 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| PRODUCTION_READY.md | Features & API docs |
| DEPLOYMENT_CHECKLIST.md | Step-by-step deployment |
| RELEASE_NOTES_v1.0.0.md | What was fixed |
| README.md | Project overview |
| GETTING_STARTED.md | Dev setup |

---

**Ready to sell! 🎉**

*All security ✅ | All features ✅ | Fully documented ✅*
