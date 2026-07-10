import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateSaleDto, @CurrentUser() user: { id: string }) {
    return this.salesService.create(dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.salesService.cancel(id, user.id);
  }
}
