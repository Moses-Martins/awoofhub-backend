import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto, user.id);
  }

  @Post(":id/status")
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateReportStatusDto: UpdateReportStatusDto) {
    return this.reportsService.updateStatus(id, updateReportStatusDto.status);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

}
