import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/customers
 * Fetch all customers
 */
export async function GET(req: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      take: 1000
    })
    return NextResponse.json(customers, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authorize('MANAGE_CUSTOMERS')
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

    const { name, phone, address } = body

    // Validate required field
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      )
    }

    // Validate optional fields
    if (phone && typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone must be a string' },
        { status: 400 }
      )
    }

    if (address && typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address must be a string' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/customers error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
