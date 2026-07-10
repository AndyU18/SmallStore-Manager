import { Injectable } from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      todayAggregate,
      monthlyAggregate,
      activeProducts,
      lowStockProducts,
      recentSales,
      salesLast7Days,
      topSaleItems,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: startOfToday, lt: startOfTomorrow },
        },
        _sum: { total: true, profit: true },
        _count: { id: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true, profit: true },
        _count: { id: true },
      }),
      this.prisma.product.count({ where: { status: true } }),
      this.prisma.product.findMany({
        where: {
          status: true,
          stock: { lte: this.prisma.product.fields.minStock },
        },
        include: { category: true },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        take: 8,
      }),
      this.prisma.sale.findMany({
        where: { status: SaleStatus.COMPLETED },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.sale.findMany({
        where: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true, total: true, profit: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { status: SaleStatus.COMPLETED } },
        _sum: { quantity: true, profit: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const topProductIds = topSaleItems.map((item) => item.productId);
    const products = topProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: topProductIds } },
          include: { category: true },
        })
      : [];
    const productById = new Map(products.map((product) => [product.id, product]));

    return {
      todaySales: todayAggregate._sum.total ?? 0,
      todayProfit: todayAggregate._sum.profit ?? 0,
      todaySalesCount: todayAggregate._count.id,
      monthlySales: monthlyAggregate._sum.total ?? 0,
      monthlyProfit: monthlyAggregate._sum.profit ?? 0,
      monthlySalesCount: monthlyAggregate._count.id,
      activeProducts,
      lowStockProducts: lowStockProducts.length,
      lowStockItems: lowStockProducts,
      topProducts: topSaleItems.map((item) => ({
        product: productById.get(item.productId),
        quantity: item._sum.quantity ?? 0,
        profit: item._sum.profit ?? 0,
        salesLines: item._count.productId,
      })),
      recentSales,
      salesLast7Days: this.buildLast7DaysSeries(sevenDaysAgo, salesLast7Days),
    };
  }

  private buildLast7DaysSeries(
    startDate: Date,
    sales: Array<{ createdAt: Date; total: number; profit: number }>,
  ) {
    const days = new Map<string, { date: string; total: number; profit: number; count: number }>();

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = this.formatDateKey(date);
      days.set(key, { date: key, total: 0, profit: 0, count: 0 });
    }

    for (const sale of sales) {
      const key = this.formatDateKey(sale.createdAt);
      const bucket = days.get(key);
      if (bucket) {
        bucket.total += sale.total;
        bucket.profit += sale.profit;
        bucket.count += 1;
      }
    }

    return [...days.values()];
  }

  private formatDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
