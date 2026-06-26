import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('สิทธิ์การเข้าใช้งานไม่ถูกต้องหรือหมดอายุ');
    }
    if (user.role === 'Super_Admin' && this.configService.get<string>('ENABLE_SUPER_ADMIN') === 'false') {
      throw new UnauthorizedException('สิทธิ์การเข้าใช้งาน Super Admin ถูกปิดการใช้งาน');
    }
    return user; // req.user will be populated with this user object
  }
}
