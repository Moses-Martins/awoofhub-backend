import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ReportType, TargetType } from "src/common/types/enums";

export class CreateReportDto {
    @IsNotEmpty()
    @IsEnum(ReportType)
    type: ReportType;

    @IsNotEmpty()
    @IsEnum(TargetType)
    targetType: TargetType;

    @IsNotEmpty()
    @IsUUID()
    targetId: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
