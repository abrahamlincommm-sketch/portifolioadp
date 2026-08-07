import { Router } from 'express';
import { OrdersService } from './orders.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const ordersService = new OrdersService();

router.use(authMiddleware);

router.get('/', async (req: any, res) => {
  const orders = await ordersService.listOrders(req.userId);
  res.json(orders);
});

router.get('/stats', async (req: any, res) => {
  const stats = await ordersService.getStats(req.userId);
  res.json(stats);
});

router.get('/:id', async (req: any, res) => {
  const order = await ordersService.getOrder(req.userId, req.params.id);
  res.json(order);
});

router.post('/:id/fulfill', async (req: any, res) => {
  const result = await ordersService.fulfillOrder(req.userId, req.params.id);
  res.json(result);
});

export default router;
