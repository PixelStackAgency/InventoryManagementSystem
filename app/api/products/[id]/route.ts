import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { articleNumber: id.trim() }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check authorization
    const auth = await authorize('MANAGE_PRODUCTS')
    if (auth instanceof NextResponse) return auth

    const body = await req.json()

    // Validate and sanitize update data
    const updateData: any = {}

    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Product name must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    if ('category' in body) {
      updateData.category = body.category ? String(body.category).trim() : null
    }

    if ('brand' in body) {
      updateData.brand = body.brand ? String(body.brand).trim() : null
    }

    if ('purchasePrice' in body) {
      const price = parseFloat(body.purchasePrice)
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Purchase price must be a valid positive number' },
          { status: 400 }
        )
      }
      updateData.purchasePrice = price
    }

    if ('sellingPrice' in body) {
      const price = parseFloat(body.sellingPrice)
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Selling price must be a valid positive number' },
          { status: 400 }
        )
      }
      updateData.sellingPrice = price
    }

    if ('quantity' in body) {
      const qty = parseInt(body.quantity, 10)
      if (isNaN(qty) || qty < 0) {
        return NextResponse.json(
          { error: 'Quantity must be a valid non-negative number' },
          { status: 400 }
        )
      }
      updateData.quantity = qty
    }

    if ('minStock' in body) {
      const min = parseInt(body.minStock, 10)
      if (isNaN(min) || min < 0) {
        return NextResponse.json(
          { error: 'Minimum stock must be a valid non-negative number' },
          { status: 400 }
        )
      }
      updateData.minStock = min
    }

    if ('unit' in body) {
      updateData.unit = body.unit ? String(body.unit).trim() : 'pcs'
    }

    if ('shelfNumber' in body) {
      updateData.shelfNumber = body.shelfNumber ? String(body.shelfNumber).trim() : null
    }

    if ('discountValue' in body) {
      updateData.discountValue = Math.max(0, parseFloat(body.discountValue) || 0)
    }

    if ('discountType' in body) {
      if (['AMOUNT', 'PERCENT'].includes(body.discountType)) {
        updateData.discountType = body.discountType
      }
    }

    if ('taxEnabled' in body) {
      updateData.taxEnabled = Boolean(body.taxEnabled)
    }

    if ('taxPercent' in body) {
      updateData.taxPercent = Math.max(0, parseFloat(body.taxPercent) || 0)
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { articleNumber: id.trim() }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { articleNumber: id.trim() },
      data: updateData
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check authorization
    const auth = await authorize('MANAGE_PRODUCTS')
    if (auth instanceof NextResponse) return auth

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { articleNumber: id.trim() }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product is being used in any purchase or sale
    const purchaseItems = await prisma.purchaseItem.findFirst({
      where: { productArtNo: id.trim() }
    })

    const saleItems = await prisma.saleItem.findFirst({
      where: { productArtNo: id.trim() }
    })

    if (purchaseItems || saleItems) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been used in purchases or sales' },
        { status: 409 }
      )
    }

    // Delete product
    await prisma.product.delete({
      where: { articleNumber: id.trim() }
    })

    return NextResponse.json({ ok: true, message: 'Product deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
