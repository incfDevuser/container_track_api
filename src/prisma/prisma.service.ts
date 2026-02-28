import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString =
      process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
    if (!connectionString) {
      throw new Error('No database connection string found. Set DIRECT_URL or DATABASE_URL in your environment or .env file.');
    }
    const adapter = new PrismaPg({ connectionString });
    super({ adapter } as Prisma.PrismaClientOptions);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
