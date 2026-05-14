import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatus } from 'src/common/types/enums';

export class UpdateUserStatusDto {
    @IsNotEmpty()
    @IsEnum(AccountStatus)
    status: AccountStatus;
}
