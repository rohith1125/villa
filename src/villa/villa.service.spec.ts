import { Test, TestingModule } from '@nestjs/testing';
import { VillaService } from './villa.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VillaService', () => {
  let service: VillaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VillaService,
        {
          provide: PrismaService,
          useValue: {
            villa: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            villaAvailability: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VillaService>(VillaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
