# Complete Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Authentication Tests

### Test 1: Create Admin Account (First Time Setup)
```bash
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@Password123",
    "businessName": "Test Business"
  }'
```

Expected Response (201):
```json
{
  "ok": true,
  "message": "Admin user created successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "SUPER_ADMIN",
    "createdAt": "2025-12-31T..."
  }
}
```

### Test 2: Login with Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@Password123"
  }'
```

Expected Response (200):
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "SUPER_ADMIN"
  }
}
```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff",
    "password": "staff123"
  }'
```

### Test 3: Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'
```

Expected Response (401):
```json
{
  "error": "Invalid credentials"
}
```

### Test 4: Get Current User
```bash
curl -H "Cookie: token=YOUR_TOKEN_HERE" \
  http://localhost:3000/api/auth/me
```

### Test 5: Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

---

## Product Management Tests

### Test 1: Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "articleNumber": "SKU001",
    "name": "Laptop",
    "category": "Electronics",
    "brand": "Dell",
    "purchasePrice": 800,
    "sellingPrice": 1200,
    "quantity": 5,
    "minStock": 2,
    "unit": "pcs",
    "taxEnabled": true,
    "taxPercent": 5
  }'
```

### Test 2: Get All Products
```bash
curl http://localhost:3000/api/products
```

### Test 3: Get Single Product
```bash
curl http://localhost:3000/api/products/SKU001
```

### Test 4: Update Product
```bash
curl -X PUT http://localhost:3000/api/products/SKU001 \
  -H "Content-Type: application/json" \
  -d '{
    "sellingPrice": 1300,
    "quantity": 10
  }'
```

### Test 5: Delete Product
```bash
curl -X DELETE http://localhost:3000/api/products/SKU001
```

---

## Customer Management Tests

### Test 1: Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  }'
```

### Test 2: Get All Customers
```bash
curl http://localhost:3000/api/customers
```

### Test 3: Get Customer Details
```bash
curl http://localhost:3000/api/customers/1
```

### Test 4: Update Customer
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9876543210",
    "address": "456 New St, City, State"
  }'
```

### Test 5: Delete Customer
```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

---

## Supplier Management Tests

### Test 1: Create Supplier
```bash
curl -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechSupply Inc",
    "contact": "supplier@techsupply.com"
  }'
```

### Test 2: Get All Suppliers
```bash
curl http://localhost:3000/api/suppliers
```

### Test 3: Update Supplier
```bash
curl -X PUT http://localhost:3000/api/suppliers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "newemail@techsupply.com"
  }'
```

---

## Sales Management Tests

### Test 1: Create Sale
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "paymentMode": "CASH",
    "items": [
      {
        "productArtNo": "SKU001",
        "quantity": 2,
        "sellingPrice": 1200
      }
    ],
    "discount": 0
  }'
```

### Test 2: Get All Sales
```bash
curl http://localhost:3000/api/sales
```

### Test 3: Get Sale Details
```bash
curl http://localhost:3000/api/sales/1
```

### Test 4: Delete Sale
```bash
curl -X DELETE http://localhost:3000/api/sales/1
```

---

## Purchase Management Tests

### Test 1: Create Purchase
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "invoiceNumber": "INV-001",
    "items": [
      {
        "productArtNo": "SKU001",
        "quantity": 10,
        "purchasePrice": 800
      }
    ]
  }'
```

### Test 2: Get All Purchases
```bash
curl http://localhost:3000/api/purchases
```

### Test 3: Get Purchase Details
```bash
curl http://localhost:3000/api/purchases/1
```

### Test 4: Delete Purchase
```bash
curl -X DELETE http://localhost:3000/api/purchases/1
```

---

## User Management Tests

### Test 1: Create Staff User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newstaff",
    "password": "securepass123",
    "permissions": [1, 2, 3, 4, 5]
  }'
```

### Test 2: Get All Users
```bash
curl http://localhost:3000/api/users
```

### Test 3: Update User Permissions
```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [1, 2, 3]
  }'
```

### Test 4: Change User Password
```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

### Test 5: Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/2
```

---

## Permissions Tests

### Test 1: Get All Permissions
```bash
curl http://localhost:3000/api/permissions
```

Expected Response:
```json
[
  { "id": 1, "name": "VIEW_PRICES", "description": "VIEW_PRICES permission" },
  { "id": 2, "name": "VIEW_QUANTITIES", "description": "VIEW_QUANTITIES permission" },
  ...
]
```

---

## Settings Tests

### Test 1: Get Settings
```bash
curl http://localhost:3000/api/settings
```

### Test 2: Update Settings
```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "MyInventoryStore",
    "businessType": "RETAILER",
    "currencySymbol": "$",
    "enableShelfLocation": true
  }'
```

---

## Backup Tests

### Test 1: Export Backup
```bash
curl http://localhost:3000/api/backup > backup.json
```

### Test 2: Restore from Backup
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d @backup.json
```

---

## Error Handling Tests

### Test 1: Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product"
  }'
```

Expected Response (400):
```json
{
  "error": "Article number is required"
}
```

### Test 2: Invalid Data Type
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "articleNumber": "SKU002",
    "name": "Product",
    "purchasePrice": "invalid",
    "sellingPrice": 100
  }'
```

Expected Response (400):
```json
{
  "error": "Purchase price must be a valid positive number"
}
```

### Test 3: Unauthorized Access
```bash
curl http://localhost:3000/api/users
```

Expected Response (401):
```json
{
  "error": "Unauthorized - No token provided"
}
```

### Test 4: Not Found
```bash
curl http://localhost:3000/api/products/NONEXISTENT
```

Expected Response (404):
```json
{
  "error": "Product not found"
}
```

---

## Authorization Tests

### Test 1: Permission Denied
Create staff user with limited permissions, then try to delete product:

```bash
curl -X DELETE http://localhost:3000/api/products/SKU001
```

Expected Response (403):
```json
{
  "error": "Forbidden - Missing permission: MANAGE_PRODUCTS"
}
```

### Test 2: Super Admin Override
Super admin can perform any action regardless of permissions

---

## Performance Tests

### Test 1: Batch Operations
Create multiple products and verify response time:

```bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/products \
    -H "Content-Type: application/json" \
    -d "{
      \"articleNumber\": \"SKU$i\",
      \"name\": \"Product $i\",
      \"purchasePrice\": 100,
      \"sellingPrice\": 150
    }"
done
```

---

## Frontend Tests

1. Login Page
   - Test valid credentials ✅
   - Test invalid credentials ✅
   - Test empty fields ✅

2. Dashboard
   - Verify metrics display ✅
   - Check low stock alerts ✅
   - Verify charts (if implemented) ✅

3. Product Management
   - Add product ✅
   - Edit product ✅
   - Delete product ✅
   - Search products ✅

4. Sales Module
   - Create sale ✅
   - View sale details ✅
   - Print invoice ✅

5. Purchase Module
   - Create purchase ✅
   - View purchase history ✅

6. User Management
   - Create user ✅
   - Edit permissions ✅
   - Delete user ✅

---

## Integration Tests

### Test: Complete Sales Workflow
1. Create product: SKU100, qty=10, price=100
2. Create customer: John Doe
3. Create sale: 2 units to John
4. Verify inventory reduced to 8
5. Delete sale
6. Verify inventory restored to 10

### Test: Complete Purchase Workflow
1. Create supplier: ABC Corp
2. Create product: SKU200, qty=5
3. Create purchase: 5 units from ABC Corp
4. Verify inventory increased to 10
5. Delete purchase
6. Verify inventory reduced to 5

---

## Checklist for Go-Live

- [ ] All CRUD operations tested
- [ ] Authentication working correctly
- [ ] Authorization enforced
- [ ] Error messages clear and helpful
- [ ] Inventory calculations accurate
- [ ] Transactions rolling back on errors
- [ ] Backup/restore working
- [ ] Default credentials changed
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Documentation complete

---

Last Updated: 2025-12-31
