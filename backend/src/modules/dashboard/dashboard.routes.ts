import { Router } from 'express';
import { DashboardService } from './dashboard.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const dashboardService = new DashboardService();

router.use(authMiddleware);

router.get('/stats', async (req: any, res) => {
  const stats = await dashboardService.getStats(req.userId);
  res.json(stats);
});

router.get('/recent-orders', async (req: any, res) => {
  const orders = await dashboardService.getRecentOrders(req.userId);
  res.json(orders);
});

router.get('/revenue-chart', async (req: any, res) => {
  const chart = await dashboardService.getRevenueChart(req.userId);
  res.json(chart);
});

export default router;
