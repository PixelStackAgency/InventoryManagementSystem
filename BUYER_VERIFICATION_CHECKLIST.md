# BUYER'S VERIFICATION CHECKLIST

Use this to verify everything works before going live.

---

## ✅ PRE-LAUNCH VERIFICATION (30 minutes)

### Step 1: Setup Verification (5 minutes)

- [ ] Run `npm install` - installs without errors
- [ ] Run `npx prisma migrate deploy` - migrations apply successfully
- [ ] Run `npx prisma db seed` - seed completes (shows "✓ Permissions created/verified")
- [ ] Database schema matches expectations (11 tables)

### Step 2: First Admin Creation (2 minutes)

```bash
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "TestPass@123",
    "businessName": "My Business"
  }'
```

- [ ] Returns 201 status
- [ ] Response includes user object
- [ ] User has SUPER_ADMIN role
- [ ] All permissions assigned (9 total)

### Step 3: Development Server (2 minutes)

```bash
npm run dev
```

- [ ] Starts without errors
- [ ] Available at http://localhost:3000
- [ ] No console errors

### Step 4: Login Test (5 minutes)

1. Navigate to http://localhost:3000
2. Should redirect to /login page
   - [ ] Login page displays
   - [ ] "Secure Authentication" message shows
   - [ ] No "Demo Accounts" message

3. Enter credentials (admin / TestPass@123)
   - [ ] Login button works
   - [ ] Redirects to dashboard
   - [ ] User info shows in top right

4. Click logout
   - [ ] Logs out successfully
   - [ ] Redirects to login page

### Step 5: Feature Verification (10 minutes)

#### Products
- [ ] Click Products menu
- [ ] Can view product list (shows 0 products initially)
- [ ] Can add new product
- [ ] Required fields validated (article number, name)
- [ ] Can edit product
- [ ] Can delete product

#### Customers
- [ ] Click Customers menu
- [ ] Can add new customer
- [ ] Customer appears in list
- [ ] Can edit customer
- [ ] Can delete customer

#### Sales
- [ ] Click Sales menu
- [ ] Can create new sale
- [ ] Must select customer
- [ ] Must add items
- [ ] Subtotal auto-calculates
- [ ] Can apply discount
- [ ] Can complete sale

#### Purchases
- [ ] Click Purchases menu
- [ ] Can create new purchase
- [ ] Must select supplier
- [ ] Must add items
- [ ] Can complete purchase

#### Staff Management
- [ ] Click Staff menu
- [ ] Can create new staff user
- [ ] Password validates (8+ chars, mixed case, number, special)
- [ ] Can assign permissions
- [ ] Can see staff list

### Step 6: Permission Testing (3 minutes)

Create a staff user WITHOUT "MANAGE_PRODUCTS" permission:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<staff-token>" \
  -d '{
    "articleNumber": "TEST",
    "name": "Test",
    "purchasePrice": 100,
    "sellingPrice": 150
  }'
```

- [ ] Returns 403 Forbidden
- [ ] Error message mentions missing permission

Assign MANAGE_PRODUCTS permission and retry:
- [ ] Returns 201 Created
- [ ] Product created successfully

### Step 7: Security Verification (3 minutes)

#### No Default Credentials
- [ ] Cannot login with "superadmin/superadmin123"
- [ ] No demo account info visible on login page
- [ ] Setup endpoint rejects if users already exist

#### Password Requirements
Try creating staff user with weak password "pass":
- [ ] Rejected (too short)

Try "Pass" (no number):
- [ ] Rejected

Try "Pass1" (no special char):
- [ ] Rejected

Try "Pass1@Test":
- [ ] Accepted ✓

#### Authorization
Try accessing protected endpoint without login:
```bash
curl http://localhost:3000/api/products
```
- [ ] Returns 401 Unauthorized

Try accessing with invalid token:
```bash
curl http://localhost:3000/api/products \
  -H "Cookie: token=invalid"
```
- [ ] Returns 401 Unauthorized

---

## ✅ PRODUCTION VERIFICATION

### Before Deploying

1. **Environment Setup**
   - [ ] Generated new JWT_SECRET
   - [ ] Set DATABASE_URL to production database
   - [ ] Set NODE_ENV to "production"
   - [ ] Set NEXT_PUBLIC_API_URL to your domain
   - [ ] Set CORS_ORIGIN to your domain
   - [ ] NO .env file committed to git

2. **Database**
   - [ ] Using PostgreSQL (or MySQL)
   - [ ] NOT using SQLite
   - [ ] Database backup configured
   - [ ] Migrations tested

3. **TLS/HTTPS**
   - [ ] Certificate installed
   - [ ] HTTPS enforced
   - [ ] HTTP redirects to HTTPS

4. **Deployment**
   - [ ] Vercel/Railway/Render configured
   - [ ] Environment variables set
   - [ ] Build succeeds
   - [ ] Staging test passed

### Post-Deployment

1. **Test on Production**
   ```bash
   curl -X POST https://yourdomain.com/api/auth/setup \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "YourStrong@Pass123",
       "businessName": "Production Business"
     }'
   ```
   - [ ] Returns 201 (admin created)
   - [ ] Uses HTTPS (not HTTP)

2. **Browser Test**
   - [ ] Can access https://yourdomain.com
   - [ ] Login page displays
   - [ ] Can login
   - [ ] Dashboard loads
   - [ ] All features work

3. **Security Check**
   - [ ] Browser developer tools show no console errors
   - [ ] HTTPS lock icon shows
   - [ ] Headers include X-Frame-Options

4. **Performance**
   - [ ] Page loads within 2-3 seconds
   - [ ] No 500 errors
   - [ ] Features respond quickly

---

## ✅ COMMON VERIFICATION ISSUES

### Login Not Working
- [ ] Check if admin user was created successfully
- [ ] Verify password meets requirements
- [ ] Check JWT_SECRET is set
- [ ] Ensure database connection works

### Database Connection Error
- [ ] Verify DATABASE_URL is correct
- [ ] Check database server is running
- [ ] Verify credentials are valid
- [ ] Check firewall rules

### 403 Permission Denied
- [ ] Check user role in database
- [ ] Verify permissions are assigned
- [ ] Check permission is granted (not just created)

### 500 Server Errors
- [ ] Check application logs
- [ ] Verify all environment variables set
- [ ] Ensure Node.js version 14+
- [ ] Try restarting application

---

## ✅ FINAL SIGN-OFF

When all checks pass, you're ready to go live!

- [ ] All verification steps completed
- [ ] All features tested
- [ ] Security verified
- [ ] Deployment successful
- [ ] Performance acceptable
- [ ] Ready to announce to customers

---

## 📞 TROUBLESHOOTING

If you encounter any issues, check:

1. **Setup Problems** → See QUICK_REFERENCE.md
2. **Feature Questions** → See PRODUCTION_READY.md
3. **Deployment Help** → See DEPLOYMENT_CHECKLIST.md
4. **What's Different** → See RELEASE_NOTES_v1.0.0.md

---

**Congratulations! Your inventory system is ready! 🎉**
