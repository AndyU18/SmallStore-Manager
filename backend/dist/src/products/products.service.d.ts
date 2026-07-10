import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        search?: string;
        categoryId?: string;
        lowStock?: boolean;
    }): Promise<({
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
    })[]>;
    create(dto: CreateProductDto, userId: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateProductDto, userId?: string): Promise<{
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
    }>;
    deactivate(id: string): Promise<{
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
    }>;
    private ensureProduct;
    private ensureCategory;
    private handleKnownError;
}
