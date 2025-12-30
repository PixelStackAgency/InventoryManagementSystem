const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating supplier...')
    const supplier = await prisma.supplier.create({ data: { name: 'Test Supplier (Automated)', contact: 'test@example.com' } })
    console.log('Supplier created:', supplier)

    // Ensure a product exists
    let product = await prisma.product.findFirst()
    if (!product) {
      console.log('No product found, creating test product...')
      product = await prisma.product.create({ data: { articleNumber: 'TEST-001', name: 'Test Product', purchasePrice: 10.0, sellingPrice: 15.0 } })
      console.log('Product created:', product)
    } else {
      console.log('Using existing product:', product.articleNumber)
    }

    console.log('Creating purchase...')
    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({ data: { supplierId: supplier.id, invoiceNumber: `INV-${Date.now()}`, totalAmount: 10.0 } })
      await tx.purchaseItem.create({ data: { purchaseId: p.id, productArtNo: product.articleNumber, quantity: 1, purchasePrice: product.purchasePrice, total: product.purchasePrice } })
      await tx.product.update({ where: { articleNumber: product.articleNumber }, data: { quantity: { increment: 1 } } })
      return p
    })

    console.log('Purchase created:', purchase)
  } catch (e) {
    console.error('Error during test create:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
