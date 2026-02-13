import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}
  
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  create(
    @Body() dto: CreateAlertDto,
    @CurrentUser() user: User,
  ) {
    return this.alertService.subscribe(user.id, dto.businessId);
  }

 
}
