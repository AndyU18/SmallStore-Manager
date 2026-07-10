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
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let StockMovementsService = class StockMovementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        return this.prisma.stockMovement.findMany({
            where: {
                ...(filters.productId ? { productId: filters.productId } : {}),
                ...(filters.type ? { type: filters.type } : {}),
            },
            include: {
                product: { include: { category: true } },
                user: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async adjust(dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: dto.productId } });
            if (!product) {
                throw new common_1.NotFoundException('Producto no encontrado');
            }
            const previousStock = product.stock;
            const newStock = this.calculateNewStock(dto.type, previousStock, dto.quantity);
            if (newStock < 0) {
                throw new common_1.BadRequestException('El ajuste no puede dejar stock negativo');
            }
            const updatedProduct = await tx.product.update({
                where: { id: dto.productId },
                data: { stock: newStock },
                include: { category: true },
            });
            const movement = await tx.stockMovement.create({
                data: {
                    productId: dto.productId,
                    type: dto.type,
                    quantity: dto.quantity,
                    previousStock,
                    newStock,
                    reason: dto.reason,
                    userId,
                },
                include: {
                    product: true,
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
            });
            return { product: updatedProduct, movement };
        });
    }
    calculateNewStock(type, currentStock, quantity) {
        if (type === client_1.MovementType.IN || type === client_1.MovementType.RETURN) {
            return currentStock + quantity;
        }
        if (type === client_1.MovementType.OUT) {
            return currentStock - quantity;
        }
        return currentStock + quantity;
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map