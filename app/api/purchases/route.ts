import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/purchases
 * Fetch all purchases with items and supplier details
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const purchases = await prisma.purchase.findMany({
      include: {
        items: true,
        supplier: true
      },
      orderBy: { purchaseDate: 'desc' },
      take: 1000
    })
    
    return NextResponse.json(purchases, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/purchases
 * Create a new purchase transaction
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authorize('MANAGE_PURCHASES')
    if (auth instanceof NextResponse) return auth

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { supplierId, invoiceNumber, purchaseDate, items } = body

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Validate invoice number
    if (!invoiceNumber || typeof invoiceNumber !== 'string' || invoiceNumber.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.productArtNo || typeof item.productArtNo !== 'string') {
        return NextResponse.json(
          { error: 'Each item must have a valid product article number' },
          { status: 400 }
        )
      }

      const quantity = parseInt(item.quantity, 10)
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Item quantity must be a positive number' },
          { status: 400 }
        )
      }

      const purchasePrice = parseFloat(item.purchasePrice)
      if (isNaN(purchasePrice) || purchasePrice < 0) {
        return NextResponse.json(
          { error: 'Item purchase price must be a valid non-negative number' },
          { status: 400 }
        )
      }
    }

    const supplierIdNum = supplierId ? Number(supplierId) : undefined

    // Validate supplier exists if provided
    if (supplierIdNum) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierIdNum }
      })
      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        )
      }
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, it: any) => sum + Number(it.purchasePrice) * Number(it.quantity),
      0
    )

    // Transaction: create purchase, items, and update product quantities
    try {
      const result = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: {
            supplierId: supplierIdNum || undefined,
            invoiceNumber: invoiceNumber.trim(),
            purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
            totalAmount
          }
        })

        for (const it of items) {
          const qty = Number(it.quantity) || 0
          const price = Number(it.purchasePrice) || 0

          // Validate product exists before creating item and updating stock
          const prod = await tx.product.findUnique({
            where: { articleNumber: it.productArtNo }
          })
          if (!prod) {
            throw new Error(`Product not found: ${it.productArtNo}`)
          }

          await tx.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              productArtNo: it.productArtNo,
              quantity: qty,
              purchasePrice: price,
              total: price * qty
            }
          })

          // Update product quantity
          await tx.product.update({
            where: { articleNumber: it.productArtNo },
            data: { quantity: { increment: qty } }
          })
        }

        return purchase
      })

      return NextResponse.json(result, { status: 201 })
    } catch (txError: any) {
      console.error('Transaction error:', txError)
      return NextResponse.json(
        { error: txError.message || 'Failed to create purchase' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('POST /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
}
