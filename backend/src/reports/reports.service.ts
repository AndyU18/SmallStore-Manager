import { BadRequestException, Injectable } from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(filters: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = this.parseDateRange(filters);
    const saleWhere = {
      status: SaleStatus.COMPLETED,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [sales, salesAggregate, topSaleItems, lowStockProducts] = await Promise.all([
      this.prisma.sale.findMany({
        where: saleWhere,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          customer: true,
          items: { include: { product: { include: { category: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.aggregate({
        where: saleWhere,
        _sum: { subtotal: true, total: true, profit: true },
        _count: { id: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: saleWhere },
        _sum: { quantity: true, profit: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.product.findMany({
        where: {
          status: true,
          stock: { lte: this.prisma.product.fields.minStock },
        },
        include: { category: true },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const productIds = topSaleItems.map((item) => item.productId);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { category: true },
        })
      : [];
    const productById = new Map(products.map((product) => [product.id, product]));

    const salesByDay = this.buildSalesByDay(sales);

    return {
      filters: {
        startDate: startDate?.toISOString() ?? null,
        endDate: endDate?.toISOString() ?? null,
      },
      summary: {
        salesCount: salesAggregate._count.id,
        subtotal: salesAggregate._sum.subtotal ?? 0,
        total: salesAggregate._sum.total ?? 0,
        profit: salesAggregate._sum.profit ?? 0,
      },
      sales,
      topProducts: topSaleItems.map((item) => ({
        product: productById.get(item.productId),
        quantity: item._sum.quantity ?? 0,
        profit: item._sum.profit ?? 0,
      })),
      lowStockProducts,
      salesByDay,
    };
  }

  private parseDateRange(filters: { startDate?: string; endDate?: string }) {
    const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00.000`) : undefined;
    const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : undefined;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Fecha inicial invalida');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Fecha final invalida');
    }

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('La fecha inicial no puede ser mayor a la fecha final');
    }

    return { startDate, endDate };
  }

  private buildSalesByDay(sales: Array<{ createdAt: Date; total: number; profit: number }>) {
    const buckets = new Map<string, { date: string; total: number; profit: number; count: number }>();

    for (const sale of sales) {
      const key = sale.createdAt.toISOString().slice(0, 10);
      const current = buckets.get(key) || { date: key, total: 0, profit: 0, count: 0 };
      current.total += sale.total;
      current.profit += sale.profit;
      current.count += 1;
      buckets.set(key, current);
    }

    return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
