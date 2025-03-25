import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }

  async sendBookingCreated(to: string, bookingId: string) {
    const html = `<h3>New booking request</h3><p>Your booking ID is <strong>${bookingId}</strong>.</p>`;
    return this.sendEmail(to, 'Booking Created 📝', html);
  }

  async sendBookingConfirmed(to: string, bookingId: string) {
    const html = `<h3>Booking confirmed ✅</h3><p>Your booking ID <strong>${bookingId}</strong> is now confirmed.</p>`;
    return this.sendEmail(to, 'Booking Confirmed ✅', html);
  }

  async sendBookingRejected(to: string, bookingId: string) {
    const html = `<h3>Booking rejected ❌</h3><p>Your booking ID <strong>${bookingId}</strong> was rejected.</p>`;
    return this.sendEmail(to, 'Booking Rejected ❌', html);
  }
}
