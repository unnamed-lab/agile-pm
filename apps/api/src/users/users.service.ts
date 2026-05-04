import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.avatarUrl) data.avatarUrl = dto.avatarUrl;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
  }

  async searchByEmail(email: string) {
    return this.prisma.user.findMany({
      where: { email: { contains: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true, avatarUrl: true },
      take: 10,
    });
  }

  async findSupervisors() {
    return this.prisma.user.findMany({
      where: { role: 'SUPERVISOR' },
      select: { id: true, name: true, email: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    });
  }
}
