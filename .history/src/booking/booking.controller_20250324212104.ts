import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { BookingService } from './booking.service';
  import { AuthGuard } from '@nestjs/passport';
  import { CreateBookingDto } from './dto/create-booking.dto';
  
  @Controller('booking')
  export class BookingController {
    constructor(private readonly bookingService: BookingService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async bookVilla(@Req() req, @Body() dto: CreateBookingDto) {
      return this.bookingService.createBooking(req.user.userId, dto);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('my')
    async getMyBookings(@Req() req) {
      return this.bookingService.getMyBookings(req.user.userId);
    }
  }
  