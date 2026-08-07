import { PrismaClient } from '@prisma/client';
import { AliExpressClient } from '../aliexpress/aliexpress.client.js';

const prisma = new PrismaClient();

export class TrackingService {
  async syncTracking() {
    const orders = await prisma.order.findMany({
      where: { status: 'AWAITING_TRACKING', aliexpressOrderId: { not: null } },
      include: { user: { include: { credentials: { where: { platform: 'ALIEXPRESS' } } } } }
    });

    for (const order of orders) {
      try {
        const cred = order.user.credentials[0];
        if (!cred) continue;

        const client = new AliExpressClient(cred.appKey!, cred.appSecret!);
        const trackingInfo = await client.getTrackingInfo(order.aliexpressOrderId!);

        if (trackingInfo && trackingInfo.tracking_number) {
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              status: 'TRACKING_SYNCED', 
              trackingCode: trackingInfo.tracking_number,
              trackingUrl: trackingInfo.tracking_url 
            }
          });

          await prisma.syncLog.create({
            data: {
              type: 'TRACKING_SYNC',
              entityId: order.id,
              platform: order.platform,
              message: `Tracking synced: ${trackingInfo.tracking_number}`,
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
