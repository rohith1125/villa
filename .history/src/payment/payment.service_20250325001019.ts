import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async initiatePayment(bookingId: string, gateway: 'STRIPE' | 'RAZORPAY') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { villa: true },
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'PENDING') throw new Error('Booking already paid');

    const amountInPaise = booking.totalPrice * 100;

    if (gateway === 'STRIPE') {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: booking.villa.title,
              },
              unit_amount: amountInPaise,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.DOMAIN}/payment/success?bookingId=${bookingId}`,
        cancel_url: `${process.env.DOMAIN}/payment/cancel?bookingId=${bookingId}`,
        metadata: { bookingId },
      });

      await this.prisma.payment.create({
        data: {
          bookingId,
          gateway: 'STRIPE',
          amount: booking.totalPrice,
          status: 'INITIATED',
          transactionId: session.id,
        },
      });

      return { url: session.url };
    }

    // RAZORPAY
    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: bookingId,
    });

    await this.prisma.payment.create({
      data: {
        bookingId,
        gateway: 'RAZORPAY',
        amount: booking.totalPrice,
        status: 'INITIATED',
        transactionId: order.id,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    };
  }

  async confirmStripePayment(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
  
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      session.payment_intent as string,
      { expand: ['charges'] }, // ✅ this tells Stripe to include charges
    );
  
    const receiptUrl =
      paymentIntent.charges?.data[0]?.receipt_url ?? null;
  
    await this.prisma.payment.update({
      where: { transactionId: session.id },
      data: {
        status: 'SUCCESS',
        receiptUrl,
      },
    });
  
    await this.prisma.booking.update({
      where: { id: session.metadata?.bookingId },
      data: { status: 'CONFIRMED' },
    });
  }
  

    await this.prisma.booking.update({
      where: { id: session.metadata?.bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  async confirmRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const crypto = await import('crypto');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      throw new Error('Invalid Razorpay signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: razorpay_order_id },
    });

    if (!payment) throw new Error('Payment not found');

    await this.prisma.payment.update({
      where: { transactionId: razorpay_order_id },
      data: {
        status: 'SUCCESS',
        transactionId: razorpay_payment_id,
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });
  }
}
