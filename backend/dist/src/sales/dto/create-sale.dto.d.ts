export declare class CreateSaleItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateSaleDto {
    customerId?: string;
    items: CreateSaleItemDto[];
}
