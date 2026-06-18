import { Transform } from 'class-transformer';

import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateIf
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';


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
    example: 'john_doe',
    description: 'New username (3–20 chars, lowercase letters, numbers, underscores)',
    nullable: true,
  })
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
    message:
      'Username can only contain lowercase letters, numbers, and single underscores between words',
  })
  username?: string;

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