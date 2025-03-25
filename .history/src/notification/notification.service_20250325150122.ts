import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
import * as streamBuffers from 'stream-buffers';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private twilioClient: Twilio;

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

    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
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

  async sendWhatsApp(to: string, message: string) {
    return this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${to}`,
    });
  }

  async sendBookingCreatedWhatsApp(to: string, bookingId: string) {
    const message = `📌 Booking Created\nBooking ID: ${bookingId}\nYour booking request has been submitted.`;
    return this.sendWhatsApp(to, message);
  }

  async sendBookingConfirmedWhatsApp(to: string, bookingId: string) {
    const message = `✅ Booking Confirmed\nBooking ID: ${bookingId}\nYour booking has been confirmed.`;
    return this.sendWhatsApp(to, message);
  }

  async sendBookingRejectedWhatsApp(to: string, bookingId: string) {
    const message = `❌ Booking Rejected\nBooking ID: ${bookingId}\nUnfortunately, your booking was rejected.`;
    return this.sendWhatsApp(to, message);
  }

  async sendBookingInvoicePdf(to: string, booking: any) {
    const doc = new PDFDocument();
    const stream = new streamBuffers.WritableStreamBuffer();

    doc.pipe(stream);

    doc.fontSize(20).text('🏖️ Booking Invoice', { align: 'center' }).moveDown();

    doc.fontSize(12).text(`Booking ID: ${booking.id}`);
    doc.text(`Villa: ${booking.villa.title}`);
    doc.text(`Location: ${booking.villa.location}`);
    doc.text(`Dates: ${booking.startDate} to ${booking.endDate}`);
    doc.text(`Total Price: ₹${booking.totalPrice}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();
    doc.text(`Thank you for booking with us!`);

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));

    const buffer = stream.getContents();

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Your Booking Invoice 🧾',
      html: `<p>Hi, please find your booking invoice attached as a PDF.</p>`,
      attachments: [
        {
          filename: `Booking-${booking.id}.pdf`,
          content: buffer,
        },
      ],
    });
  }
}
