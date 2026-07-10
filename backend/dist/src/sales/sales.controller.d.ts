import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
        } | null;
        items: ({
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
            purchasePrice: number;
            quantity: number;
            productId: string;
            profit: number;
            price: number;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SaleStatus;
        userId: string;
        customerId: string | null;
        subtotal: number;
        total: number;
        profit: number;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
        } | null;
        items: ({
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
            purchasePrice: number;
            quantity: number;
            productId: string;
            profit: number;
            price: number;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SaleStatus;
        userId: string;
        customerId: string | null;
        subtotal: number;
        total: number;
        profit: number;
    }>;
    create(dto: CreateSaleDto, user: {
        id: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
        } | null;
        items: ({
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
            purchasePrice: number;
            quantity: number;
            productId: string;
            profit: number;
            price: number;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SaleStatus;
        userId: string;
        customerId: string | null;
        subtotal: number;
        total: number;
        profit: number;
    }>;
    cancel(id: string, user: {
        id: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
        } | null;
        items: ({
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
            purchasePrice: number;
            quantity: number;
            productId: string;
            profit: number;
            price: number;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SaleStatus;
        userId: string;
        customerId: string | null;
        subtotal: number;
        total: number;
        profit: number;
    }>;
}
