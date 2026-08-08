import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Credenciais de login do admin (RF-08).
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
