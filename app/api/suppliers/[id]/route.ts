import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(req: Request, { params }: any) {
  try {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({ where: { id: Number(id) } })
    if (!supplier) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(supplier)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_SUPPLIERS')
    if (auth instanceof NextResponse) return auth
    const body = await req.json()
    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: body
    })
    return NextResponse.json(supplier)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = await params
    const auth = await authorize('MANAGE_SUPPLIERS')
    if (auth instanceof NextResponse) return auth
    await prisma.supplier.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
