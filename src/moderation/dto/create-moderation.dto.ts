import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  ModerationActionType,
  TargetType,
} from 'src/common/types/enums';

export class CreateModerationDto {

  @ApiProperty({
    enum: TargetType,
    example: TargetType.USER,
    description: 'Target entity type for moderation',
  })
  @IsNotEmpty()
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the moderation target',
  })
  @IsNotEmpty()
  @IsUUID()
  targetId: string;

  @ApiProperty({
    enum: ModerationActionType,
    example: ModerationActionType.SUSPEND,
    description: 'Moderation action being applied',
  })
  @IsNotEmpty()
  @IsEnum(ModerationActionType)
  actionType: ModerationActionType;

  @ApiPropertyOptional({
    example: 'Violation of community guidelines',
    description: 'Reason for moderation action',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Optional moderation expiration date',
  })
  @IsOptional()
  endsAt?: Date;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440999',
    description: 'Associated report ID',
  })
  @IsOptional()
  reportId?: string;
}