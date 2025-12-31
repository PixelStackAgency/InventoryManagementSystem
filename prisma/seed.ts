import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // NOTE: NO DEFAULT CREDENTIALS
  // The first admin user must be created through the secure registration/setup process
  // This prevents exposure of default credentials in version control
  
  console.log('🔐 Setting up permissions (no default users created)...')

  // Create default permissions required by the system
  const permissions = [
    { name: 'MANAGE_PRODUCTS', description: 'Create, edit, delete products' },
    { name: 'MANAGE_CUSTOMERS', description: 'Create, edit, delete customers' },
    { name: 'MANAGE_SUPPLIERS', description: 'Create, edit, delete suppliers' },
    { name: 'MANAGE_PURCHASES', description: 'Create, edit, delete purchase orders' },
    { name: 'MANAGE_SALES', description: 'Create, edit, delete sales transactions' },
    { name: 'VIEW_PRICES', description: 'View pricing and cost information' },
    { name: 'VIEW_QUANTITIES', description: 'View stock levels' },
    { name: 'MANAGE_STAFF', description: 'Create, edit, deactivate staff users and assign permissions' },
    { name: 'MANAGE_SETTINGS', description: 'Change system settings and business configuration' }
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    })
  }
  console.log('✓ Permissions created/verified')

  // Create default system settings
  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: 'InventoryPro',
      businessType: 'RETAILER',
      enableShelfLocation: false,
      enableWarehouseMode: false,
      currencySymbol: '₹',
      enableBulkImport: true
    }
  })
  console.log('✓ System settings initialized')
  console.log('\n✅ Database seeding completed successfully!')
  console.log('📝 NEXT STEP: Create your first admin user through the secure registration endpoint')
}

main()
  .catch(e => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
