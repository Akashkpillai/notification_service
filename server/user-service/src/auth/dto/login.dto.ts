import { IsDefined, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginEmailDto {
    @IsDefined()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
