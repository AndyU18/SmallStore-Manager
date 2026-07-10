import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReport(startDate?: string, endDate?: string): Promise<{
        filters: {
            startDate: string | null;
            endDate: string | null;
        };
        summary: {
            salesCount: number;
            subtotal: number;
            total: number;
            profit: number;
        };
        sales: ({
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
        })[];
        topProducts: {
            product: ({
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
            }) | undefined;
            quantity: number;
            profit: number;
        }[];
        lowStockProducts: ({
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
        })[];
        salesByDay: {
            date: string;
            total: number;
            profit: number;
            count: number;
        }[];
    }>;
}
