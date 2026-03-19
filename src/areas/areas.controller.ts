import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { CreateAreaPointDto } from './dto/create-area-point.dto';
import { UpdateAreaPointDto } from './dto/update-area-point.dto';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  create(@Body() dto: CreateAreaDto) {
    return this.areasService.create(dto);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.areasService.findAll(companyId);
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.areasService.findByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAreaDto) {
    return this.areasService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.deactivate(id);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.activate(id);
  }

  @Post(':id/points')
  createPoint(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAreaPointDto,
  ) {
    return this.areasService.createPoint(id, dto);
  }

  @Get(':id/points')
  findPoints(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('inside') inside?: string,
  ) {
    const parsedInside =
      inside === undefined ? undefined : inside.toLowerCase() === 'true';
    return this.areasService.findPoints(id, parsedInside);
  }

  @Get(':id/points/inside')
  findInsidePoints(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.findPoints(id, true);
  }

  @Patch(':id/points/:pointId')
  updatePoint(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pointId', ParseUUIDPipe) pointId: string,
    @Body() dto: UpdateAreaPointDto,
  ) {
    return this.areasService.updatePoint(id, pointId, dto);
  }
}
