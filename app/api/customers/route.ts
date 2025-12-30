import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await authorize('MANAGE_CUSTOMERS')
  if (auth instanceof NextResponse) return auth
  try {
    const body = await req.json()
    const { name, phone, address } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, address: address || null }
    })
    return NextResponse.json(customer)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
