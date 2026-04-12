import {
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
    Length
} from 'class-validator';
import { UserRole } from 'src/common/types/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}