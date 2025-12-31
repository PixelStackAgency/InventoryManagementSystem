import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: NextRequest) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const sales = await prisma.sale.findMany({
      include: {
        items: true,
        customer: true
      },
      orderBy: { saleDate: 'desc' },
      take: 1000
    })
    return NextResponse.json(sales, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/sales error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const auth = await authorize('MANAGE_SALES')
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const {
      customerId,
      paymentMode = 'CASH',
      items,
      discount = 0,
      notes = ''
    } = body

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
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

      const sellingPrice = parseFloat(item.sellingPrice)
      if (isNaN(sellingPrice) || sellingPrice < 0) {
        return NextResponse.json(
          { error: 'Item selling price must be a valid non-negative number' },
          { status: 400 }
        )
      }
    }

    // Check customer exists if provided
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId, 10) }
      })
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
    }

    // Verify stock availability and fetch products
    const products = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { articleNumber: item.productArtNo }
        })
        return { product, requestedQuantity: parseInt(item.quantity, 10) }
      })
    )

    // Check stock for each product
    for (const { product, requestedQuantity } of products) {
      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 404 }
        )
      }
      if (product.quantity < requestedQuantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.articleNumber}. Available: ${product.quantity}` },
          { status: 409 }
        )
      }
    }

    // Validate payment mode
    const validPaymentModes = ['CASH', 'CARD', 'CHEQUE', 'ONLINE']
    if (!validPaymentModes.includes(paymentMode)) {
      return NextResponse.json(
        { error: `Invalid payment mode. Must be one of: ${validPaymentModes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate discount
    const parsedDiscount = parseFloat(discount)
    if (isNaN(parsedDiscount) || parsedDiscount < 0) {
      return NextResponse.json(
        { error: 'Discount must be a non-negative number' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + parseFloat(item.sellingPrice) * parseInt(item.quantity, 10),
      0
    )
    const totalAmount = Math.max(0, subtotal - parsedDiscount)

    try {
      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Generate invoice number
        const invoiceNumber = `S-${Date.now()}`

        // Create sale
        const sale = await tx.sale.create({
          data: {
            invoiceNumber,
            customerId: customerId ? parseInt(customerId, 10) : undefined,
            paymentMode,
            subtotal,
            discount: parsedDiscount,
            totalAmount
          }
        })

        // Create sale items and update inventory
        for (const item of items) {
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productArtNo: item.productArtNo,
              quantity: parseInt(item.quantity, 10),
              sellingPrice: parseFloat(item.sellingPrice),
              total: parseFloat(item.sellingPrice) * parseInt(item.quantity, 10)
            }
          })

          // Reduce product quantity
          await tx.product.update({
            where: { articleNumber: item.productArtNo },
            data: {
              quantity: { decrement: parseInt(item.quantity, 10) }
            }
          })
        }

        return { sale, invoiceNumber }
      })

      return NextResponse.json(result, { status: 201 })
    } catch (txError: any) {
      console.error('Transaction error:', txError)
      return NextResponse.json(
        { error: 'Failed to create sale transaction' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('POST /api/sales error:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}
