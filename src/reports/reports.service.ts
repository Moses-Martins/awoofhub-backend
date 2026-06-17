import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
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
    private readonly paginationService: PaginationService,
  ) { }


  async create(createReportDto: CreateReportDto, userId: string) {
    const report = this.reportRepo.create({
      ...createReportDto,
      reporter: userId,
    });
    return this.reportRepo.save(report);
  }



  async findAll(
    search?: string,
    status?: ReportStatus,
    targetType?: TargetType,
    createdFrom?: string,
    createdTo?: string,
    page = 1,
    limit = 10,
  ) {

    const queryBuilder = this.reportRepo
      .createQueryBuilder('report')
      .leftJoin('report.reporter', 'reporter')
      .select([
        'report',
        'reporter.id',
        'reporter.name',
        'reporter.email',
      ]);

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(report.reason ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere(
        'report.status = :status',
        { status },
      );
    }

    // Target type filter
    if (targetType) {
      queryBuilder.andWhere(
        'report.targetType = :targetType',
        { targetType },
      );
    }

    // Date filters
    if (createdFrom) {
      queryBuilder.andWhere(
        'report.createdAt >= :createdFrom',
        {
          createdFrom: new Date(createdFrom),
        },
      );
    }

    if (createdTo) {
      queryBuilder.andWhere(
        'report.createdAt <= :createdTo',
        {
          createdTo: new Date(createdTo),
        },
      );
    }

    queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const countQuery = queryBuilder
      .clone()
      .skip(undefined)
      .take(undefined)
      .orderBy();

    const total = await countQuery.getCount();

    const meta =
      this.paginationService.getPaginationMeta(
        page,
        limit,
        total,
      );

    const reports = await queryBuilder.getMany();

    return {
      data: reports,
      meta,
    };
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


