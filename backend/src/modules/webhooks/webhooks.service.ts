import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WebhooksService {
  async processMLWebhook(payload: any) {
    if (payload.topic !== 'orders_v2') return;
    
    console.log('Processing ML webhook order:', payload.resource);
    // Find user, process order, create DB record...
  }

  async processShopeeWebhook(payload: any) {
    console.log('Processing Shopee webhook:', payload);
    // Process order, create DB record...
  }
}
