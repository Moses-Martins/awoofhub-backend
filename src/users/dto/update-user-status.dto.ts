import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { AccountStatus } from 'src/common/types/enums';

export class UpdateUserStatusDto {

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Updated account status',
  })
  @IsNotEmpty()
  @IsEnum(AccountStatus)
  status: AccountStatus;
}