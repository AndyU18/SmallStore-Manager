import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { productId?: string; type?: MovementType }) {
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

  async adjust(dto: AdjustStockDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      const previousStock = product.stock;
      const newStock = this.calculateNewStock(dto.type, previousStock, dto.quantity);

      if (newStock < 0) {
        throw new BadRequestException('El ajuste no puede dejar stock negativo');
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

  private calculateNewStock(type: MovementType, currentStock: number, quantity: number) {
    if (type === MovementType.IN || type === MovementType.RETURN) {
      return currentStock + quantity;
    }

    if (type === MovementType.OUT) {
      return currentStock - quantity;
    }

    return currentStock + quantity;
  }
}
