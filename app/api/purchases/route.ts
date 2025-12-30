import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  const purchases = await prisma.purchase.findMany({ include: { items: true, supplier: true }, orderBy: { purchaseDate: 'desc' } })
  return NextResponse.json(purchases)
}

export async function POST(req: Request) {
  const auth = await authorize('MANAGE_PURCHASES')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { supplierId, invoiceNumber, purchaseDate, items } = body
  const supplierIdNum = supplierId ? Number(supplierId) : undefined

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  const totalAmount = items.reduce((s: number, it: any) => s + Number(it.purchasePrice) * Number(it.quantity), 0)

  // Transaction: create purchase, items, and update product quantities
  try {
    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({ data: { supplierId: supplierIdNum || undefined, invoiceNumber, purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(), totalAmount } })
      for (const it of items) {
        const qty = Number(it.quantity) || 0
        const price = Number(it.purchasePrice) || 0

        // Validate product exists before creating item and updating stock
        const prod = await tx.product.findUnique({ where: { articleNumber: it.productArtNo } })
        if (!prod) {
          throw new Error(`Product not found: ${it.productArtNo}`)
        }

        await tx.purchaseItem.create({ data: { purchaseId: p.id, productArtNo: it.productArtNo, quantity: qty, purchasePrice: price, total: price * qty } })
        await tx.product.update({ where: { articleNumber: it.productArtNo }, data: { quantity: { increment: qty } } })
      }
      return p
    })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
