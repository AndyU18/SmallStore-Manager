import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getStats() {
    return {
      todaySales: 0,
      todayProfit: 0,
      monthlySales: 0,
      monthlyProfit: 0,
      activeProducts: 0,
      lowStockProducts: 0,
    };
  }
}
