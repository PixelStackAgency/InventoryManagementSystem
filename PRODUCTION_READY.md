# InventoryPro - Production Ready

Professional inventory management system with secure role-based access control (RBAC).

## 🔐 Security Status
✅ **Production Ready** - All security best practices implemented:
- No default credentials
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 rounds)
- JWT authentication with secure cookies
- Security headers (CSP, X-Frame-Options, etc.)
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- Authorization checks on all protected endpoints

## 🚀 Quick Start

### 1. Initial Setup (First Time Only)

```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate deploy
npx prisma db seed

# Create first admin user
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourStrong@Pass123",
    "businessName": "Your Business Name"
  }'

# Start development server
npm run dev
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### 2. Production Deployment

#### Environment Variables (.env.production)
```env
# Database (use managed service like Render, Railway, Supabase)
DATABASE_URL="postgresql://user:password@host:5432/inventory_prod"

# Generate strong JWT secret: openssl rand -base64 32
JWT_SECRET="your-generated-secret-here"

# Set to production
NODE_ENV="production"

# Your domain
NEXT_PUBLIC_API_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
```

#### Deploy to Vercel
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel deploy --prod
```

#### Deploy to Other Platforms
The application is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Railway
- Render
- Heroku
- AWS (Amplify)
- Azure (App Service)
- Google Cloud (Cloud Run)

## 📋 Features

### Core Functionality
- ✅ Product Management (Add, Edit, Delete, Search)
- ✅ Purchase Management (Track supplier purchases)
- ✅ Sales Management (Process customer sales)
- ✅ Customer Management
- ✅ Supplier Management
- ✅ Inventory Tracking with Stock Levels
- ✅ Staff Management
- ✅ Permission-based Access Control

### Admin Features
- 🔐 User & Staff Management
- 📊 System Settings
- 🔄 Database Backup & Restore
- 📈 Reports & Analytics

## 👥 User Roles

### Super Admin
- Full system access
- Create/manage staff users
- Manage permissions
- Access system settings
- Database backup/restore

### Staff
- Limited permissions based on role assignment
- Can manage assigned areas
- Cannot modify system settings

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/setup` - Create first admin (only if no users exist)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (requires MANAGE_PRODUCTS)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create sale (requires MANAGE_SALES)
- `GET /api/sales/[id]` - Get sale details

### Purchases
- `GET /api/purchases` - List all purchases
- `POST /api/purchases` - Create purchase (requires MANAGE_PURCHASES)
- `GET /api/purchases/[id]` - Get purchase details

### Users & Permissions
- `GET /api/users` - List staff users
- `POST /api/users` - Create staff user (requires MANAGE_STAFF)
- `GET /api/permissions` - List all permissions
- `GET /api/permissions/[id]` - Get permission details

### System
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update settings (requires MANAGE_SETTINGS)
- `GET /api/backup` - Export database backup (super admin only)
- `POST /api/backup` - Restore database (super admin only)

## 🗄️ Database

### Recommended for Production
- **PostgreSQL** (recommended)
- MySQL
- SQL Server
- Firebase

### Current Development
- SQLite (dev only)

## 📦 Tech Stack

- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** Prisma ORM
- **Authentication:** JWT + Secure Cookies
- **Security:** bcryptjs, CSP Headers, CORS

## 🧪 Testing

The application is production-ready and has been tested for:
- ✅ Login/Authentication
- ✅ Product CRUD operations
- ✅ Sales & Purchase tracking
- ✅ Permission system
- ✅ User management
- ✅ API security
- ✅ Database integrity

## ⚠️ Important Security Notes

1. **NEVER commit .env files** - Use environment variables
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production (enforced by middleware)
4. **Backup database** regularly
5. **Review permissions** for all staff users
6. **Update dependencies** regularly for security patches
7. **Monitor logs** for suspicious activity

## 🐛 Troubleshooting

### Users can't log in
1. Verify user exists in database
2. Check password requirements (8+ chars, mixed case, number, special char)
3. Ensure JWT_SECRET is set correctly

### Permission denied errors
1. Check user role in database
2. Verify permissions are granted to user
3. Confirm endpoint requires specific permission

### Database connection issues
1. Verify DATABASE_URL is correct
2. Check database service is running
3. Ensure credentials are valid

## 📞 Support

For issues or questions, please refer to the documentation or contact support.

---

**Last Updated:** December 31, 2025  
**Version:** 1.0.0 (Production Ready)
