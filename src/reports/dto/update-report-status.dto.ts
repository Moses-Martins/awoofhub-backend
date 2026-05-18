import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

import { ReportStatus } from 'src/common/types/enums';

export class UpdateReportStatusDto {

  @ApiProperty({
    enum: ReportStatus,
    example: ReportStatus.RESOLVED,
    description: 'Updated report moderation status',
  })
  @IsNotEmpty()
  @IsEnum(ReportStatus)
  status: ReportStatus;
}