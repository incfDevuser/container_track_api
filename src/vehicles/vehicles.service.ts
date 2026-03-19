import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

const vehicleSelect = {
  id: true,
  companyId: true,
  plate: true,
  type: true,
  status: true,
  gpsExternalId: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVehicleDto) {
    const company = await this.prisma.transportCompany.findUnique({
      where: { id: dto.companyId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    try {
      return await this.prisma.vehicle.create({
        data: {
          companyId: dto.companyId,
          plate: dto.plate,
          type: dto.type,
          status: dto.status,
          gpsExternalId: dto.gpsExternalId,
        },
        select: vehicleSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A vehicle with this plate already exists');
      }
      throw error;
    }
  }

  async findAll(companyId?: string) {
    return this.prisma.vehicle.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        ...vehicleSelect,
        company: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: {
        ...vehicleSelect,
        company: { select: { id: true, name: true } },
        assignments: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            driver: { select: { id: true, fullName: true } },
          },
          orderBy: { startAt: 'desc' },
        },
      },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: {
          ...(dto.plate !== undefined ? { plate: dto.plate } : {}),
          ...(dto.type !== undefined ? { type: dto.type } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.gpsExternalId !== undefined
            ? { gpsExternalId: dto.gpsExternalId }
            : {}),
        },
        select: vehicleSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A vehicle with this plate already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: vehicleSelect,
    });
  }
}
