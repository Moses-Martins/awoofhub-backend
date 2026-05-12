import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OfferStatus } from 'src/common/types/enums';

export class UpdateOfferStatusDto {
    @Transform(({ value }) => (value === '' ? null : value))
    @IsOptional()
    @IsString()
    note?: string | null;

    @IsNotEmpty()
    @IsEnum(OfferStatus)
    status: OfferStatus;
}
