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
          // Registrar erro no banco (visível no painel)
          await prisma.syncLog.create({
            data: {
              type: 'TRACKING_SYNC',
              entityId: order.id,
              platform: order.platform,
              message: `Adaptador não encontrado para o fornecedor: ${supplierName}`,
              status: 'ERROR',
            }
          });
          continue;
        }

        // Para fornecedores manuais, pular sincronização de rastreio
        if (adapter.type === 'MANUAL') continue;

        // Buscar credenciais do fornecedor
        const cred = order.user.credentials.find(c => c.platform === supplierName);
        if (!cred) {
          await prisma.syncLog.create({
            data: {
              type: 'TRACKING_SYNC',
              entityId: order.id,
              platform: order.platform,
              message: `Credenciais do fornecedor ${supplierName} não encontradas para sincronizar rastreio`,
              status: 'ERROR',
            }
          });
          continue;
        }

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
              message: `Rastreio sincronizado: ${trackingResult.trackingCode}`,
              status: 'SUCCESS'
            }
          });
        }
      } catch (error: any) {
        console.error(`Falha ao sincronizar rastreio do pedido ${order.id}:`, error.message);

        // Registrar erro no banco para que apareça no painel do usuário
        await prisma.syncLog.create({
          data: {
            type: 'TRACKING_SYNC',
            entityId: order.id,
            platform: order.platform,
            message: `Erro ao sincronizar rastreio: ${error.message}`,
            status: 'ERROR',
          }
        });
      }
    }
  }
}
