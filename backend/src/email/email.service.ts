import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import * as puppeteer from 'puppeteer';

interface OrderSummaryTicket {
  eventName: string;
  ticketCode: string;
  attendeeName: string;
  startDate: string;
  endDate: string;
  location: string;
  categoryName: string;
}

interface SendOrderSummaryEmailParams {
  email: string;
  fullName: string;
  transactionCode: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  phoneNumber: string;
  identityType: string;
  identityNumber: string;
  orderItems: OrderSummaryTicket[];
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private readTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let processedTemplate = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, variables[key]);
    });
    return processedTemplate;
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    
    const template = this.readTemplate('email-verification');
    const html = this.processTemplate(template, {
      firstName: name,
      verificationUrl: verificationUrl,
    });
    
    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@ticketing-app.com'),
      to: email,
      subject: 'Verify Your Email Address - Ticketing Platform',
      html: html,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    const template = this.readTemplate('password-reset');
    const html = this.processTemplate(template, {
      firstName: name,
      resetUrl: resetUrl,
    });
    
    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@ticketing-app.com'),
      to: email,
      subject: 'Reset Your Password - Ticketing Platform',
      html: html,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, name: string) {
    const template = this.readTemplate('welcome');
    const html = this.processTemplate(template, {
      firstName: name,
      platformUrl: this.configService.get('FRONTEND_URL', 'http://localhost:3000'),
    });
    
    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@ticketing-app.com'),
      to: email,
      subject: 'Welcome to Our Ticketing Platform!',
      html: html,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async generateTicketPdf(ticket: {
    eventName: string;
    ticketCode: string;
    attendeeName: string;
    startDate: string;
    endDate: string;
    location: string;
    categoryName: string;
  }): Promise<Buffer> {
    const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode);
    const template = this.readTemplate('pdf-ticket');
    const html = this.processTemplate(template, {
      eventName: ticket.eventName,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      startDate: ticket.startDate,
      endDate: ticket.endDate,
      location: ticket.location,
      categoryName: ticket.categoryName,
      qrCode: qrDataUrl.split(',')[1],
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    await browser.close();
    return Buffer.from(pdf);
  }

  async sendTicketEmail(params: {
    email: string;
    subject?: string;
    ticket: {
      eventName: string;
      ticketCode: string;
      attendeeName: string;
      startDate: string;
      endDate: string;
      location: string;
      categoryName: string;
    };
  }) {
    const { email, subject, ticket } = params;
    const attachment = await this.generateTicketPdf({
      eventName: ticket.eventName,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      startDate: ticket.startDate,
      endDate: ticket.endDate,
      location: ticket.location,
      categoryName: ticket.categoryName,
    });

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; color:#09090b;">
        <p>Halo <strong>${ticket.attendeeName}</strong>,</p>
        <p>Terima kasih atas pembelian tiket untuk <strong>${ticket.eventName}</strong>.</p>
        <p>Tiket PDF terlampir pada email ini. Tunjukkan saat check-in.</p>
      </div>
    `;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@ticketing-app.com'),
      to: email,
      subject: subject ?? 'E-Tiket Event',
      html: htmlBody,
      attachments: [
        {
          filename: `ticket-${ticket.ticketCode}.pdf`,
          content: attachment,
          contentType: 'application/pdf',
        },
      ],
    };

    return this.transporter.sendMail(mailOptions);
  }

   // Generate satu PDF untuk semua tiket
  async generateOrderPdf(tickets: OrderSummaryTicket[]): Promise<Buffer> {
    const ticketsHtml = await Promise.all(
      tickets.map(async (ticket, index) => {
        const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode);
        return `
          <div style="border:1px solid #e4e4e7; border-radius:8px; padding:16px; margin-bottom:24px;">
            <h2 style="margin-bottom:8px;">Tiket ${index + 1}: ${ticket.eventName}</h2>
            <p>Kategori: ${ticket.categoryName}</p>
            <p>Nama Attendee: ${ticket.attendeeName}</p>
            <p>Kode Tiket: ${ticket.ticketCode}</p>
            <p>Tanggal & Waktu: ${new Date(ticket.startDate).toLocaleString()} - ${new Date(ticket.endDate).toLocaleString()}</p>
            <p>Lokasi: ${ticket.location}</p>
            <div style="margin-top:12px; text-align:center;">
              <img src="${qrDataUrl}" alt="QR Code" style="width:120px; height:120px;"/>
            </div>
          </div>
        `;
      })
    );

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Tiket</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#09090b; padding:16px; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center; margin-bottom:24px;">Tiket Event Anda</h1>
        ${ticketsHtml.join('')}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    await browser.close();
    return Buffer.from(pdf);
  }

    // Kirim email ringkasan order dengan satu PDF
 async sendOrderSummary(params: {
  email: string;
  buyerName: string;
  transactionCode: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  orderItems: {
    eventName: string;
    ticketCategory: string;
    quantity: number;
    attendees: {
      name: string;
      email: string;
      phone: string;
      identityType: string;
      identityNumber: string;
    }[];
  }[];
}) {
  const { email, buyerName, transactionCode, totalAmount, paymentMethod, status, orderItems } = params;

  // Bangun HTML untuk email
  let itemsHtml = '';
  orderItems.forEach((item, index) => {
    let attendeesHtml = '';
    item.attendees.forEach((att, i) => {
      attendeesHtml += `
        <tr>
          <td>${i + 1}</td>
          <td>${att.name}</td>
          <td>${att.email}</td>
          <td>${att.phone}</td>
          <td>${att.identityType}</td>
          <td>${att.identityNumber}</td>
        </tr>
      `;
    });

    itemsHtml += `
      <h4>Item ${index + 1}: ${item.eventName} - ${item.ticketCategory}</h4>
      <p>Quantity: ${item.quantity}</p>
      <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px; width: 100%;">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Telepon</th>
            <th>Jenis Identitas</th>
            <th>No Identitas</th>
          </tr>
        </thead>
        <tbody>
          ${attendeesHtml}
        </tbody>
      </table>
    `;
  });

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color:#09090b;">
      <p>Halo <strong>${buyerName}</strong>,</p>
      <p>Terima kasih atas pembelian tiket Anda. Berikut ringkasan pesanan:</p>
      <p><strong>Kode Transaksi:</strong> ${transactionCode}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Total Pembayaran:</strong> Rp ${totalAmount}</p>
      <p><strong>Metode Pembayaran:</strong> ${paymentMethod}</p>
      <hr />
      ${itemsHtml}
      <p>Silakan cek tiket individual di email masing-masing attendee.</p>
      <p>Salam,<br/>EventKu Team</p>
    </div>
  `;

  const mailOptions = {
    from: this.configService.get('SMTP_FROM', 'noreply@eventku.com'),
    to: email,
    subject: `Ringkasan Pesanan Anda - ${transactionCode}`,
    html: htmlBody,
  };

  return this.transporter.sendMail(mailOptions);
}




}