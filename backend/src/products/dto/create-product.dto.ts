import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  purchasePrice: number;

  @IsNumber()
  @Min(0.01)
  salePrice: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  minStock: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
