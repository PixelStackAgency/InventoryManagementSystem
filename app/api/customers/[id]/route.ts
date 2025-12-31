import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

/**
 * GET /api/customers/[id]
 * Fetch a specific customer
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize()
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    const customerId = Number(id)
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'Customer ID must be a valid number' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/customers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/customers/[id]
 * Update a customer
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_CUSTOMERS')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    const customerId = Number(id)
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'Customer ID must be a valid number' },
        { status: 400 }
      )
    }

    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate update data
    const updateData: any = {}

    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Customer name must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.name = body.name.trim()
    }

    if ('phone' in body) {
      updateData.phone = body.phone ? String(body.phone).trim() : null
    }

    if ('address' in body) {
      updateData.address = body.address ? String(body.address).trim() : null
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: updateData
    })

    return NextResponse.json(customer, { status: 200 })
  } catch (error: any) {
    console.error('PUT /api/customers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_CUSTOMERS')
    if (auth instanceof NextResponse) return auth

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    const customerId = Number(id)
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'Customer ID must be a valid number' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: customerId }
    })

    return NextResponse.json(
      { ok: true, message: 'Customer deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('DELETE /api/customers/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
