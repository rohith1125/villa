import { Test, TestingModule } from '@nestjs/testing';
import { VillaService } from './villa.service';

describe('VillaService', () => {
  let service: VillaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VillaService],
    }).compile();

    service = module.get<VillaService>(VillaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
