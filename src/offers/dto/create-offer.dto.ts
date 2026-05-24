import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

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
    example: 'Offer valid while stock lasts',
    description: 'Terms and conditions for the offer',
  })
  @IsNotEmpty()
  @IsString()
  termsAndConditions: string;

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
  dealUrl: string;

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