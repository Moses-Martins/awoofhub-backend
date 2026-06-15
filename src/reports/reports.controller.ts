import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { ReportStatus, TargetType } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';

import { CreateReportDto } from './dto/create-report.dto';

import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

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

  @Get()
  @ApiOperation({
    summary: 'Get all reports',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'targetType', required: false, enum: TargetType })
  @ApiQuery({ name: 'createdFrom', required: false, type: String })
  @ApiQuery({ name: 'createdTo', required: false, type: String })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('status') status?: ReportStatus,
    @Query('targetType') targetType?: TargetType,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.reportsService.findAll(
      search,
      status,
      targetType,
      createdFrom,
      createdTo,
      page,
      limit,
    );
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