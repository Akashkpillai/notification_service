import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { UserGender } from '../enum/user-gender.enum';

export class User {
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
  @IsEmail()
  number: string;

  @IsString()
  bio?: string;

  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  preferences?: string;
}
