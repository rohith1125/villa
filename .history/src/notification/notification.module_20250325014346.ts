import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService], // 👈 make it available to other modules
})
export class NotificationModule {}
