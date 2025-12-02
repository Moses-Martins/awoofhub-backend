import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    IsStrongPassword,
    Length
} from 'class-validator';


export class CreateUserDto {
    @ApiProperty({
        description: 'The username of the user',
        example: 'johndoe123',
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'StrongP@ssw0rd!',
    })
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

    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;
}