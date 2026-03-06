import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOfferDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    highlight: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

}
