-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- AlterTable Product
ALTER TABLE "Product" 
RENAME COLUMN "aliexpressProductId" TO "supplierProductId";

ALTER TABLE "Product" 
RENAME COLUMN "aliexpressUrl" TO "supplierUrl";

ALTER TABLE "Product" 
ADD COLUMN "supplierName" TEXT NOT NULL DEFAULT 'ALIEXPRESS',
ADD COLUMN "supplierId" TEXT;

-- AlterTable Order
ALTER TABLE "Order" 
RENAME COLUMN "aliexpressOrderId" TO "supplierOrderId";

ALTER TABLE "Order" 
ADD COLUMN "supplierName" TEXT NOT NULL DEFAULT 'ALIEXPRESS';

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default suppliers
INSERT INTO "Supplier" ("id", "name", "type", "updatedAt") VALUES (gen_random_uuid(), 'ALIEXPRESS', 'API', CURRENT_TIMESTAMP);
INSERT INTO "Supplier" ("id", "name", "type", "updatedAt") VALUES (gen_random_uuid(), 'FORNECEDOR_MANUAL', 'MANUAL', CURRENT_TIMESTAMP);
