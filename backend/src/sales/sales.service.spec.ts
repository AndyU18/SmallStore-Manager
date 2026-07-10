import { BadRequestException } from '@nestjs/common';
import { MovementType, SaleStatus } from '@prisma/client';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  const userId = 'user-1';
  const product = {
    id: 'product-1',
    name: 'Audifonos Bluetooth',
    sku: 'AUD-001',
    description: null,
    purchasePrice: 55,
    salePrice: 90,
    stock: 2,
    minStock: 1,
    status: true,
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function createService(tx: Record<string, any>) {
    const prisma = {
      $transaction: jest.fn((callback: (transaction: typeof tx) => unknown) => callback(tx)),
    };

    return {
      service: new SalesService(prisma as any),
      prisma,
      tx,
    };
  }

  it('fails with a controlled error when stock is insufficient', async () => {
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([{ ...product, stock: 0 }]),
      },
      customer: { findUnique: jest.fn() },
      sale: { create: jest.fn() },
      stockMovement: { create: jest.fn() },
    };
    const { service } = createService(tx);

    await expect(
      service.create({ items: [{ productId: product.id, quantity: 1 }] }, userId),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.sale.create).not.toHaveBeenCalled();
    expect(tx.stockMovement.create).not.toHaveBeenCalled();
  });

  it('decreases physical stock and creates an OUT movement when registering a sale', async () => {
    const sale = {
      id: 'sale-1',
      subtotal: 180,
      total: 180,
      profit: 70,
      status: SaleStatus.COMPLETED,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([product]),
        update: jest.fn().mockResolvedValue({ ...product, stock: 0 }),
      },
      customer: { findUnique: jest.fn() },
      sale: {
        create: jest.fn().mockResolvedValue(sale),
      },
      stockMovement: {
        create: jest.fn().mockResolvedValue({ id: 'movement-1' }),
      },
    };
    const { service } = createService(tx);

    const result = await service.create({ items: [{ productId: product.id, quantity: 2 }] }, userId);

    expect(result).toBe(sale);
    expect(tx.sale.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 180,
          total: 180,
          profit: 70,
        }),
      }),
    );
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: product.id },
      data: { stock: 0 },
    });
    expect(tx.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: product.id,
        type: MovementType.OUT,
        quantity: 2,
        previousStock: 2,
        newStock: 0,
        userId,
      }),
    });
  });

  it('returns inventory to the original amount when cancelling a sale', async () => {
    const sale = {
      id: 'sale-1',
      status: SaleStatus.COMPLETED,
      items: [
        {
          productId: product.id,
          quantity: 2,
          product: { ...product, stock: 0 },
        },
      ],
    };
    const cancelledSale = { ...sale, status: SaleStatus.CANCELLED };
    const tx = {
      sale: {
        findUnique: jest.fn().mockResolvedValue(sale),
        update: jest.fn().mockResolvedValue(cancelledSale),
      },
      product: {
        update: jest.fn().mockResolvedValue({ ...product, stock: 2 }),
      },
      stockMovement: {
        create: jest.fn().mockResolvedValue({ id: 'movement-2' }),
      },
    };
    const { service } = createService(tx);

    const result = await service.cancel(sale.id, userId);

    expect(result).toBe(cancelledSale);
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: product.id },
      data: { stock: 2 },
    });
    expect(tx.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: product.id,
        type: MovementType.RETURN,
        quantity: 2,
        previousStock: 0,
        newStock: 2,
        userId,
      }),
    });
  });
});
