import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { AlertService } from './alert.service';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) { }

  @Post(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Set alert for a business',
    description: 'Allows a user to subscribe to alerts for a business',
  })
  @ApiParam({
    name: 'businessId',
    type: String,
    description: 'ID of the business',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 201,
    description: 'Alert successfully created',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  setAlert(
    @CurrentUser() user: User,
    @Param('businessId') businessId: string,
  ) {
    return this.alertService.setAlert(user.id, businessId);
  }

  @Delete(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Remove business alert',
    description: 'Allows a user to unsubscribe from business alerts',
  })
  @ApiParam({
    name: 'businessId',
    type: String,
    description: 'ID of the business',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert successfully removed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  removeAlert(
    @CurrentUser() user: User,
    @Param('businessId') businessId: string,
  ) {
    return this.alertService.removeAlert(user.id, businessId);
  }

  @Get(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get business alert status',
    description: 'Checks whether a user has an active alert for a business',
  })
  @ApiParam({
    name: 'businessId',
    type: String,
    description: 'ID of the business',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Business alert fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getBusinessAlert(
    @CurrentUser() user: User,
    @Param('businessId') businessId: string,
  ) {
    return this.alertService.getBusinessAlert(user.id, businessId);
  }
}