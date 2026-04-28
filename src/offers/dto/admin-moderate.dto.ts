import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModerationStatus } from 'src/common/types/enums';

export class AdminModerateDto {
    @Transform(({ value }) => (value === '' ? null : value))
    @IsOptional()
    @IsString()
    note?: string | null;

    @IsNotEmpty()
    @IsEnum(ModerationStatus)
    status: ModerationStatus;
}
