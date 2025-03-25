import {
    Body,
    Controller,
    Header,
    Post,
    Req,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { PaymentService } from './payment.service';
  import { AuthGuard } from '@nestjs/passport';
  import { Request, Response } from 'express';
  
  @Controller('payment')
  export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post('initiate')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async initiate(
      @Req() req,
      @Body() body: { bookingId: string; gateway: 'STRIPE' | 'RAZORPAY' },
    ) {
      return this.paymentService.initiatePayment(body.bookingId, body.gateway);
    }
  
    @Post('webhook/stripe')
    @Header('Content-Type', 'application/json')
    async stripeWebhook(@Req() req: Request, @Res() res: Response) {
      try {
        const signature = req.headers['stripe-signature'];
        const rawBody = (req as any).rawBody;
  
        const event = this.paymentService.verifyStripeWebhook(signature, rawBody);
  
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.paymentService.confirmStripePayment(session.id);
        }
  
        return res.status(200).send({ received: true });
      } catch (err) {
        console.error('Stripe Webhook Error:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  
    @Post('webhook/razorpay')
    async razorpayWebhook(@Body() body: any) {
      await this.paymentService.confirmRazorpayPayment(body);
      return { received: true };
    }
  }
  