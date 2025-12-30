-- AlterTable
ALTER TABLE "Product" ADD COLUMN "shelfNumber" TEXT;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "businessName" TEXT NOT NULL DEFAULT 'InventoryPro',
    "businessType" TEXT NOT NULL DEFAULT 'RETAILER',
    "enableShelfLocation" BOOLEAN NOT NULL DEFAULT false,
    "enableWarehouseMode" BOOLEAN NOT NULL DEFAULT false,
    "currencySymbol" TEXT NOT NULL DEFAULT '₹',
    "enableBulkImport" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
