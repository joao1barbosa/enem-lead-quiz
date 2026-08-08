export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

/**
 * Decodifica o payload de um token JWT (segmento do meio) sem validar a
 * assinatura. Usado apenas para extrair dados do admin (RF-08).
 */
export function decodeJwtToken(token: string): JwtPayload {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('Token JWT inválido: payload ausente.');
  }

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(json) as JwtPayload;
}
