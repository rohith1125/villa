import { Module } from '@nestjs/common';
import { VillaService } from './villa.service';
import { VillaController } from './villa.controller';

@Module({
  providers: [VillaService],
  controllers: [VillaController]
})
export class VillaModule {}
