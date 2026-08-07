import { PrismaClient } from '@prisma/client';
import { AliExpressClient } from '../aliexpress/aliexpress.client.js';

const prisma = new PrismaClient();

export class OrdersService {
  async listOrders(userId: string) {
    return prisma.order.findMany({ where: { userId } });
  }

  async getOrder(userId: string, id: string) {
    return prisma.order.findFirst({ where: { id, userId } });
  }

  async getStats(userId: string) {
    const total = await prisma.order.count({ where: { userId } });
    const pending = await prisma.order.count({ where: { userId, status: 'PENDING' } });
    return { total, pending };
  }

  async fulfillOrder(userId: string, id: string) {
    const order = await prisma.order.findFirst({ where: { id, userId }, include: { product: true } });
    if (!order) throw new Error('Order not found');

    const cred = await prisma.credential.findFirst({ where: { userId, platform: 'ALIEXPRESS' } });
    if (!cred) throw new Error('AliExpress credentials not found');

    const client = new AliExpressClient(cred.appKey!, cred.appSecret!);
    // Mock call to create order
    // const aeOrder = await client.createOrder({...});

    return prisma.order.update({
      where: { id },
      data: { status: 'PLACED_ON_AE', aliexpressOrderId: 'AE123456789' }
    });
  }
}
