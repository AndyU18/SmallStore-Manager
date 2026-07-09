export declare class DashboardService {
    getStats(): Promise<{
        todaySales: number;
        todayProfit: number;
        monthlySales: number;
        monthlyProfit: number;
        activeProducts: number;
        lowStockProducts: number;
    }>;
}
