import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { UserGender } from '../enum/user-gender.enum';

export class CreateUserDto {
    @IsDefined()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    number: string;

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsNotEmpty()
    @IsEnum(UserGender)
    gender: UserGender;

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    preferences?: string;

    @IsOptional()
    @IsBoolean()
    is_email_verified?: boolean;

    @IsOptional()
    @IsBoolean()
    is_blocked?: boolean;
}
