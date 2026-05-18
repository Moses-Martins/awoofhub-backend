import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  ReportType,
  TargetType,
} from 'src/common/types/enums';

export class CreateReportDto {

  @ApiProperty({
    enum: ReportType,
    example: ReportType.SPAM,
    description: 'Type of report being submitted',
  })
  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    enum: TargetType,
    example: TargetType.OFFER,
    description: 'Entity type being reported',
  })
  @IsNotEmpty()
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the reported entity',
  })
  @IsNotEmpty()
  @IsUUID()
  targetId: string;

  @ApiPropertyOptional({
    example: 'This offer appears misleading and violates platform policy',
    description: 'Additional report details',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}