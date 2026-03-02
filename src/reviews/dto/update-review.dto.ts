import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

}
