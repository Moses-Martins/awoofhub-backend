import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';

import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a report',
  })
  @ApiResponse({
    status: 201,
    description: 'Report submitted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @CurrentUser() user: User,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(
      createReportDto,
      user.id,
    );
  }

  @Post(':id/status')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update report moderation status',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Report ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateReportStatusDto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(
      id,
      updateReportStatusDto.status,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reports',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports fetched successfully',
  })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get report by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Report ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Report fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }
}