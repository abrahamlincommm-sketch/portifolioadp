import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from './auth.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const authService = new AuthService();

// Rate limiting: máximo 10 tentativas de login/registro a cada 15 minutos por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, async (req, res) => {
  const result = await authService.register(req.body);
  res.json(result);
});

router.post('/login', authLimiter, async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

router.get('/me', authMiddleware, async (req: any, res) => {
  const user = await authService.getMe(req.userId);
  res.json(user);
});

router.get('/mercadolivre/connect', authMiddleware, (req: any, res) => {
  res.redirect(authService.getMLAuthUrl(req.userId));
});

router.get('/mercadolivre/callback', async (req, res) => {
  try {
    await authService.handleMLCallback(req.query.code as string, req.query.state as string);
    // Redireciona para a tela de configurações com mensagem de sucesso
    res.redirect(process.env.FRONTEND_URL || 'https://allydigitalpartners.com' + '/settings?connected=mercadolivre');
  } catch (error: any) {
    res.redirect(process.env.FRONTEND_URL || 'https://allydigitalpartners.com' + '/settings?error=ml_connection_failed');
  }
});

router.get('/shopee/connect', authMiddleware, (req: any, res) => {
  res.redirect(authService.getShopeeAuthUrl(req.userId));
});

router.get('/shopee/callback', async (req, res) => {
  try {
    await authService.handleShopeeCallback(req.query.code as string, req.query.shop_id as string);
    res.redirect(process.env.FRONTEND_URL || 'https://allydigitalpartners.com' + '/settings?connected=shopee');
  } catch (error: any) {
    res.redirect(process.env.FRONTEND_URL || 'https://allydigitalpartners.com' + '/settings?error=shopee_connection_failed');
  }
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
