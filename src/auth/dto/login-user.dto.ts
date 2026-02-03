import { PickType } from '@nestjs/mapped-types';
import { IsJWT, IsString, IsStrongPassword, Length } from 'class-validator';
import {
    CreateUserDto
} from 'src/users/dto/create-user.dto';
export class LoginUserDto extends PickType(CreateUserDto, [
    'email',
    'password',
    'role'
] as const) { }

export class EmailDto extends PickType(CreateUserDto, [
    'email',
] as const) { }

export class ResetPasswordDto {
    @IsString()
    token: string;

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
}

export class VerifyEmailDto {
    @IsJWT()
    token: string;
}

