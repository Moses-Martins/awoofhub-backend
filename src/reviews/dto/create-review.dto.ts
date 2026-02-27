import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    comment?: string;
}
