import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}
  private sign(user: { id: string; email: string; rol: any }) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return this.jwtService.signAsync(payload);
  }
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('User already exists');
    try {
      const user = await this.usersService.create({
        email: dto.email,
        name: dto.name,
        password: dto.password,
        rol: dto.rol,
      } as any);
      const token = await this.sign({
        id: user.id,
        email: user.email,
        rol: user.rol,
      });
      return { user, token };
    } catch (error) {
      throw error;
    }
  }
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Credenciales inválidas');
    const passwordValid = await bcrypt.compare(password, user.password as string);
    if (!passwordValid)
      throw new UnauthorizedException('Credenciales inválidas');
    const token = await this.sign({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });
    return { user: { id: user.id, email: user.email, rol: user.rol }, token };
  }
}
