import cron from 'node-cron';
import { TrackingService } from '../modules/tracking/tracking.service.js';
import { ProductsService } from '../modules/products/products.service.js';

export function setupScheduler() {
  const trackingService = new TrackingService();
  const productsService = new ProductsService();

  // Monitoramento e Repricing de Preços/Estoque (a cada 1 hora)
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Executando rotina de monitoramento de preços e estoque...');
    await productsService.syncAllActiveProducts();
  });

  // Sincronização de Rastreio (a cada 30 minutos)
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] Executando rotina de sincronização de rastreamento...');
    await trackingService.syncTracking();
  });

  // Renovação de Token (a cada 4 horas)
  cron.schedule('0 */4 * * *', () => {
    console.log('[Scheduler] Verificação de expiração de tokens...');
  });
}
