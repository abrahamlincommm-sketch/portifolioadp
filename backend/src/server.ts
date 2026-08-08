import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import { errorHandler } from './shared/middleware.js';
import { setupScheduler } from './jobs/scheduler.js';

import authRoutes from './modules/auth/auth.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import webhooksRoutes from './modules/webhooks/webhooks.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = express();

// CORS: permitir frontend local e produção (Netlify)
app.use(cors({
  origin: [
    env.FRONTEND_URL,
    'https://allydigitalpartners.com',
    'https://www.allydigitalpartners.com',
  ].filter(Boolean),
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

// Health check para o Render
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = Number(env.PORT || 3000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  setupScheduler();
});
