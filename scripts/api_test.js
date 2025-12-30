const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const fetch = global.fetch || require('node-fetch')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-replace-in-production'
const BASE = process.env.BASE_URL || 'http://localhost:3000'

async function main() {
  try {
    const admin = await prisma.user.findUnique({ where: { username: 'superadmin' } })
    if (!admin) {
      console.error('superadmin not found in DB')
      return process.exit(1)
    }

    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '7d' })
    const cookie = `token=${token}; Path=/; HttpOnly`

    console.log('Using admin id:', admin.id)

    // Create supplier via API
    console.log('POST /api/suppliers')
    let res = await fetch(`${BASE}/api/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ name: 'API Test Supplier', contact: 'apitest@example.com' })
    })
    let json = await res.json()
    console.log('Status:', res.status, 'Response:', json)

    // Create purchase via API using product TEST-001
    console.log('POST /api/purchases')
    res = await fetch(`${BASE}/api/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ supplierId: json.id || undefined, invoiceNumber: `API-${Date.now()}`, items: [{ productArtNo: 'TEST-001', quantity: 2, purchasePrice: 10 }] })
    })
    json = await res.json()
    console.log('Status:', res.status, 'Response:', json)

  } catch (e) {
    console.error('Error in api_test:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
