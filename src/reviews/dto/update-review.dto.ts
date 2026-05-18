import {
  PartialType,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {

  @ApiPropertyOptional({
    example: 4,
    description: 'Updated review rating between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}