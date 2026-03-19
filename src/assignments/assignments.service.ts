import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

const assignmentSelect = {
  id: true,
  driverId: true,
  vehicleId: true,
  startAt: true,
  endAt: true,
  createdAt: true,
};

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
      select: { id: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.prisma.driverVehicleAssignment.create({
      data: {
        driverId: dto.driverId,
        vehicleId: dto.vehicleId,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
      select: {
        ...assignmentSelect,
        driver: { select: { id: true, fullName: true } },
        vehicle: { select: { id: true, plate: true } },
      },
    });
  }
  async findAll(driverId?: string, vehicleId?: string) {
    return this.prisma.driverVehicleAssignment.findMany({
      where: {
        ...(driverId ? { driverId } : {}),
        ...(vehicleId ? { vehicleId } : {}),
      },
      orderBy: { startAt: 'desc' },
      select: {
        ...assignmentSelect,
        driver: { select: { id: true, fullName: true } },
        vehicle: { select: { id: true, plate: true, type: true } },
      },
    });
  }
  async findOne(id: string) {
    const assignment = await this.prisma.driverVehicleAssignment.findUnique({
      where: { id },
      select: {
        ...assignmentSelect,
        driver: { select: { id: true, fullName: true, phone: true } },
        vehicle: { select: { id: true, plate: true, type: true } },
      },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }
  async update(id: string, dto: UpdateAssignmentDto) {
    await this.findOne(id);
    return this.prisma.driverVehicleAssignment.update({
      where: { id },
      data: {
        ...(dto.endAt !== undefined ? { endAt: new Date(dto.endAt) } : {}),
      },
      select: {
        ...assignmentSelect,
        driver: { select: { id: true, fullName: true } },
        vehicle: { select: { id: true, plate: true } },
      },
    });
  }
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.driverVehicleAssignment.delete({ where: { id } });
    return { message: 'Assignment deleted' };
  }
}
