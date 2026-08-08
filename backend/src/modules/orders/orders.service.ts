import { PrismaClient } from '@prisma/client';
import { SupplierRegistry } from '../suppliers/supplier.registry.js';

const prisma = new PrismaClient();

export class OrdersService {
  async listOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrder(userId: string, id: string) {
    return prisma.order.findFirst({ where: { id, userId }, include: { product: true } });
  }

  async getStats(userId: string) {
    const total = await prisma.order.count({ where: { userId } });
    const pending = await prisma.order.count({ where: { userId, status: 'PENDING' } });
    const processing = await prisma.order.count({
      where: { userId, status: { in: ['FULFILLMENT_PENDING', 'PLACED_ON_AE', 'AWAITING_TRACKING'] } }
    });
    const completed = await prisma.order.count({
      where: { userId, status: { in: ['TRACKING_SYNCED', 'DELIVERED'] } }
    });
    return { total, pending, processing, completed };
  }

  async fulfillOrder(userId: string, id: string) {
    const order = await prisma.order.findFirst({ where: { id, userId }, include: { product: true } });
    if (!order) throw new Error('Order not found');

    const supplierName = order.product.supplierName;
    const adapter = SupplierRegistry.get(supplierName);
    
    if (!adapter) {
      throw new Error(`Supplier adapter not found: ${supplierName}`);
    }

    const cred = await prisma.credential.findFirst({ where: { userId, platform: supplierName.toUpperCase() } });
    
    const result = await adapter.createOrder({
      supplierProductId: order.product.supplierProductId,
      quantity: order.quantity,
      buyerName: order.buyerName,
      buyerAddress: order.buyerAddress,
    }, cred || {});

    return prisma.order.update({
      where: { id },
      data: { 
        status: result.status, 
        supplierOrderId: result.supplierOrderId,
        supplierName: supplierName.toUpperCase()
      }
    });
  }
}
