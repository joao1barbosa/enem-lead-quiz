import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateLeadAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  alternativeId: string;
}

/**
 * Payload de submissão do quiz (RF-03).
 */
export class CreateLeadDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone inválido (10-11 dígitos)' })
  phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeadAnswerDto)
  answers: CreateLeadAnswerDto[];

  /** Campo oculto para detecção de bots (RNF-01). */
  @IsOptional()
  @IsString()
  honeypot?: string;
}
