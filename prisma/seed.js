const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminPwd = await bcrypt.hash('superadmin123', 10)

  const permissionNames = [
    'VIEW_PRICES',
    'VIEW_QUANTITIES',
    'VIEW_CLIENT_DETAILS',
    'VIEW_REPORTS',
    'MANAGE_PRODUCTS',
    'MANAGE_STOCK',
    'MANAGE_PURCHASES',
    'MANAGE_SALES',
    'MANAGE_USERS'
  ]

  // Upsert permissions
  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: { description: `${name} permission` },
      create: { name, description: `${name} permission` }
    })
  }

  // Create or update super admin user
  const admin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: adminPwd, role: 'SUPER_ADMIN' },
    create: { username: 'superadmin', password: adminPwd, role: 'SUPER_ADMIN' }
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

  console.log('Seed complete: superadmin / superadmin123 with all permissions')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
