import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CarriersModule } from './carriers/carriers.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AreasModule } from './areas/areas.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CarriersModule,
    DriversModule,
    VehiclesModule,
    AssignmentsModule,
    AreasModule,
  ],
})
export class AppModule {}
