import { StockMovementsService } from './stock-movements.service';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    findAll(): Promise<never[]>;
}
