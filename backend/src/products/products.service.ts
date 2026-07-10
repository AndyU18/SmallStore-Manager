import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { search?: string; categoryId?: string; lowStock?: boolean }) {
    const where: Prisma.ProductWhereInput = {
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

  async create(dto: CreateProductDto, userId: string) {
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
              type: MovementType.IN,
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
    } catch (error) {
      this.handleKnownError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto, userId?: string) {
    const current = await this.ensureProduct(id);
    if (dto.categoryId) {
      await this.ensureCategory(dto.categoryId);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data: {
            ...dto,
            stock: dto.stock ?? current.stock,
          },
          include: { category: true },
        });

        if (dto.stock !== undefined && dto.stock !== current.stock) {
          const diff = dto.stock - current.stock;
          await tx.stockMovement.create({
            data: {
              productId: id,
              type: diff > 0 ? MovementType.IN : MovementType.OUT,
              quantity: Math.abs(diff),
              previousStock: current.stock,
              newStock: dto.stock,
              reason: 'Ajuste automatico por edicion de producto',
              userId: userId || 'system',
            },
          });
        }

        return updated;
      });
    } catch (error) {
      this.handleKnownError(error);
    }
  }

  async deactivate(id: string) {
    await this.ensureProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: false },
      include: { category: true },
    });
  }

  private async ensureProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  private async ensureCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria no encontrada');
    }
    return category;
  }

  private handleKnownError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Ya existe un producto con ese SKU');
    }
    throw error;
  }
}
