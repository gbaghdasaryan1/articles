import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { compare, hash } from 'bcryptjs';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await hash(dto.password, 10);
    const user = await this.userService.create(dto.email, hashedPassword);

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(userDto: Omit<User, 'id'>) {
    const user = (await this.userService.findByEmail(userDto.email)) as User;
    const passwordEquals = await compare(userDto.password, user?.password);

    if (user && passwordEquals) return user;
    throw new UnauthorizedException('Wrong email or password');
  }
}
