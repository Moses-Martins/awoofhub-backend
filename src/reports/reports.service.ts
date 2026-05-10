import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { ReportStatus, TargetType } from 'src/common/types/enums';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
    private readonly userService: UsersService,
    private readonly offerService: OffersService,
    private readonly commentService: CommentsService,
  ) { }


  async create(createReportDto: CreateReportDto, userId: string) {
      const report = this.reportRepo.create({
      ...createReportDto,
      reporter: userId,
    });
    return this.reportRepo.save(report);
  }



  async findAll(): Promise<Report[]> {
    const reports = this.reportRepo.find();
    return reports
  }


  async findById(id: string) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporter'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const target = await this.resolveTarget(
      report.targetType,
      report.targetId,
    );

    return {
      ...report,
      target,
    };
  }

  async updateStatus(reportId: string, status: ReportStatus) {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = status

    return await this.reportRepo.save(report);

  }

  private async resolveTarget(type: TargetType, id: string) {
    switch (type) {
      case TargetType.USER:
        return this.userService.getUserById(id);

      case TargetType.COMMENT:
        return this.commentService.findById(id);

      case TargetType.OFFER:
        return this.offerService.findById(id);

      default:
        return null;
    }
  }
}


