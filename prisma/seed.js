const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')
  
  const superadminPwd = await bcrypt.hash('superadmin123', 10)
  const staffPwd = await bcrypt.hash('staff123', 10)

  const permissionNames = [
    'VIEW_PRICES',
    'VIEW_QUANTITIES',
    'VIEW_CLIENT_DETAILS',
    'VIEW_REPORTS',
    'MANAGE_PRODUCTS',
    'MANAGE_STOCK',
    'MANAGE_PURCHASES',
    'MANAGE_SALES',
    'MANAGE_CUSTOMERS',
    'MANAGE_SUPPLIERS',
    'MANAGE_STAFF',
    'MANAGE_SETTINGS',
    'MANAGE_USERS'
  ]

  // Upsert permissions
  console.log('Creating permissions...')
  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: { description: `${name} permission` },
      create: { name, description: `${name} permission` }
    })
  }

  // Create or update super admin user
  console.log('Creating superadmin user...')
  const admin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: superadminPwd, role: 'SUPER_ADMIN' },
    create: { username: 'superadmin', password: superadminPwd, role: 'SUPER_ADMIN' }
  })

  // Grant all permissions to superadmin
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId: admin.id, permissionId: perm.id } },
      update: { granted: true },
      create: { userId: admin.id, permissionId: perm.id, granted: true }
    })
  }

  // Create sample staff user
  console.log('Creating sample staff user...')
  const staffUser = await prisma.user.upsert({
    where: { username: 'staff' },
    update: { password: staffPwd, role: 'STAFF' },
    create: { username: 'staff', password: staffPwd, role: 'STAFF' }
  })

  // Grant staff permissions
  const staffPermissions = [
    'VIEW_PRICES', 'VIEW_QUANTITIES', 'VIEW_CLIENT_DETAILS',
    'MANAGE_PRODUCTS', 'MANAGE_STOCK', 'MANAGE_PURCHASES', 'MANAGE_SALES'
  ]
  
  for (const perm of allPermissions) {
    if (staffPermissions.includes(perm.name)) {
      await prisma.userPermission.upsert({
        where: { userId_permissionId: { userId: staffUser.id, permissionId: perm.id } },
        update: { granted: true },
        create: { userId: staffUser.id, permissionId: perm.id, granted: true }
      })
    }
  }

  // Create system settings if not exists
  console.log('Creating system settings...')
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

  console.log('✅ Seed complete!')
  console.log('📊 Default Credentials:')
  console.log('   - Super Admin: superadmin / superadmin123')
  console.log('   - Staff User: staff / staff123')
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
