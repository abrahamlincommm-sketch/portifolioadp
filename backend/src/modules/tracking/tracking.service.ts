import { PrismaClient } from '@prisma/client';
import { SupplierRegistry } from '../suppliers/supplier.registry.js';

const prisma = new PrismaClient();

export class TrackingService {
  async syncTracking() {
    const orders = await prisma.order.findMany({
      where: { status: 'AWAITING_TRACKING', supplierOrderId: { not: null } },
      include: {
        product: true,
        user: { include: { credentials: true } }
      }
    });

    for (const order of orders) {
      try {
        const supplierName = order.supplierName || 'ALIEXPRESS';
        const adapter = SupplierRegistry.get(supplierName);

        if (!adapter) {
          console.warn(`No adapter found for supplier: ${supplierName}`);
          continue;
        }

        // For manual suppliers, skip tracking sync
        if (adapter.type === 'MANUAL') continue;

        // Get credentials for this supplier
        const cred = order.user.credentials.find(c => c.platform === supplierName);
        if (!cred) continue;

        const trackingResult = await adapter.getTracking(
          order.supplierOrderId!,
          { appKey: cred.appKey, appSecret: cred.appSecret }
        );

        if (trackingResult && trackingResult.trackingCode) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'TRACKING_SYNCED',
              trackingCode: trackingResult.trackingCode,
              trackingUrl: trackingResult.trackingUrl
            }
          });

          await prisma.syncLog.create({
            data: {
              type: 'TRACKING_SYNC',
              entityId: order.id,
              platform: order.platform,
              message: `Tracking synced: ${trackingResult.trackingCode}`,
              status: 'SUCCESS'
            }
          });
        }
      } catch (error: any) {
        console.error(`Failed to sync tracking for order ${order.id}:`, error.message);
      }
    }
  }
}
