import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: NextRequest) {
  try {
    // Only super admin can access backups
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth
    
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admin can access backups' },
        { status: 403 }
      )
    }

    // Export core tables as JSON
    const [users, products, suppliers, customers, purchases, purchaseItems, sales, saleItems] = await Promise.all([
      prisma.user.findMany(),
      prisma.product.findMany(),
      prisma.supplier.findMany(),
      prisma.customer.findMany(),
      prisma.purchase.findMany(),
      prisma.purchaseItem.findMany(),
      prisma.sale.findMany(),
      prisma.saleItem.findMany()
    ])

    const payload = { users, products, suppliers, customers, purchases, purchaseItems, sales, saleItems }
    return NextResponse.json(payload)
  } catch (error: any) {
    console.error('Backup GET error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only super admin can restore backups
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth
    
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admin can restore backups' },
        { status: 403 }
      )
    }

    // Restore from JSON backup - expect full DB dump
    const body = await req.json()
    if (!body) return NextResponse.json({ error: 'Missing backup payload' }, { status: 400 })

    try {
      await prisma.$transaction(async (tx) => {
        // Clear tables (order matters)
        await tx.saleItem.deleteMany()
        await tx.sale.deleteMany()
        await tx.purchaseItem.deleteMany()
        await tx.purchase.deleteMany()
        await tx.product.deleteMany()
        await tx.customer.deleteMany()
        await tx.supplier.deleteMany()
        await tx.user.deleteMany()

        // Restore
        if (body.users?.length) {
          for (const u of body.users) {
            await tx.user.create({ data: u })
          }
        }
        if (body.products?.length) {
          for (const p of body.products) {
            await tx.product.create({ data: p })
          }
        }
        if (body.suppliers?.length) {
          for (const s of body.suppliers) await tx.supplier.create({ data: s })
        }
        if (body.customers?.length) {
          for (const c of body.customers) await tx.customer.create({ data: c })
        }
        if (body.purchases?.length) {
          for (const p of body.purchases) await tx.purchase.create({ data: p })
        }
        if (body.purchaseItems?.length) {
          for (const pi of body.purchaseItems) await tx.purchaseItem.create({ data: pi })
        }
        if (body.sales?.length) {
          for (const s of body.sales) await tx.sale.create({ data: s })
        }
        if (body.saleItems?.length) {
          for (const si of body.saleItems) await tx.saleItem.create({ data: si })
        }
      })
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Backup POST error:', error)
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    )
  }
}
