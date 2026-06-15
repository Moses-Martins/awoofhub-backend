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

  @Post(':contributorId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Set alert to a contributor',
    description: 'Allows a user to subscribe to alerts for a contributor',
  })
  @ApiParam({
    name: 'contributorId',
    type: String,
    description: 'ID of the contributor',
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
    @Param('contributorId') contributorId: string,
  ) {
    return this.alertService.setAlert(user.id, contributorId);
  }

  @Delete(':contributorId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Remove contributor alert',
    description: 'Allows a user to unsubscribe from contributor alerts',
  })
  @ApiParam({
    name: 'contributorId',
    type: String,
    description: 'ID of the contributor',
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
    @Param('contributorId') contributorId: string,
  ) {
    return this.alertService.removeAlert(user.id, contributorId);
  }

  @Get(':contributorId')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get contributor alert status',
    description: 'Checks whether a user has an active alert for a contributor',
  })
  @ApiParam({
    name: 'contributorId',
    type: String,
    description: 'ID of the contributor',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Contributor alert fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getContributorAlert(
    @CurrentUser() user: User,
    @Param('contributorId') contributorId: string,
  ) {
    return this.alertService.getContributorAlert(user.id, contributorId);
  }
}