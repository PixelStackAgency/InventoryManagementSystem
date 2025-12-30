import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

// GET: Get system settings
export async function GET(req: NextRequest) {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 1 }
    })

    // Create default if not exists
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 1,
          businessName: 'InventoryPro',
          businessType: 'RETAILER',
          enableShelfLocation: false,
          enableWarehouseMode: false,
          currencySymbol: '₹',
          enableBulkImport: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT: Update system settings
export async function PUT(req: NextRequest) {
  const authResult = await authorize('MANAGE_SETTINGS')
  if (authResult instanceof NextResponse) return authResult

  try {
    const { businessName, businessType, enableShelfLocation, enableWarehouseMode, currencySymbol, enableBulkImport } = await req.json()

    const settings = await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        ...(businessName && { businessName }),
        ...(businessType && { businessType }),
        ...(enableShelfLocation !== undefined && { enableShelfLocation }),
        ...(enableWarehouseMode !== undefined && { enableWarehouseMode }),
        ...(currencySymbol && { currencySymbol }),
        ...(enableBulkImport !== undefined && { enableBulkImport })
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
