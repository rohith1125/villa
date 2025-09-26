import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            villa: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendBookingCreated: jest.fn(),
            sendBookingConfirmed: jest.fn(),
            sendBookingRejected: jest.fn(),
            sendBookingCreatedWhatsApp: jest.fn(),
            sendBookingConfirmedWhatsApp: jest.fn(),
            sendBookingRejectedWhatsApp: jest.fn(),
            sendBookingInvoicePdf: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
