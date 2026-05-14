import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from 'src/common/types/enums';

export class UpdateReportStatusDto {
    @IsNotEmpty()
    @IsEnum(ReportStatus)
    status: ReportStatus;
}
