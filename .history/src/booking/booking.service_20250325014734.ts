import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cancelStaleUnpaidBookings() {
    const staleTime = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: staleTime },
      },
    });

    for (const booking of bookings) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });
      console.log(`⏰ Auto-cancelled booking: ${booking.id}`);
    }
  }

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

    const booking = await this.prisma.booking.create({
      data: {
        villaId: dto.villaId,
        guestId: userId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        guest: true,
        villa: { include: { owner: true } },
      },
    });

    // 🔔 Send email to guest and owner
    await this.notification.sendBookingCreated(booking.guest.email, booking.id);
    await this.notification.sendBookingCreated(booking.villa.owner.email, booking.id);

    return booking;
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

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    const guest = await this.prisma.user.findUnique({
      where: { id: booking.guestId },
    });

    if (guest?.email) {
      await this.notification.sendBookingConfirmed(guest.email, bookingId);
    }

    return updated;
  }

  async rejectBooking(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { villa: true },
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'PENDING') throw new Error('Booking is not pending');
    if (booking.villa.ownerId !== ownerId) throw new Error('Unauthorized');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    const guest = await this.prisma.user.findUnique({
      where: { id: booking.guestId },
    });

    if (guest?.email) {
      await this.notification.sendBookingRejected(guest.email, bookingId);
    }

    return updated;
  }

  async getBookingsForVilla(
    villaId: string,
    ownerId: string,
    userRole: string,
  ) {
    const villa = await this.prisma.villa.findUnique({
      where: { id: villaId },
    });

    if (!villa) throw new Error('Villa not found');
    if (villa.ownerId !== ownerId && userRole !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return this.prisma.booking.findMany({
      where: { villaId },
      include: {
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
