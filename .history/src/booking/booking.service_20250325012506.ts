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

  async confirmBooking(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { villa: true },
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'PENDING') throw new Error('Booking is not pending');
    if (booking.villa.ownerId !== ownerId) throw new Error('Unauthorized');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  async rejectBooking(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { villa: true },
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'PENDING') throw new Error('Booking is not pending');
    if (booking.villa.ownerId !== ownerId) throw new Error('Unauthorized');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  }

  async getBookingsForVilla(villaId: string, ownerId: string) {
    // Verify ownership
    const villa = await this.prisma.villa.findUnique({
      where: { id: villaId },
    });
  
    if (!villa) throw new Error('Villa not found');
    if (villa.ownerId !== ownerId) throw new Error('Unauthorized');
  
    return this.prisma.booking.findMany({
      where: { villaId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
