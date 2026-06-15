import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { DealType } from 'src/common/types/enums';

export class CreateOfferDto {

  @ApiProperty({
    example: '50% Off Electronics',
    description: 'Offer title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Get up to 50% discount on selected electronics',
    description: 'Offer description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'Offer category',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    example: 'cashback',
    description: 'Offer type',
  })
  @IsNotEmpty()
  @IsEnum(DealType)
  dealType: DealType;

  @ApiProperty({
    example: 'https://cdn.awoofhub.ng/offers/offer-image.jpg',
    description: 'Offer image URL',
  })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({
    example: 'Abuja, Nigeria',
    description: 'Offer location',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    example: '₦50,000',
    description: 'Offer value or pricing information',
  })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({
    example: 'https://awoofhub.ng/deals/offer',
    description: 'External deal URL',
  })
  @IsNotEmpty()
  @IsString()
  externalLink: string;

  @ApiProperty({
    example: 'Uber',
    description: 'Brand Name',
  })
  @IsNotEmpty()
  @IsString()
  brandName: string;

  @ApiPropertyOptional({
    example: 'SAVE50',
    description: 'Optional coupon code',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Offer expiration date',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}