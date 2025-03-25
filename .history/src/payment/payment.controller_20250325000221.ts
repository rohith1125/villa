import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { PaymentService } from './payment.service';
  import { AuthGuard } from '@nestjs/passport';
  
  @Controller('payment')
  export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post('initiate')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async initiate(@Req() req, @Body() body: { bookingId: string; gateway: 'STRIPE' | 'RAZORPAY' }) {
      return this.paymentService.initiatePayment(body.bookingId, body.gateway);
    }
  
    @Post('webhook/stripe')
    async stripeWebhook(@Body() body: any) {
      const sessionId = body.data.object.id;
      await this.paymentService.confirmStripePayment(sessionId);
      return { received: true };
    }
  
    @Post('webhook/razorpay')
    async razorpayWebhook(@Body() body: any) {
      await this.paymentService.confirmRazorpayPayment(body);
      return { received: true };
    }
  }
  