import { PrismaClient } from '@prisma/client';
import { SupplierRegistry } from '../suppliers/supplier.registry.js';

const prisma = new PrismaClient();

export class ProductsService {
  async listProducts(userId: string) {
    return prisma.product.findMany({ where: { userId } });
  }

  async getProduct(userId: string, id: string) {
    return prisma.product.findFirst({ where: { id, userId }, include: { supplier: true } });
  }

  async importProduct(userId: string, supplierName: string, productIdOrUrl: string) {
    const adapter = SupplierRegistry.get(supplierName);
    if (!adapter) throw new Error(`Supplier adapter not found: ${supplierName}`);

    if (adapter.type === 'MANUAL') {
      throw new Error('Cannot import product from a MANUAL supplier using import route. Use manual creation instead.');
    }

    const cred = await prisma.credential.findFirst({ where: { userId, platform: supplierName.toUpperCase() } });
    
    const productData = await adapter.importProduct(productIdOrUrl, cred || {});
    if (!productData) {
      throw new Error('Failed to import product data');
    }

    let supplier = await prisma.supplier.findUnique({ where: { name: supplierName.toUpperCase() } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: { name: supplierName.toUpperCase(), type: adapter.type } });
    }

    const product = await prisma.product.create({
      data: {
        userId,
        supplierProductId: productData.supplierProductId,
        supplierUrl: productData.supplierUrl,
        supplierName: supplierName.toUpperCase(),
        supplierId: supplier.id,
        title: productData.title,
        description: productData.description,
        costPriceUsd: productData.costPriceUsd,
        costPriceBrl: productData.costPriceUsd * 5,
        salePriceBrl: productData.costPriceUsd * 5 * 2,
        stock: productData.stock,
        status: 'DRAFT',
        images: JSON.stringify(productData.images)
      }
    });

    return product;
  }

  async createManualProduct(userId: string, supplierName: string = 'MANUAL', productData: any) {
    const sName = (supplierName || 'MANUAL').toUpperCase();
    let supplier = await prisma.supplier.findUnique({ where: { name: sName } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: { name: sName, type: 'MANUAL' } });
    }

    const product = await prisma.product.create({
      data: {
        userId,
        supplierProductId: productData.supplierProductId || `MANUAL-${Date.now()}`,
        supplierUrl: productData.supplierUrl,
        supplierName: supplierName.toUpperCase(),
        supplierId: supplier.id,
        title: productData.title,
        description: productData.description,
        costPriceUsd: productData.costPriceUsd || 0,
        costPriceBrl: productData.costPriceBrl || 0,
        salePriceBrl: productData.salePriceBrl || 0,
        stock: productData.stock || 0,
        status: 'DRAFT',
        images: JSON.stringify(productData.images || [])
      }
    });

    return product;
  }

  async updateProduct(userId: string, id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  async publishToML(userId: string, id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', mlItemId: 'MLB123456789' }
    });
  }

  async publishToShopee(userId: string, id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', shopeeItemId: 'SHOPEE123456' }
    });
  }

  async syncProduct(userId: string, id: string) {
    return { success: true };
  }

  async deleteProduct(userId: string, id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
