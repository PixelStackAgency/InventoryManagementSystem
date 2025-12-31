import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/suppliers
 * Fetch all suppliers
 */
export async function GET(req: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      take: 1000
    })
    return NextResponse.json(suppliers, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/suppliers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/suppliers
 * Create a new supplier
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authorize('MANAGE_SUPPLIERS')
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

    const { name, contact } = body

    // Validate required field
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      )
    }

    // Validate optional field
    if (contact && typeof contact !== 'string') {
      return NextResponse.json(
        { error: 'Contact must be a string' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contact: contact ? contact.trim() : null
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/suppliers error:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
