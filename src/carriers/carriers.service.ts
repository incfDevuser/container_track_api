import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';

const carrierSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class CarriersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCarrierDto) {
    try {
      return await this.prisma.transportCompany.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          isActive: dto.isActive,
        },
        select: carrierSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A carrier with this email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.transportCompany.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: carrierSelect,
    });
  }

  async findOne(id: string) {
    const carrier = await this.prisma.transportCompany.findUnique({
      where: { id },
      select: {
        ...carrierSelect,
        drivers: {
          select: { id: true, fullName: true, status: true },
        },
        vehicles: {
          select: { id: true, plate: true, type: true, status: true },
        },
      },
    });
    if (!carrier) throw new NotFoundException('Carrier not found');
    return carrier;
  }

  async update(id: string, dto: UpdateCarrierDto) {
    await this.findOne(id);
    try {
      return await this.prisma.transportCompany.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.email !== undefined ? { email: dto.email } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        select: carrierSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.transportCompany.update({
      where: { id },
      data: { isActive: false },
      select: carrierSelect,
    });
  }

  async activate(id: string) {
    const carrier = await this.prisma.transportCompany.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!carrier) throw new NotFoundException('Carrier not found');
    return this.prisma.transportCompany.update({
      where: { id },
      data: { isActive: true },
      select: carrierSelect,
    });
  }
}
