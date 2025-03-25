import { IsDateString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  villaId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
