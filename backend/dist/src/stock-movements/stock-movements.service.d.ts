import { MovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
export declare class StockMovementsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        productId?: string;
        type?: MovementType;
    }): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        product: {
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            sku: string;
            purchasePrice: number;
            salePrice: number;
            stock: number;
            minStock: number;
            status: boolean;
            categoryId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.MovementType;
        quantity: number;
        previousStock: number;
        newStock: number;
        reason: string;
        productId: string;
        userId: string;
    })[]>;
    adjust(dto: AdjustStockDto, userId: string): Promise<{
        product: {
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            sku: string;
            purchasePrice: number;
            salePrice: number;
            stock: number;
            minStock: number;
            status: boolean;
            categoryId: string;
        };
        movement: {
            user: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
            };
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sku: string;
                purchasePrice: number;
                salePrice: number;
                stock: number;
                minStock: number;
                status: boolean;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            reason: string;
            productId: string;
            userId: string;
        };
    }>;
    private calculateNewStock;
}
