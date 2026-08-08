import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';

type MockPrisma = {
  admin: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

type MockJwtService = {
  signAsync: ReturnType<typeof vi.fn>;
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrisma;
  let jwt: MockJwtService;

  const credentials = { email: 'admin@admin.com', password: 'admin123' };

  beforeEach(() => {
    prisma = {
      admin: { findUnique: vi.fn() },
    };
    jwt = { signAsync: vi.fn() };
    service = new AuthService(prisma as never, jwt as never);
  });

  describe('login', () => {
    it('should return access token for valid credentials (RF-08)', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrador',
      });
      jwt.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await service.login(credentials);

      expect(result).toEqual({ access_token: 'signed-jwt-token' });
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'admin-1', email: 'admin@admin.com' }),
      );
    });

    it('should reject unknown email with 401', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('should reject wrong password with 401', async () => {
      prisma.admin.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrador',
      });

      await expect(
        service.login({ email: 'admin@admin.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });
});
