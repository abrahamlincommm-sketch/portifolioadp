import cron from 'node-cron';
import { TrackingService } from '../modules/tracking/tracking.service.js';

export function setupScheduler() {
  const trackingService = new TrackingService();

  // Product sync (every 1 hour)
  cron.schedule('0 * * * *', () => {
    console.log('Running product sync job...');
    // TODO: Call product sync service
  });

  // Tracking sync (every 30 minutes)
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running tracking sync job...');
    await trackingService.syncTracking();
  });

  // Token refresh (every 4 hours)
  cron.schedule('0 */4 * * *', () => {
    console.log('Running token refresh job...');
    // TODO: Call auth service token refresh logic
  });
}
