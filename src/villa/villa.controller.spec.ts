import { Test, TestingModule } from '@nestjs/testing';
import { VillaController } from './villa.controller';

describe('VillaController', () => {
  let controller: VillaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VillaController],
    }).compile();

    controller = module.get<VillaController>(VillaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
