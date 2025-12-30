import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create superadmin user
  const hashedPassword = await hash('superadmin123', 10)
  const superadmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: hashedPassword },
    create: {
      username: 'superadmin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  })
  console.log('✓ Superadmin user created/updated (username: superadmin, password: superadmin123)')

  // Create permissions
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

  // Assign all permissions to superadmin
  const superadminPermissions = await prisma.permission.findMany()
  for (const perm of superadminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: superadmin.id,
          permissionId: perm.id
        }
      },
      update: { granted: true },
      create: {
        userId: superadmin.id,
        permissionId: perm.id,
        granted: true
      }
    })
  }
  console.log('✓ All permissions assigned to superadmin')

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
  console.log('✓ System settings created with defaults')
  console.log('\n✅ Database seeding completed successfully!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
