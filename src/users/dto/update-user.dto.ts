import { Transform } from 'class-transformer';

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { UserRole } from 'src/common/types/enums';

export class UpdateUserDto {

  @ApiPropertyOptional({
    example: 'Farouk Musa',
    description: 'Updated user full name',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Updated user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'https://cdn.awoofhub.ng/profile.jpg',
    description: 'Profile image URL',
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: 'Backend engineer and tech enthusiast',
    description: 'User biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'Abuja, Nigeria',
    description: 'User address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://portfolio.example.com',
    description: 'Personal or business website URL',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((object, value) => value !== null)
  @IsUrl()
  website?: string | null;
}