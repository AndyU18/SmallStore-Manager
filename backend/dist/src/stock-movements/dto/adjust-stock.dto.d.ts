import { MovementType } from '@prisma/client';
export declare class AdjustStockDto {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: string;
}
