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

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    termsAndConditions: string;

    @IsNotEmpty()
    @IsString()
    value: string;

    @IsNotEmpty()
    @IsString()
    dealUrl: string;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

}
