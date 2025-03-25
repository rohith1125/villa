// src/villa/villa.controller.ts

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { VillaService } from './villa.service';
  import { AuthGuard } from '@nestjs/passport';
  import { CreateVillaDto } from './dto/create-villa.dto';
  
  @Controller('villa')
  export class VillaController {
    constructor(private readonly villaService: VillaService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(
      @Req() req,
      @Body() body: CreateVillaDto,
    ) {
      return this.villaService.createVilla(req.user.userId, body);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('mine')
    async getMine(@Req() req) {
      return this.villaService.getOwnVillas(req.user.userId);
    }
  
    @Get(':id')
    async getOne(@Param('id') id: string) {
      return this.villaService.getPublicVilla(id);
    }
  
    @Get()
    async getAll() {
      return this.villaService.listPublishedVillas();
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Req() req,
      @Body() body: Partial<CreateVillaDto>,
    ) {
      return this.villaService.updateVilla(id, req.user.userId, body);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req) {
      return this.villaService.deleteVilla(id, req.user.userId);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/availability')
    async setAvailability(
      @Param('id') villaId: string,
      @Req() req,
      @Body()
      body: { startDate: string; endDate: string; reason?: string },
    ) {
      return this.villaService.blockDates(villaId, req.user.userId, body);
    }
  
    @Get(':id/availability')
    async getAvailability(@Param('id') villaId: string) {
      return this.villaService.getAvailability(villaId);
    }
  }
  