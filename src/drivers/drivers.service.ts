import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

const driverSelect = {
  id: true,
  companyId: true,
  userId: true,
  fullName: true,
  documentId: true,
  phone: true,
  licenseType: true,
  licenseExpiresAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    const company = await this.prisma.transportCompany.findUnique({
      where: { id: dto.companyId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    try {
      return await this.prisma.driver.create({
        data: {
          companyId: dto.companyId,
          userId: dto.userId,
          fullName: dto.fullName,
          documentId: dto.documentId,
          phone: dto.phone,
          licenseType: dto.licenseType,
          licenseExpiresAt: dto.licenseExpiresAt
            ? new Date(dto.licenseExpiresAt)
            : undefined,
          status: dto.status,
        },
        select: driverSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This user is already assigned as a driver');
      }
      throw error;
    }
  }
  async findAll(companyId?: string) {
    return this.prisma.driver.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        ...driverSelect,
        company: { select: { id: true, name: true } },
      },
    });
  }
  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        ...driverSelect,
        company: { select: { id: true, name: true } },
        assignments: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            vehicle: { select: { id: true, plate: true, type: true } },
          },
          orderBy: { startAt: 'desc' },
        },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }
  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id);
    try {
      return await this.prisma.driver.update({
        where: { id },
        data: {
          ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
          ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
          ...(dto.documentId !== undefined
            ? { documentId: dto.documentId }
            : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.licenseType !== undefined
            ? { licenseType: dto.licenseType }
            : {}),
          ...(dto.licenseExpiresAt !== undefined
            ? { licenseExpiresAt: new Date(dto.licenseExpiresAt) }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
        select: driverSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This user is already assigned as a driver');
      }
      throw error;
    }
  }
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.driver.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: driverSelect,
    });
  }
}
