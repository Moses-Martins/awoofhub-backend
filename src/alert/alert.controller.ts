import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { AlertService } from './alert.service';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) { }

  @Post(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  setAlert(@CurrentUser() user: User, @Param('businessId') businessId: string) {
    return this.alertService.setAlert(user.id, businessId);
  }

  @Delete(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  removeAlert(@CurrentUser() user: User, @Param('businessId') businessId: string) {
    return this.alertService.removeAlert(user.id, businessId);
  }

  @Get(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  getBusinessAlert(@CurrentUser() user: User, @Param('businessId') businessId: string) {
    return this.alertService.getBusinessAlert(user.id, businessId);
  }

}
