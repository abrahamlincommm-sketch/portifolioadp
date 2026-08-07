import { Router } from 'express';
import { WebhooksService } from './webhooks.service.js';
import crypto from 'crypto';

const router = Router();
const webhooksService = new WebhooksService();

router.post('/mercadolivre', async (req, res) => {
  // Validate x-signature here...
  
  await webhooksService.processMLWebhook(req.body);
  res.status(200).send('OK');
});

router.post('/shopee', async (req, res) => {
  // Validate HMAC-SHA256 in Authorization header here...

  await webhooksService.processShopeeWebhook(req.body);
  res.status(200).send('OK');
});

export default router;
