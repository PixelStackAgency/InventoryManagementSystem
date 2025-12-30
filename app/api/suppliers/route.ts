import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(suppliers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await authorize('MANAGE_SUPPLIERS')
  if (auth instanceof NextResponse) return auth
  try {
    const body = await req.json()
    const { name, contact } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const supplier = await prisma.supplier.create({
      data: { name, contact: contact || null }
    })
    return NextResponse.json(supplier)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
