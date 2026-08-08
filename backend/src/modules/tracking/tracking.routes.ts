import { Router } from 'express';
import { TrackingService } from './tracking.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const trackingService = new TrackingService();

router.use(authMiddleware);

router.post('/sync', async (_req, res) => {
  await trackingService.syncTracking();
  res.json({ success: true, message: 'Sincronização de rastreio concluída com sucesso' });
});

export default router;
