import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Ro'yxatdan o'tish
  async signup(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new UnauthorizedException("Email already registered");

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  // 2. Login
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (!user.isActive)
      throw new UnauthorizedException("Account is deactivated");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException("Invalid credentials");

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // 3. Joriy foydalanuvchini olish
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException("User not found");
    return user;
  }

  // 4. Profilni tahrirlash (AuthController xatosini tuzatish uchun)
  async updateProfile(userId: string, name: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  // 5. Parolni o'zgartirish (AuthController xatosini tuzatish uchun)
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    // Eski parolni bazadagi bilan solishtirish
    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Yangi parolni hash qilish
    const hashedNewPassword = await bcrypt.hash(newPass, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password updated successfully" };
  }
}
