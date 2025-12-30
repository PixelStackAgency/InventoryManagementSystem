import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000
    })
    return NextResponse.json(products, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const auth = await authorize('MANAGE_PRODUCTS')
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const {
      articleNumber,
      name,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      discountValue = 0,
      discountType = 'AMOUNT',
      taxEnabled = false,
      taxPercent = 0,
      quantity = 0,
      minStock = 0,
      unit = 'pcs',
      shelfNumber = null
    } = body

    // Validate required fields
    if (!articleNumber || typeof articleNumber !== 'string' || articleNumber.trim().length === 0) {
      return NextResponse.json(
        { error: 'Article number is required' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const parsedPurchasePrice = parseFloat(purchasePrice)
    const parsedSellingPrice = parseFloat(sellingPrice)

    if (isNaN(parsedPurchasePrice) || parsedPurchasePrice < 0) {
      return NextResponse.json(
        { error: 'Purchase price must be a valid positive number' },
        { status: 400 }
      )
    }

    if (isNaN(parsedSellingPrice) || parsedSellingPrice < 0) {
      return NextResponse.json(
        { error: 'Selling price must be a valid positive number' },
        { status: 400 }
      )
    }

    const parsedQuantity = parseInt(quantity, 10)
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a valid non-negative number' },
        { status: 400 }
      )
    }

    const parsedMinStock = parseInt(minStock, 10)
    if (isNaN(parsedMinStock) || parsedMinStock < 0) {
      return NextResponse.json(
        { error: 'Minimum stock must be a valid non-negative number' },
        { status: 400 }
      )
    }

    // Check for duplicate article number
    const existingProduct = await prisma.product.findUnique({
      where: { articleNumber: articleNumber.trim() }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this article number already exists' },
        { status: 409 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        articleNumber: articleNumber.trim(),
        name: name.trim(),
        category: category ? category.trim() : null,
        brand: brand ? brand.trim() : null,
        purchasePrice: parsedPurchasePrice,
        sellingPrice: parsedSellingPrice,
        discountValue: Math.max(0, parseFloat(discountValue) || 0),
        discountType: ['AMOUNT', 'PERCENT'].includes(discountType) ? discountType : 'AMOUNT',
        taxEnabled: Boolean(taxEnabled),
        taxPercent: Math.max(0, parseFloat(taxPercent) || 0),
        quantity: parsedQuantity,
        minStock: parsedMinStock,
        unit: unit ? unit.trim() : 'pcs',
        shelfNumber: shelfNumber ? shelfNumber.trim() : null
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/products error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Article number must be unique' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
