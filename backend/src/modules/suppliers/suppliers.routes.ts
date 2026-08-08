import { Router } from 'express';
import { SupplierRegistry } from './supplier.registry.js';
import { authMiddleware } from '../../shared/middleware.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/', async (req: any, res) => {
  const dbSuppliers = await prisma.supplier.findMany();
  const adapters = SupplierRegistry.getAll();
  
  res.json({
    registeredAdapters: adapters.map(a => ({ name: a.name, type: a.type })),
    dbSuppliers
  });
});

router.post('/', async (req: any, res) => {
  const { name, config } = req.body;
  const supplier = await prisma.supplier.create({
    data: {
      name,
      type: 'MANUAL',
      config: config ? JSON.stringify(config) : null,
      isActive: true
    }
  });
  res.json(supplier);
});

router.put('/:id', async (req: any, res) => {
  const { name, config, isActive } = req.body;
  const supplier = await prisma.supplier.update({
    where: { id: req.params.id },
    data: {
      name,
      config: config ? JSON.stringify(config) : null,
      isActive
    }
  });
  res.json(supplier);
});

router.delete('/:id', async (req: any, res) => {
  await prisma.supplier.delete({
    where: { id: req.params.id }
  });
  res.json({ success: true });
});

export default router;
