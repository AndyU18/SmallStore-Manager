import { MovementType } from '@prisma/client';
import { IsEnum, IsInt, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(3)
  reason: string;
}
