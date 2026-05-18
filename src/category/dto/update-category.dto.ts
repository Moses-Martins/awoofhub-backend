import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {

  @ApiPropertyOptional({
    example: 'Fashion',
    description: 'Updated category name',
  })
  @IsOptional()
  @IsString()
  name?: string;
}