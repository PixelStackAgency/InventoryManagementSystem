import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: Request, { params }: any) {
  const { id } = await params
  const p = await prisma.purchase.findUnique({ where: { id: Number(id) }, include: { items: true, supplier: true } })
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = await params
  const auth = await authorize('MANAGE_PURCHASES')
  if (auth instanceof NextResponse) return auth
  try {
    // When deleting a purchase, subtract quantities
    await prisma.$transaction(async (tx) => {
      const items = await tx.purchaseItem.findMany({ where: { purchaseId: Number(id) } })
      for (const it of items) {
        await tx.product.update({ where: { articleNumber: it.productArtNo }, data: { quantity: { decrement: it.quantity } } })
      }
      await tx.purchaseItem.deleteMany({ where: { purchaseId: Number(id) } })
      await tx.purchase.delete({ where: { id: Number(id) } })
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
