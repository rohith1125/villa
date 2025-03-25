import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    const villa = await this.prisma.villa.findUnique({
      where: { id: dto.villaId },
    });

    if (!villa) throw new Error('Villa not found');

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        villaId: dto.villaId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            startDate: { lte: new Date(dto.endDate) },
            endDate: { gte: new Date(dto.startDate) },
          },
        ],
      },
    });

    if (overlapping) throw new Error('Villa not available for selected dates');

    // Calculate total nights
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * villa.pricePerNight;

    return this.prisma.booking.create({
      data: {
        villaId: dto.villaId,
        guestId: userId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { guestId: userId },
      include: { villa: true },
    });
    
  }
}
