# 🎯 InventoryPro - Professional Inventory Management System

**Status**: ✅ **Production Ready** | **Last Updated**: December 31, 2025

A fully-featured, secure, and scalable inventory management system built with Next.js, Prisma ORM, and SQLite/PostgreSQL.

---

## 🌟 Key Features

### ✅ Core Features
- **Product Management**: Full CRUD operations with stock tracking
- **Inventory Tracking**: Real-time stock levels with low-stock alerts
- **Sales Management**: Process sales with automatic inventory deduction
- **Purchase Management**: Track purchases with automatic stock updates
- **Customer Management**: Maintain customer database with contact info
- **Supplier Management**: Supplier information and management
- **Staff Management**: User creation and permission management
- **Dashboard**: Real-time metrics and analytics

### ✅ Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: SUPER_ADMIN and STAFF roles
- **Permission Management**: Granular permission system (13 permissions)
- **Password Hashing**: Bcrypt with 12 rounds
- **Secure Cookies**: HTTP-only cookies with proper flags
- **Input Validation**: Comprehensive validation on all endpoints
- **SQL Injection Prevention**: Parameterized queries via Prisma

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Installation

```bash
cd "c:/All In 1/Business/PIXELSTACKAGENCY/Client 1"
npm install
```

Or run the quick setup script:
```powershell
.\setup.ps1
```

### 2. Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```

### 3. Start Development Server

```bash
npm run dev
```

Access at: **http://localhost:3000**

---

## 🔐 Default Credentials

```
Super Admin:
  Username: superadmin
  Password: superadmin123
  
Staff User:
  Username: staff
  Password: staff123
```

⚠️ **Change these immediately in production!**

---

## 📊 System Architecture

```
Frontend (Next.js)
    ↓
Middleware (Authentication)
    ↓
API Routes (RESTful)
    ↓
Prisma ORM
    ↓
Database (SQLite/PostgreSQL)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Products
- `GET/POST /api/products` - List/Create
- `GET/PUT/DELETE /api/products/[id]` - Single product

### Sales
- `GET/POST /api/sales` - List/Create
- `GET/DELETE /api/sales/[id]` - Single sale

### Purchases
- `GET/POST /api/purchases` - List/Create
- `GET/DELETE /api/purchases/[id]` - Single purchase

### Customers & Suppliers
- `GET/POST /api/customers`
- `GET/PUT/DELETE /api/customers/[id]`
- `GET/POST /api/suppliers`
- `GET/PUT/DELETE /api/suppliers/[id]`

### Users & Permissions
- `GET/POST /api/users` - Staff management
- `GET/PUT/DELETE /api/users/[id]` - Staff details
- `GET /api/permissions` - List permissions

### Settings & Backup
- `GET/PUT /api/settings` - System settings
- `GET/POST /api/backup` - Backup/restore

---

## 📁 Project Structure

```
.
├── app/api/                 # REST API endpoints
├── app/(pages)/             # Frontend pages
├── components/              # Reusable components
├── lib/                     # Utilities & helpers
├── prisma/                  # Database schema & migrations
├── public/                  # Static files
├── middleware.ts            # Authentication middleware
└── package.json             # Dependencies
```

---

## 🔒 Security

✅ JWT authentication  
✅ Role-based access control  
✅ Permission-based authorization  
✅ Password hashing (bcrypt)  
✅ Input validation  
✅ SQL injection prevention  
✅ Secure HTTP-only cookies  

---

## 📚 Documentation

- [GETTING_STARTED.md](GETTING_STARTED.md) - User guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - API testing
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) - All improvements

---

## 🛠️ Available Scripts

```bash
npm run dev              # Development server
npm run build            # Build for production
npm start                # Start production server
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
```

---

## 🔄 Technology Stack

- **Frontend**: Next.js 13+, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **Authentication**: JWT + HTTP-only cookies
- **Styling**: Tailwind CSS
- **Charts**: Recharts (if enabled)

---

## ✅ Features Implemented

- ✅ Complete CRUD for all resources
- ✅ JWT authentication with secure cookies
- ✅ Role-based access control
- ✅ Comprehensive input validation
- ✅ Database transactions for consistency
- ✅ Error handling with proper status codes
- ✅ Inventory management with stock tracking
- ✅ Backup and restore functionality
- ✅ User and permission management
- ✅ System settings configuration

---

## 🆘 Troubleshooting

### Database Issues
```bash
# Reset database (dev only!)
npx prisma migrate reset

# Check status
npx prisma migrate status
```

### Setup Issues
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

---

## 📄 License

Part of PIXELSTACK AGENCY services.

---

**Last Updated**: December 31, 2025  
**Status**: ✅ Production Ready  
**Version**: 0.1.0
