# 🚀 Quick Start Guide

## 📝 Default Credentials

**Username**: `superadmin`  
**Password**: `superadmin123`

---

## 🌐 Application URL

When running locally:
```
http://localhost:3002
```

Or on your network:
```
http://192.168.1.6:3002
```

---

## 🎯 Getting Started (5 Minutes)

### Step 1: Login
1. Go to the application URL above
2. Enter username: `superadmin`
3. Enter password: `superadmin123`
4. Click "Sign In"

### Step 2: Add Your First Product
1. Navigate to **Products** from the top navigation
2. Click **+ Add Product**
3. Fill in the form:
   - Article Number: `SKU001`
   - Product Name: `Sample Product`
   - Category: `Electronics`
   - Brand: `TestBrand`
   - Purchase Price: `100`
   - Selling Price: `150`
   - Quantity: `10`
   - Min Stock: `2`
4. Click **✨ Save Product**
5. You'll see a green toast notification confirming success!

### Step 3: Add Your First Customer
1. Navigate to **Customers** from the top navigation
2. Click **+ Add Customer**
3. Fill in the form:
   - Full Name: `John Doe`
   - Phone: `+1-555-0123`
   - Address: `123 Main Street, New York, NY 10001`
4. Click **✨ Save Customer**
5. Success toast will appear!

### Step 4: Create Your First Sale
1. Navigate to **Sales** from the top navigation
2. Click **+ Record Sale**
3. Fill in the form:
   - Customer: `John Doe` (optional, but recommended)
   - Payment Mode: `CASH` (or your preferred mode)
   - Add Item:
     - Product: `SKU001` (Sample Product)
     - Quantity: `2`
     - Selling Price: `150`
   - Discount: `0` (optional)
4. Click **✨ Record Sale**
5. Success! Your inventory will automatically update

### Step 5: Create Your First Purchase
1. Navigate to **Purchases** from the top navigation
2. Click **+ Record Purchase**
3. Fill in the form:
   - Supplier: Optional
   - Invoice Number: `INV001`
   - Add Item:
     - Product: `SKU001` (Sample Product)
     - Quantity: `5`
     - Purchase Price: `100`
4. Click **✨ Record Purchase**
5. Your inventory has been updated!

---

## 🎨 UI Tour

### **Navigation Bar**
The top navigation includes:
- **InventoryPro** logo - Click to go home
- **Customers** - Manage customer list
- **Products** - Manage inventory
- **Sales** - Record sales transactions
- **Purchases** - Record purchase orders
- **Suppliers** - Manage supplier list
- **Staff** - Manage users and permissions
- **Settings** - Configure system
- **Logout** - Sign out

### **Color Scheme**
- **Blue**: Primary actions (Products)
- **Orange**: Customers
- **Cyan**: Suppliers
- **Green**: Success messages
- **Red**: Errors
- **Dark slate**: Background

### **Common Patterns**

#### **Button Colors**
- **Green/Blue/Orange gradient**: Primary action buttons
- **Light gray**: Cancel/Secondary buttons
- **Red**: Delete buttons
- **Light blue**: Edit buttons

#### **Message Notifications**
- ✅ **Green toast**: Success
- ❌ **Red toast**: Error
- ℹ️ **Blue toast**: Info
- Auto-dismisses in 3 seconds

---

## 📊 Key Features

### **Products Module**
- ✅ Add unlimited products
- ✅ Track stock levels
- ✅ Set minimum stock alerts
- ✅ Calculate profit per unit
- ✅ Export to CSV
- ✅ Search by name or category

### **Sales Module**
- ✅ Record sales transactions
- ✅ Auto-update inventory (decrement)
- ✅ Apply discounts
- ✅ Multiple payment modes
- ✅ Link to customers
- ✅ Export sales reports

### **Purchases Module**
- ✅ Record purchase orders
- ✅ Auto-update inventory (increment)
- ✅ Track invoice numbers
- ✅ Link to suppliers
- ✅ Export purchase reports

### **Customers Module**
- ✅ Maintain customer database
- ✅ Store contact information
- ✅ Track customer addresses
- ✅ Edit customer details
- ✅ Delete customers

### **Suppliers Module**
- ✅ Maintain supplier database
- ✅ Store contact information
- ✅ Link suppliers to purchases
- ✅ Edit supplier details
- ✅ Delete suppliers

### **Staff Module**
- ✅ Create staff users
- ✅ Manage permissions
- ✅ Role-based access control
- ✅ Edit staff permissions
- ✅ Deactivate staff

---

## ⚙️ System Configuration

### **Via Settings Page**

1. Click **Settings** in navigation
2. Configure:

#### **Business Information**
- Business Name: Enter your company name
- Business Type: Select your type
- Currency Symbol: Set your currency (e.g., $, ₹, €)

#### **Features**
- Enable Shelf Location: For warehouse organization
- Enable Warehouse Mode: For multi-location inventory
- Enable Bulk Import: For CSV imports

3. Click **Save Settings** when done

---

## 🔐 Security Notes

- ✅ Passwords are securely hashed
- ✅ Tokens are stored in secure HttpOnly cookies
- ✅ All API calls are authenticated
- ✅ Role-based permissions enforced
- ✅ Logout clears session

**Remember**: Change the default admin password in production!

---

## 💡 Tips & Tricks

1. **Quick Navigation**: Use keyboard shortcuts on supported pages
2. **Search Products**: Use the search bar on Products page for quick lookup
3. **Export Data**: Click "Export to CSV" on Products, Sales, or Purchases pages
4. **Batch Operations**: Use the staff page to assign multiple permissions at once
5. **Toast Notifications**: Watch the bottom-right corner for instant feedback on all actions

---

## 🆘 Troubleshooting

### Issue: Can't login
**Solution**: Verify you're using `superadmin` / `superadmin123`

### Issue: Page won't load
**Solution**: Refresh your browser (Ctrl+R or Cmd+R)

### Issue: No toast notifications appear
**Solution**: Check browser console (F12) for errors

### Issue: Inventory not updating after sale
**Solution**: Ensure you selected a valid product with quantity > 0

### Issue: Can't create product
**Solution**: 
- Article Number is required and must be unique
- All price fields must be filled
- Check for error toast notification for specific issue

---

## 📱 Responsive Design

The application works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile devices (with responsive layout)

Cards adjust to screen size automatically!

---

## 📞 Support

For issues or questions:
1. Check the error message in the red toast notification
2. Look at the browser console (F12 → Console tab)
3. Verify all required fields are filled in forms
4. Ensure you have proper permissions for the action

---

## 🎓 Data Entry Best Practices

### **Products**
- Use consistent article numbering (e.g., SKU-001, PROD-002)
- Set minimum stock to 20-30% of average monthly sales
- Update prices regularly to match market rates

### **Customers**
- Store phone numbers in a consistent format
- Include complete addresses for delivery
- Update contact info regularly

### **Suppliers**
- Maintain backup suppliers for critical items
- Track payment terms and discounts
- Review supplier performance periodically

### **Sales**
- Always select payment mode before recording
- Link to customer for sales tracking
- Apply discounts only for authorized sales

### **Purchases**
- Keep invoice numbers unique
- Record exact quantities received
- Match received quantity with invoice before recording

---

## 🚀 You're Ready!

Start using your InventoryPro system now:
1. ✅ Login
2. ✅ Add products
3. ✅ Add customers
4. ✅ Start recording sales and purchases
5. ✅ Monitor your inventory in real-time

Enjoy! 🎉
