import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: Request, { params }: any) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({ where: { id: Number(id) } })
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(customer)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_CUSTOMERS')
    if (auth instanceof NextResponse) return auth
    const body = await req.json()
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: body
    })
    return NextResponse.json(customer)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_CUSTOMERS')
    if (auth instanceof NextResponse) return auth
    await prisma.customer.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
