import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MovementType, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StockMovementsService } from './stock-movements.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  async findAll(@Query('productId') productId?: string, @Query('type') type?: MovementType) {
    return this.stockMovementsService.findAll({ productId, type });
  }

  @Roles(Role.ADMIN)
  @Post('adjust')
  async adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: { id: string }) {
    return this.stockMovementsService.adjust(dto, user.id);
  }
}
