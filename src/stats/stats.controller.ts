import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { StatsService } from './stats.service';

@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  @Get('/dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

}
