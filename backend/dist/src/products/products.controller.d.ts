import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string, categoryId?: string, lowStock?: string): Promise<({
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
    })[]>;
    create(dto: CreateProductDto, user: {
        id: string;
    }): Promise<{
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
    }>;
    deactivate(id: string): Promise<{
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
    }>;
}
