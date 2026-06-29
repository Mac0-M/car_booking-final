import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (user.role === 'Super_Admin' && process.env.ENABLE_SUPER_ADMIN === 'false') {
      throw new UnauthorizedException('Super Admin access is disabled.');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return {
      access_token: this.jwtService.sign({ sub: user.user_id, email: user.email, role: user.role }),
    };
  }
}
