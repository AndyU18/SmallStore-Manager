import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async getReport() {
    return { reports: [] };
  }
}
