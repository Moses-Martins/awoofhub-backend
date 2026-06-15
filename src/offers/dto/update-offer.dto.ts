import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DealType } from 'src/common/types/enums';
import { CreateOfferDto } from './create-offer.dto';


export class UpdateOfferDto extends PartialType(CreateOfferDto) {

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(DealType)
    dealType?: DealType;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    value?: string;

    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsOptional()
    @IsString()
    brandName?: string;

    @IsOptional()
    @IsString()
    couponCode?: string;

}







