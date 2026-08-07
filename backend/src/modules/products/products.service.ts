import { PrismaClient } from '@prisma/client';
import { AliExpressClient } from '../aliexpress/aliexpress.client.js';

const prisma = new PrismaClient();

export class ProductsService {
  async listProducts(userId: string) {
    return prisma.product.findMany({ where: { userId } });
  }

  async getProduct(userId: string, id: string) {
    return prisma.product.findFirst({ where: { id, userId } });
  }

  async importProduct(userId: string, aliexpressId: string) {
    // Mocking the client initialization and call for now
    const cred = await prisma.credential.findFirst({ where: { userId, platform: 'ALIEXPRESS' } });
    if (!cred) throw new Error('AliExpress credentials not found');

    const client = new AliExpressClient(cred.appKey!, cred.appSecret!);
    const aeProduct = await client.getProduct(aliexpressId);

    // Normally we'd map aeProduct to our schema here
    const product = await prisma.product.create({
      data: {
        userId,
        aliexpressProductId: aliexpressId,
        title: aeProduct.title || 'Imported Product',
        costPriceUsd: 10,
        costPriceBrl: 50,
        salePriceBrl: 100,
        stock: 100,
        status: 'DRAFT',
        images: '[]'
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
    // Publish logic here...
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', mlItemId: 'MLB123456789' }
    });
  }

  async publishToShopee(userId: string, id: string) {
    // Publish logic here...
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', shopeeItemId: 'SHOPEE123456' }
    });
  }

  async syncProduct(userId: string, id: string) {
    // Sync logic here...
    return { success: true };
  }

  async deleteProduct(userId: string, id: string) {
    // Soft delete or hard delete
    return prisma.product.delete({ where: { id } });
  }
}
