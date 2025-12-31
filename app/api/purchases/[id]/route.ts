import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/purchases/[id]
 * Fetch a specific purchase
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      )
    }

    const purchaseId = Number(id)
    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: 'Purchase ID must be a valid number' },
        { status: 400 }
      )
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true, supplier: true }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(purchase, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/purchases/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/purchases/[id]
 * Delete a purchase and reverse inventory
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_PURCHASES')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      )
    }

    const purchaseId = Number(id)
    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: 'Purchase ID must be a valid number' },
        { status: 400 }
      )
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Check if purchase exists
        const purchase = await tx.purchase.findUnique({
          where: { id: purchaseId },
          include: { items: true }
        })

        if (!purchase) {
          throw new Error('Purchase not found')
        }

        // Decrement product quantities
        for (const item of purchase.items) {
          await tx.product.update({
            where: { articleNumber: item.productArtNo },
            data: { quantity: { decrement: item.quantity } }
          })
        }

        // Delete items
        await tx.purchaseItem.deleteMany({
          where: { purchaseId }
        })

        // Delete purchase
        await tx.purchase.delete({
          where: { id: purchaseId }
        })
      })

      return NextResponse.json(
        { ok: true, message: 'Purchase deleted successfully' },
        { status: 200 }
      )
    } catch (txError: any) {
      console.error('Transaction error:', txError)
      return NextResponse.json(
        { error: txError.message || 'Failed to delete purchase' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('DELETE /api/purchases/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    )
  }
}
