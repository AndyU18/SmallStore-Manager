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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(filters.lowStock
                ? {
                    stock: {
                        lte: this.prisma.product.fields.minStock,
                    },
                }
                : {}),
        };
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { sku: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(dto, userId) {
        await this.ensureCategory(dto.categoryId);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const product = await tx.product.create({
                    data: {
                        ...dto,
                        status: dto.status ?? true,
                    },
                    include: { category: true },
                });
                if (product.stock > 0) {
                    await tx.stockMovement.create({
                        data: {
                            productId: product.id,
                            type: client_1.MovementType.IN,
                            quantity: product.stock,
                            previousStock: 0,
                            newStock: product.stock,
                            reason: 'Stock inicial de producto',
                            userId,
                        },
                    });
                }
                return product;
            });
        }
        catch (error) {
            this.handleKnownError(error);
        }
    }
    async update(id, dto) {
        const current = await this.ensureProduct(id);
        if (dto.categoryId) {
            await this.ensureCategory(dto.categoryId);
        }
        try {
            return await this.prisma.product.update({
                where: { id },
                data: {
                    ...dto,
                    stock: dto.stock ?? current.stock,
                },
                include: { category: true },
            });
        }
        catch (error) {
            this.handleKnownError(error);
        }
    }
    async deactivate(id) {
        await this.ensureProduct(id);
        return this.prisma.product.update({
            where: { id },
            data: { status: false },
            include: { category: true },
        });
    }
    async ensureProduct(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return product;
    }
    async ensureCategory(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Categoria no encontrada');
        }
        return category;
    }
    handleKnownError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new common_1.ConflictException('Ya existe un producto con ese SKU');
        }
        throw error;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map