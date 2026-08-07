import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  async getStats(userId: string) {
    const totalProducts = await prisma.product.count({ where: { userId } });
    const totalOrders = await prisma.order.count({ where: { userId } });
    const pendingTracking = await prisma.order.count({ where: { userId, status: 'AWAITING_TRACKING' } });
    
    const revenueAgg = await prisma.order.aggregate({
      where: { userId, status: { notIn: ['CANCELLED', 'ERROR'] } },
      _sum: { totalBrl: true }
    });

    return {
      totalProducts,
      totalOrders,
      pendingTracking,
      revenueBrl: revenueAgg._sum.totalBrl || 0
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
    // In a real scenario we would group by date
    // For now we mock it
    return [
      { date: '2023-10-01', revenue: 150 },
      { date: '2023-10-02', revenue: 300 },
      { date: '2023-10-03', revenue: 0 },
      { date: '2023-10-04', revenue: 450 },
    ];
  }
}
