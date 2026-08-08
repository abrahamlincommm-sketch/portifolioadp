import { PrismaClient } from '@prisma/client';
import { SupplierRegistry } from '../suppliers/supplier.registry.js';

const prisma = new PrismaClient();

export class OrdersService {
  async listOrders(userId: string) {
    return prisma.order.findMany({ where: { userId } });
  }

  async getOrder(userId: string, id: string) {
    return prisma.order.findFirst({ where: { id, userId }, include: { product: true } });
  }

  async getStats(userId: string) {
    const total = await prisma.order.count({ where: { userId } });
    const pending = await prisma.order.count({ where: { userId, status: 'PENDING' } });
    return { total, pending };
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
