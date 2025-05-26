import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.entity';
import { hash, compare } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;
  let mockJwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed-password',
  };

  beforeEach(() => {
    mockUserService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as any;

    authService = new AuthService(mockUserService, mockJwtService);
  });

  describe('register', () => {
    it('should register user and return JWT token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'plain-password',
      };

      (hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await authService.register(dto);

      expect(hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserService.create).toHaveBeenCalledWith(
        dto.email,
        'hashed-password',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({ token: 'jwt-token' });
    });
  });

  describe('login', () => {
    it('should login and return JWT token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'plain-password',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(dto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(compare).toHaveBeenCalledWith(dto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existing user', async () => {
      const dto: LoginDto = {
        email: 'nonexist@example.com',
        password: 'any',
      };

      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
