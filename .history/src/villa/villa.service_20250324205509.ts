import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VillaService {
  constructor(private prisma: PrismaService) {}

  async createVilla(ownerId: string, data: any) {
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
}
