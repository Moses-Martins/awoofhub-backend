import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {

  @ApiProperty({
    example: 5,
    description: 'Review rating value between 1 and 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}