// src/villa/villa.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVillaDto } from './dto/create-villa.dto';

@Injectable()
export class VillaService {
  constructor(private prisma: PrismaService) {}

  async createVilla(ownerId: string, data: CreateVillaDto) {
    return this.prisma.villa.create({
      data: {
        ...data,
        ownerId,
      },
    });
  }

  async getOwnVillas(ownerId: string) {
    return this.prisma.villa.findMany({
      where: { ownerId },
    });
  }

  async getPublicVilla(id: string) {
    return this.prisma.villa.findUnique({
      where: { id },
    });
  }

  async listPublishedVillas() {
    return this.prisma.villa.findMany({
      where: { status: 'PUBLISHED' },
    });
  }

  async updateVilla(id: string, ownerId: string, data: Partial<CreateVillaDto>) {
    return this.prisma.villa.updateMany({
      where: { id, ownerId },
      data,
    });
  }

  async deleteVilla(id: string, ownerId: string) {
    return this.prisma.villa.deleteMany({
      where: { id, ownerId },
    });
  }

  async blockDates(
    villaId: string,
    ownerId: string,
    body: { startDate: string; endDate: string; reason?: string },
  ) {
    const villa = await this.prisma.villa.findFirst({
      where: { id: villaId, ownerId },
    });

    if (!villa) throw new Error('Unauthorized or villa not found');

    return this.prisma.villaAvailability.create({
      data: {
        villaId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: body.reason,
      },
    });
  }

  async getAvailability(villaId: string) {
    return this.prisma.villaAvailability.findMany({
      where: { villaId },
    });
  }
}
