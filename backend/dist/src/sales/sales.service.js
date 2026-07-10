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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.sale.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                customer: true,
                items: { include: { product: { include: { category: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                customer: true,
                items: { include: { product: { include: { category: true } } } },
            },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Venta no encontrada');
        }
        return sale;
    }
    async create(dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const aggregatedItems = new Map();
            for (const item of dto.items) {
                aggregatedItems.set(item.productId, (aggregatedItems.get(item.productId) || 0) + item.quantity);
            }
            const productIds = [...aggregatedItems.keys()];
            const products = await tx.product.findMany({
                where: { id: { in: productIds }, status: true },
            });
            if (products.length !== productIds.length) {
                throw new common_1.BadRequestException('Uno o mas productos no existen o estan inactivos');
            }
            if (dto.customerId) {
                const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
                if (!customer) {
                    throw new common_1.NotFoundException('Cliente no encontrado');
                }
            }
            let subtotal = 0;
            let profit = 0;
            const saleItems = products.map((product) => {
                const quantity = aggregatedItems.get(product.id) || 0;
                if (product.stock < quantity) {
                    throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}`);
                }
                const lineSubtotal = product.salePrice * quantity;
                const lineProfit = (product.salePrice - product.purchasePrice) * quantity;
                subtotal += lineSubtotal;
                profit += lineProfit;
                return {
                    product,
                    quantity,
                    price: product.salePrice,
                    purchasePrice: product.purchasePrice,
                    profit: lineProfit,
                };
            });
            const sale = await tx.sale.create({
                data: {
                    subtotal,
                    total: subtotal,
                    profit,
                    customerId: dto.customerId,
                    userId,
                    items: {
                        create: saleItems.map((item) => ({
                            productId: item.product.id,
                            quantity: item.quantity,
                            price: item.price,
                            purchasePrice: item.purchasePrice,
                            profit: item.profit,
                        })),
                    },
                },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    customer: true,
                    items: { include: { product: { include: { category: true } } } },
                },
            });
            for (const item of saleItems) {
                const previousStock = item.product.stock;
                const newStock = previousStock - item.quantity;
                await tx.product.update({
                    where: { id: item.product.id },
                    data: { stock: newStock },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.product.id,
                        type: client_1.MovementType.OUT,
                        quantity: item.quantity,
                        previousStock,
                        newStock,
                        reason: `Venta registrada ${sale.id}`,
                        userId,
                    },
                });
            }
            return sale;
        });
    }
    async cancel(id, userId) {
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { items: { include: { product: true } } },
            });
            if (!sale) {
                throw new common_1.NotFoundException('Venta no encontrada');
            }
            if (sale.status === client_1.SaleStatus.CANCELLED) {
                throw new common_1.BadRequestException('La venta ya fue anulada');
            }
            for (const item of sale.items) {
                const previousStock = item.product.stock;
                const newStock = previousStock + item.quantity;
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: newStock },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: client_1.MovementType.RETURN,
                        quantity: item.quantity,
                        previousStock,
                        newStock,
                        reason: `Anulacion de venta ${sale.id}`,
                        userId,
                    },
                });
            }
            return tx.sale.update({
                where: { id },
                data: { status: client_1.SaleStatus.CANCELLED },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    customer: true,
                    items: { include: { product: { include: { category: true } } } },
                },
            });
        });
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map