import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { CreateAreaPointDto } from './dto/create-area-point.dto';
import { UpdateAreaPointDto } from './dto/update-area-point.dto';

type PolygonVertex = {
  latitude: number;
  longitude: number;
};

const areaSelect = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  polygon: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const pointSelect = {
  id: true,
  areaId: true,
  latitude: true,
  longitude: true,
  estimatedAt: true,
  isInsideArea: true,
  isVehicleInPoint: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAreaDto) {
    await this.ensureCompanyExists(dto.companyId);
    const polygon = this.normalizePolygon(dto.polygon);

    return this.prisma.interestArea.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        description: dto.description,
        polygon: polygon as Prisma.InputJsonValue,
        isActive: dto.isActive,
      },
      select: areaSelect,
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.interestArea.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        ...areaSelect,
        _count: { select: { points: true } },
      },
    });
  }

  async findByCompany(companyId: string) {
    await this.ensureCompanyExists(companyId);

    return this.prisma.interestArea.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...areaSelect,
        _count: { select: { points: true } },
      },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.interestArea.findUnique({
      where: { id },
      select: {
        ...areaSelect,
        points: {
          select: pointSelect,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!area) throw new NotFoundException('Area not found');
    return area;
  }

  async update(id: string, dto: UpdateAreaDto) {
    await this.ensureAreaExists(id);
    const normalizedPolygon = dto.polygon
      ? this.normalizePolygon(dto.polygon)
      : undefined;

    return this.prisma.interestArea.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(normalizedPolygon !== undefined
          ? { polygon: normalizedPolygon as Prisma.InputJsonValue }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: areaSelect,
    });
  }

  async deactivate(id: string) {
    await this.ensureAreaExists(id);
    return this.prisma.interestArea.update({
      where: { id },
      data: { isActive: false },
      select: areaSelect,
    });
  }

  async activate(id: string) {
    await this.ensureAreaExists(id);
    return this.prisma.interestArea.update({
      where: { id },
      data: { isActive: true },
      select: areaSelect,
    });
  }

  async createPoint(areaId: string, dto: CreateAreaPointDto) {
    const area = await this.prisma.interestArea.findUnique({
      where: { id: areaId },
      select: {
        id: true,
        isActive: true,
        polygon: true,
      },
    });

    if (!area) throw new NotFoundException('Area not found');
    if (!area.isActive) {
      throw new BadRequestException('Cannot add points to an inactive area');
    }

    const polygon = this.parsePolygon(area.polygon);
    const isInsideArea = this.isPointInsidePolygon(
      dto.latitude,
      dto.longitude,
      polygon,
    );

    return this.prisma.areaPoint.create({
      data: {
        areaId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        estimatedAt: dto.estimatedAt ? new Date(dto.estimatedAt) : undefined,
        isInsideArea,
        isVehicleInPoint: dto.isVehicleInPoint,
      },
      select: pointSelect,
    });
  }

  async findPoints(areaId: string, inside?: boolean) {
    await this.ensureAreaExists(areaId);

    return this.prisma.areaPoint.findMany({
      where: {
        areaId,
        ...(inside !== undefined ? { isInsideArea: inside } : {}),
      },
      orderBy: [{ estimatedAt: 'desc' }, { createdAt: 'desc' }],
      select: pointSelect,
    });
  }

  async updatePoint(areaId: string, pointId: string, dto: UpdateAreaPointDto) {
    await this.ensureAreaExists(areaId);

    const point = await this.prisma.areaPoint.findUnique({
      where: { id: pointId },
      select: { id: true, areaId: true },
    });

    if (!point || point.areaId !== areaId) {
      throw new NotFoundException('Point not found in this area');
    }

    return this.prisma.areaPoint.update({
      where: { id: pointId },
      data: {
        ...(dto.estimatedAt !== undefined
          ? { estimatedAt: new Date(dto.estimatedAt) }
          : {}),
        ...(dto.isVehicleInPoint !== undefined
          ? { isVehicleInPoint: dto.isVehicleInPoint }
          : {}),
      },
      select: pointSelect,
    });
  }

  private async ensureCompanyExists(companyId: string) {
    const company = await this.prisma.transportCompany.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) throw new NotFoundException('Company not found');
  }

  private async ensureAreaExists(id: string) {
    const area = await this.prisma.interestArea.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!area) throw new NotFoundException('Area not found');
  }

  private normalizePolygon(polygon: PolygonVertex[]): PolygonVertex[] {
    if (!Array.isArray(polygon) || polygon.length < 3) {
      throw new BadRequestException(
        'Polygon must include at least 3 coordinates',
      );
    }

    const normalized = polygon.map((vertex) => ({
      latitude: vertex.latitude,
      longitude: vertex.longitude,
    }));

    const first = normalized[0];
    const last = normalized[normalized.length - 1];

    if (
      first.latitude !== last.latitude ||
      first.longitude !== last.longitude
    ) {
      normalized.push({ ...first });
    }

    if (this.calculatePolygonArea(normalized) === 0) {
      throw new BadRequestException('Polygon coordinates cannot be collinear');
    }

    return normalized;
  }

  private parsePolygon(polygon: Prisma.JsonValue): PolygonVertex[] {
    if (!Array.isArray(polygon)) {
      throw new BadRequestException('Stored polygon format is invalid');
    }

    const mapped = polygon.map((vertex) => {
      if (
        !vertex ||
        typeof vertex !== 'object' ||
        !('latitude' in vertex) ||
        !('longitude' in vertex)
      ) {
        throw new BadRequestException('Stored polygon format is invalid');
      }

      const latitude = Number((vertex as { latitude: unknown }).latitude);
      const longitude = Number((vertex as { longitude: unknown }).longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new BadRequestException('Stored polygon format is invalid');
      }

      return { latitude, longitude };
    });

    return this.normalizePolygon(mapped);
  }

  private calculatePolygonArea(polygon: PolygonVertex[]) {
    let sum = 0;

    for (let i = 0; i < polygon.length - 1; i++) {
      const current = polygon[i];
      const next = polygon[i + 1];
      sum +=
        current.longitude * next.latitude - next.longitude * current.latitude;
    }

    return Math.abs(sum / 2);
  }

  private isPointInsidePolygon(
    latitude: number,
    longitude: number,
    polygon: PolygonVertex[],
  ) {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;

      if (this.isPointOnSegment(longitude, latitude, xi, yi, xj, yj)) {
        return true;
      }

      const intersects =
        yi > latitude !== yj > latitude &&
        longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

      if (intersects) inside = !inside;
    }

    return inside;
  }

  private isPointOnSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    const cross = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
    if (Math.abs(cross) > Number.EPSILON) return false;

    const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2);
    return dot <= 0;
  }
}
