import { PrismaClient } from '@prisma/client';
import { SupplierRegistry } from '../suppliers/supplier.registry.js';
import { LinkScraper } from './link.scraper.js';

const prisma = new PrismaClient();

export class ProductsService {
  async listProducts(userId: string) {
    return prisma.product.findMany({ where: { userId } });
  }

  async getProduct(userId: string, id: string) {
    return prisma.product.findFirst({ where: { id, userId }, include: { supplier: true } });
  }

  async scrapeLink(url: string) {
    return LinkScraper.scrapeUrl(url);
  }

  async importProduct(userId: string, supplierName: string, productIdOrUrl: string) {
    const adapter = SupplierRegistry.get(supplierName);
    if (!adapter) throw new Error(`Supplier adapter not found: ${supplierName}`);

    if (adapter.type === 'MANUAL') {
      throw new Error('Cannot import product from a MANUAL supplier using import route. Use manual creation instead.');
    }

    const cred = await prisma.credential.findFirst({ where: { userId, platform: supplierName.toUpperCase() } });
    
    const productData = await adapter.importProduct(productIdOrUrl, cred || {});
    if (!productData) {
      throw new Error('Failed to import product data');
    }

    let supplier = await prisma.supplier.findUnique({ where: { name: supplierName.toUpperCase() } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: { name: supplierName.toUpperCase(), type: adapter.type } });
    }

    const margin = 50;
    const costUsd = productData.costPriceUsd || 10;
    const costBrl = costUsd * 5.6;
    const saleBrl = costBrl * (1 + margin / 100);

    const product = await prisma.product.create({
      data: {
        userId,
        supplierProductId: productData.supplierProductId,
        supplierUrl: productData.supplierUrl,
        supplierName: supplierName.toUpperCase(),
        supplierId: supplier.id,
        title: productData.title,
        description: productData.description,
        costPriceUsd: costUsd,
        costPriceBrl: costBrl,
        margin: margin,
        salePriceBrl: saleBrl,
        stock: productData.stock,
        status: 'DRAFT',
        images: JSON.stringify(productData.images || [])
      }
    });

    return product;
  }

  async createManualProduct(userId: string, supplierName: string = 'MANUAL', productData: any) {
    const sName = (supplierName || 'MANUAL').toUpperCase();
    let supplier = await prisma.supplier.findUnique({ where: { name: sName } });
    if (!supplier) {
      supplier = await prisma.supplier.create({ data: { name: sName, type: 'MANUAL' } });
    }

    const margin = productData.margin || 50;
    const costBrl = productData.costPriceBrl || 0;
    const saleBrl = productData.salePriceBrl || (costBrl > 0 ? costBrl * (1 + margin / 100) : 0);

    const product = await prisma.product.create({
      data: {
        userId,
        supplierProductId: productData.supplierProductId || `MANUAL-${Date.now()}`,
        supplierUrl: productData.supplierUrl,
        supplierName: sName,
        supplierId: supplier.id,
        title: productData.title,
        description: productData.description,
        costPriceUsd: productData.costPriceUsd || (costBrl / 5.6),
        costPriceBrl: costBrl,
        margin: margin,
        salePriceBrl: saleBrl,
        stock: productData.stock || 0,
        status: 'DRAFT',
        images: JSON.stringify(productData.images || [])
      }
    });

    return product;
  }

  async updateProduct(userId: string, id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  async publishToML(userId: string, id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', mlItemId: 'MLB123456789' }
    });
  }

  async publishToShopee(userId: string, id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', shopeeItemId: 'SHOPEE123456' }
    });
  }

  /**
   * Monitoramento de Custo e Repricing Automático
   * Rastreia o preço no fornecedor e atualiza o preço de venda para proteger a margem de lucro.
   */
  async syncProduct(userId: string, id: string) {
    const product = await prisma.product.findFirst({ where: { id, userId } });
    if (!product) throw new Error('Produto não encontrado');

    let newCostBrl = product.costPriceBrl;

    // Se tiver URL do fornecedor, raspar o preço atualizado
    if (product.supplierUrl) {
      const scraped = await LinkScraper.scrapeUrl(product.supplierUrl);
      if (scraped.price && scraped.price > 0) {
        newCostBrl = scraped.currency === 'USD' ? scraped.price * 5.6 : scraped.price;
      }
    }

    const priceChanged = Math.abs(newCostBrl - product.costPriceBrl) > 0.05;
    const margin = product.margin || 50;
    const newSalePriceBrl = newCostBrl * (1 + margin / 100);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        costPriceBrl: newCostBrl,
        salePriceBrl: newSalePriceBrl,
        lastSyncAt: new Date(),
      }
    });

    if (priceChanged) {
      await prisma.syncLog.create({
        data: {
          type: 'PRODUCT_SYNC',
          entityId: product.id,
          platform: product.supplierName,
          message: `Preço ajustado automaticamente para proteger margem: Custo R$ ${product.costPriceBrl.toFixed(2)} -> R$ ${newCostBrl.toFixed(2)}. Novo preço de venda: R$ ${newSalePriceBrl.toFixed(2)}`,
          status: 'SUCCESS'
        }
      });
    }

    return { 
      product: updated, 
      priceChanged, 
      oldCost: product.costPriceBrl, 
      newCost: newCostBrl,
      newSalePrice: newSalePriceBrl 
    };
  }

  async syncAllActiveProducts() {
    const activeProducts = await prisma.product.findMany({ where: { status: 'ACTIVE' } });
    console.log(`[Repricer] Sincronizando preços de ${activeProducts.length} produtos ativos...`);
    
    for (const p of activeProducts) {
      try {
        await this.syncProduct(p.userId, p.id);
      } catch (err: any) {
        console.error(`[Repricer] Erro ao sincronizar produto ${p.id}:`, err.message);
      }
    }
  }

  async deleteProduct(userId: string, id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
