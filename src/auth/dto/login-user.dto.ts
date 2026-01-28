import { PickType } from '@nestjs/mapped-types';
import {
    CreateUserDto
} from 'src/users/dto/create-user.dto';
export class LoginUserDto extends PickType(CreateUserDto, [
    'email',
    'password',
    'role'
] as const) {}

export class ResendVerificationMailDto extends PickType(CreateUserDto, [
    'email',
] as const) {}