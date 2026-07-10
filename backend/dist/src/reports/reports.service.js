"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReport(filters) {
        const { startDate, endDate } = this.parseDateRange(filters);
        const saleWhere = {
            status: client_1.SaleStatus.COMPLETED,
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
    parseDateRange(filters) {
        const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00.000`) : undefined;
        const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : undefined;
        if (startDate && Number.isNaN(startDate.getTime())) {
            throw new common_1.BadRequestException('Fecha inicial invalida');
        }
        if (endDate && Number.isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Fecha final invalida');
        }
        if (startDate && endDate && startDate > endDate) {
            throw new common_1.BadRequestException('La fecha inicial no puede ser mayor a la fecha final');
        }
        return { startDate, endDate };
    }
    buildSalesByDay(sales) {
        const buckets = new Map();
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map