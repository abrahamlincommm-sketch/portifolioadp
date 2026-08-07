import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const authService = new AuthService();

router.post('/register', async (req, res) => {
  const result = await authService.register(req.body);
  res.json(result);
});

router.post('/login', async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

router.get('/me', authMiddleware, async (req: any, res) => {
  const user = await authService.getMe(req.userId);
  res.json(user);
});

router.get('/mercadolivre/connect', (req, res) => {
  res.redirect(authService.getMLAuthUrl());
});

router.get('/mercadolivre/callback', async (req, res) => {
  await authService.handleMLCallback(req.query.code as string, req.query.state as string);
  res.json({ success: true });
});

router.get('/shopee/connect', (req, res) => {
  res.redirect(authService.getShopeeAuthUrl());
});

router.get('/shopee/callback', async (req, res) => {
  await authService.handleShopeeCallback(req.query.code as string, req.query.shop_id as string);
  res.json({ success: true });
});

router.post('/aliexpress/credentials', authMiddleware, async (req: any, res) => {
  const result = await authService.saveAliExpressCredentials(req.userId, req.body);
  res.json(result);
});

router.get('/credentials', authMiddleware, async (req: any, res) => {
  const result = await authService.getCredentials(req.userId);
  res.json(result);
});

router.delete('/credentials/:id', authMiddleware, async (req: any, res) => {
  await authService.deleteCredential(req.userId, req.params.id);
  res.json({ success: true });
});

export default router;
