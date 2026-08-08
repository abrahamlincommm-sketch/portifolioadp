import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  async getStats(userId: string) {
    const totalProducts = await prisma.product.count({ where: { userId } });
    const totalOrders = await prisma.order.count({ where: { userId } });
    const pendingTracking = await prisma.order.count({ where: { userId, status: 'AWAITING_TRACKING' } });
    
    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordersToday = await prisma.order.count({
      where: {
        userId,
        createdAt: { gte: startOfToday }
      }
    });

    const revenueAgg = await prisma.order.aggregate({
      where: { userId, status: { notIn: ['CANCELLED', 'ERROR'] } },
      _sum: { totalBrl: true }
    });

    // Orders count by platform
    const mlOrders = await prisma.order.count({ where: { userId, platform: 'MERCADOLIVRE' } });
    const shopeeOrders = await prisma.order.count({ where: { userId, platform: 'SHOPEE' } });

    return {
      totalProducts,
      totalOrders,
      ordersToday,
      pendingTracking,
      revenueBrl: revenueAgg._sum.totalBrl || 0,
      platforms: {
        mercadolivre: mlOrders,
        shopee: shopeeOrders,
      }
    };
  }

  async getRecentOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { product: { select: { title: true } } }
    });
  }

  async getRevenueChart(userId: string) {
    const last7Days: { name: string; value: number; dateStr: string }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
      const isoDate = d.toISOString().split('T')[0];
      last7Days.push({ name: dayStr, value: 0, dateStr: isoDate });
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ['CANCELLED', 'ERROR'] }
      },
      select: { totalBrl: true, createdAt: true }
    });

    for (const order of orders) {
      const orderDate = order.createdAt.toISOString().split('T')[0];
      const match = last7Days.find(item => item.dateStr === orderDate);
      if (match) {
        match.value += order.totalBrl;
      }
    }

    return last7Days.map(({ name, value }) => ({ name, value }));
  }
}
