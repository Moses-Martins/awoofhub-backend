import {
    IsEmail,
    IsEnum,
    IsString,
    IsStrongPassword,
    Length
} from 'class-validator';
import { UserRole } from '../entities/user.entity';


export class CreateUserDto {
    @IsString()
    @Length(1, 50)
    name: string;

    @IsString()
    @Length(8, 20)
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        {
            message: 'password should contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
        },
    )
    password: string;

    @IsEmail()
    email: string;

    @IsEnum(UserRole)
    role: UserRole;
}