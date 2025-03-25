import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VillaService } from './villa.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('villa')
export class VillaController {
  constructor(private readonly villaService: VillaService) {}

  // Create a new villa
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Req() req,
    @Body()
    body: {
      title: string;
      description: string;
      location: string;
      latitude: number;
      longitude: number;
      pricePerNight: number;
      amenities: string[];
      images: string[];
      status: 'DRAFT' | 'PUBLISHED';
      cancellationPolicy: 'FLEXIBLE' | 'MODERATE' | 'STRICT';
    },
  ) {
    return this.villaService.createVilla(req.user.userId, body);
  }

  // Get villas created by the logged-in owner
  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  async getMine(@Req() req) {
    return this.villaService.getOwnVillas(req.user.userId);
  }
  
    // Get a public villa by ID
    @Get(':id')
    async getOne(@Param('id') id: string) {
      return this.villaService.getPublicVilla(id);
    }
  
    // Get all published villas
    @Get()
    async getAll() {
      return this.villaService.listPublishedVillas();
    }
  }
  