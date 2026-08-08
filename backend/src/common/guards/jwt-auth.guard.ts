import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rotas administrativas (RF-08).
 * Requer header `Authorization: Bearer <token>`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
