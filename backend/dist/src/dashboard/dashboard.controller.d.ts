import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        todaySales: number;
        todayProfit: number;
        todaySalesCount: number;
        monthlySales: number;
        monthlyProfit: number;
        monthlySalesCount: number;
        activeProducts: number;
        lowStockProducts: number;
        lowStockItems: ({
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
            salesLines: number;
        }[];
        recentSales: ({
            user: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
            };
            items: ({
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
        salesLast7Days: {
            date: string;
            total: number;
            profit: number;
            count: number;
        }[];
    }>;
}
