import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/sales/[id]
 * Fetch a specific sale
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid sale ID' },
        { status: 400 }
      )
    }

    const saleId = Number(id)
    if (isNaN(saleId)) {
      return NextResponse.json(
        { error: 'Sale ID must be a valid number' },
        { status: 400 }
      )
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true, customer: true }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sale, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/sales/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sale' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sales/[id]
 * Delete a sale and reverse inventory
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_SALES')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid sale ID' },
        { status: 400 }
      )
    }

    const saleId = Number(id)
    if (isNaN(saleId)) {
      return NextResponse.json(
        { error: 'Sale ID must be a valid number' },
        { status: 400 }
      )
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Check if sale exists
        const sale = await tx.sale.findUnique({
          where: { id: saleId },
          include: { items: true }
        })

        if (!sale) {
          throw new Error('Sale not found')
        }

        // Increment product quantities (reverse the sale)
        for (const item of sale.items) {
          await tx.product.update({
            where: { articleNumber: item.productArtNo },
            data: { quantity: { increment: item.quantity } }
          })
        }

        // Delete items
        await tx.saleItem.deleteMany({
          where: { saleId }
        })

        // Delete sale
        await tx.sale.delete({
          where: { id: saleId }
        })
      })

      return NextResponse.json(
        { ok: true, message: 'Sale deleted successfully' },
        { status: 200 }
      )
    } catch (txError: any) {
      console.error('Transaction error:', txError)
      return NextResponse.json(
        { error: txError.message || 'Failed to delete sale' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('DELETE /api/sales/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    )
  }
}
