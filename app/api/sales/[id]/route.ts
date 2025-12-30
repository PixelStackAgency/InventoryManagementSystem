import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: Request, { params }: any) {
  const { id } = await params
  const s = await prisma.sale.findUnique({ where: { id: Number(id) }, include: { items: true, customer: true } })
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(s)
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = await params
  const auth = await authorize('MANAGE_SALES')
  if (auth instanceof NextResponse) return auth
  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.saleItem.findMany({ where: { saleId: Number(id) } })
      for (const it of items) {
        await tx.product.update({ where: { articleNumber: it.productArtNo }, data: { quantity: { increment: it.quantity } } })
      }
      await tx.saleItem.deleteMany({ where: { saleId: Number(id) } })
      await tx.sale.delete({ where: { id: Number(id) } })
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
