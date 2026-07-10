import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        customer: true,
        items: { include: { product: { include: { category: true } } } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
  }

  async create(dto: CreateSaleDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const aggregatedItems = new Map<string, number>();
      for (const item of dto.items) {
        aggregatedItems.set(item.productId, (aggregatedItems.get(item.productId) || 0) + item.quantity);
      }

      const productIds = [...aggregatedItems.keys()];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, status: true },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('Uno o mas productos no existen o estan inactivos');
      }

      if (dto.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
        if (!customer) {
          throw new NotFoundException('Cliente no encontrado');
        }
      }

      let subtotal = 0;
      let profit = 0;
      const saleItems = products.map((product) => {
        const quantity = aggregatedItems.get(product.id) || 0;
        if (product.stock < quantity) {
          throw new BadRequestException(`Stock insuficiente para ${product.name}`);
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
            type: MovementType.OUT,
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

  async cancel(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatus.CANCELLED) {
        throw new BadRequestException('La venta ya fue anulada');
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
            type: MovementType.RETURN,
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
        data: { status: SaleStatus.CANCELLED },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          customer: true,
          items: { include: { product: { include: { category: true } } } },
        },
      });
    });
  }
}
