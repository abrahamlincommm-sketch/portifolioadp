import { Router } from 'express';
import { ProductsService } from './products.service.js';
import { authMiddleware } from '../../shared/middleware.js';

const router = Router();
const productsService = new ProductsService();

router.use(authMiddleware);

router.get('/', async (req: any, res) => {
  const products = await productsService.listProducts(req.userId);
  res.json(products);
});

router.get('/:id', async (req: any, res) => {
  const product = await productsService.getProduct(req.userId, req.params.id);
  res.json(product);
});

router.post('/import', async (req: any, res) => {
  const { supplierName, productId } = req.body;
  const product = await productsService.importProduct(req.userId, supplierName, productId);
  res.json(product);
});

router.post('/manual', async (req: any, res) => {
  const { supplierName, ...productData } = req.body;
  const product = await productsService.createManualProduct(req.userId, supplierName, productData);
  res.json(product);
});

router.put('/:id', async (req: any, res) => {
  const product = await productsService.updateProduct(req.userId, req.params.id, req.body);
  res.json(product);
});

router.post('/:id/publish/mercadolivre', async (req: any, res) => {
  const result = await productsService.publishToML(req.userId, req.params.id);
  res.json(result);
});

router.post('/:id/publish/shopee', async (req: any, res) => {
  const result = await productsService.publishToShopee(req.userId, req.params.id);
  res.json(result);
});

router.post('/:id/sync', async (req: any, res) => {
  const result = await productsService.syncProduct(req.userId, req.params.id);
  res.json(result);
});

router.delete('/:id', async (req: any, res) => {
  await productsService.deleteProduct(req.userId, req.params.id);
  res.json({ success: true });
});

export default router;
