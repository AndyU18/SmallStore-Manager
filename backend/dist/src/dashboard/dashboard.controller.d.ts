import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        todaySales: number;
        todayProfit: number;
        monthlySales: number;
        monthlyProfit: number;
        activeProducts: number;
        lowStockProducts: number;
    }>;
}
