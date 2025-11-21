import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import * as handlebars from 'handlebars';

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
  private resend: Resend;
  private fromEmail: string;
  private logger = new Logger('EmailService');

  constructor(private configService: ConfigService) {
    // Register handlebars helpers
    handlebars.registerHelper('increment', (index: number) => {
      return index + 1;
    });

    // Initialize Resend with API key
    const resendApiKey = this.configService.get('RESEND_API_KEY');
    if (!resendApiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY not configured. Email sending will fail in production.');
    }
    this.resend = new Resend(resendApiKey);
    this.fromEmail = this.configService.get('SMTP_FROM', 'noreply@naikkellas.com');
  }

  private readTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    const compiledTemplate = handlebars.compile(template, {
      noEscape: false,
      strict: false,
    });
    return compiledTemplate(variables);
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    try {
      const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
      
      const template = this.readTemplate('email-verification');
      const html = this.processTemplate(template, {
        firstName: name,
        verificationUrl: verificationUrl,
      });
      
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email Address - Ticketing Platform',
        html: html,
      });

      if (response.error) {
        this.logger.error(`Failed to send verification email to ${email}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Verification email sent to ${email}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending verification email:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
      
      const template = this.readTemplate('password-reset');
      const html = this.processTemplate(template, {
        firstName: name,
        resetUrl: resetUrl,
      });
      
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset Your Password - Ticketing Platform',
        html: html,
      });

      if (response.error) {
        this.logger.error(`Failed to send password reset email to ${email}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Password reset email sent to ${email}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending password reset email:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      const template = this.readTemplate('welcome');
      const html = this.processTemplate(template, {
        firstName: name,
        platformUrl: this.configService.get('FRONTEND_URL', 'http://localhost:3000'),
      });
      
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to Our Ticketing Platform!',
        html: html,
      });

      if (response.error) {
        this.logger.error(`Failed to send welcome email to ${email}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Welcome email sent to ${email}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending welcome email:`, error);
      throw error;
    }
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
    transactionCode?: string;
    status?: string;
    totalAmount?: number;
    paymentMethod?: string;
    attendeeEmail?: string;
    attendeePhone?: string;
    attendeeIdentityType?: string;
    attendeeIdentityNumber?: string;
  }) {
    try {
      const { email, subject, ticket } = params;

      // Generate QR code as base64
      const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 200,
        margin: 1,
      });

      this.logger.log(`Generated QR code for ticket: ${ticket.ticketCode}`);

      // Format dates
      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
          };
          return date.toLocaleDateString('id-ID', options);
        } catch (error) {
          return dateString;
        }
      };

      const formattedStartDate = formatDate(ticket.startDate);
      const formattedEndDate = formatDate(ticket.endDate);

      // Create HTML email with embedded QR code (base64)
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-Tiket Event Anda</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background: #f5f5f5;
                    padding: 40px 20px;
                    line-height: 1.6;
                    color: #333;
                }
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border: 1px solid #e0e0e0;
                }
                .header {
                    background: #2563eb;
                    padding: 32px 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .header h1 {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .header p {
                    font-size: 14px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 18px;
                    color: #1a1a1a;
                    margin-bottom: 24px;
                }
                .greeting strong {
                    color: #2563eb;
                    font-weight: 600;
                }
                .ticket-card {
                    background: #ffffff;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 24px 0;
                }
                .ticket-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 2px dashed #e5e7eb;
                }
                .event-name {
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #1f2937;
                }
                .ticket-code-badge {
                    display: inline-block;
                    background: #eff6ff;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    color: #2563eb;
                    border: 1px solid #dbeafe;
                }
                .qr-section {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }
                .qr-section h3 {
                    color: #1f2937;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .qr-section p {
                    color: #6b7280;
                    font-size: 13px;
                    margin-bottom: 16px;
                }
                .qr-code-container {
                    display: inline-block;
                    padding: 12px;
                    background: #ffffff;
                    border-radius: 8px;
                    border: 2px solid #e5e7eb;
                }
                .qr-code-container img {
                    display: block;
                    width: 200px;
                    height: 200px;
                }
                .details-grid {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 16px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 500;
                }
                .detail-value {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1f2937;
                    text-align: right;
                }
                .info-box {
                    background: #eff6ff;
                    border-left: 4px solid #2563eb;
                    padding: 16px 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .info-box h4 {
                    color: #1e40af;
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .info-box p {
                    color: #374151;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .warning-box {
                    background: #fef2f2;
                    border-left: 4px solid #dc2626;
                    padding: 16px 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .warning-box h4 {
                    color: #991b1b;
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .warning-box p {
                    color: #374151;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .footer {
                    background: #f9fafb;
                    padding: 24px 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 13px;
                    margin: 6px 0;
                }
                .footer strong {
                    color: #374151;
                }
                @media (max-width: 640px) {
                    body { padding: 20px 10px; }
                    .content { padding: 24px 20px; }
                    .ticket-card { padding: 20px; }
                    .event-name { font-size: 20px; }
                    .detail-row { flex-direction: column; gap: 4px; }
                    .detail-value { text-align: left; }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <!-- Header -->
                <div class="header">
                    <h1>E-Tiket Event</h1>
                    <p>Konfirmasi Pembelian Tiket Anda</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <div class="greeting">
                        Halo <strong>${ticket.attendeeName}</strong>,<br>
                        Terima kasih atas pembelian tiket Anda! 
                    </div>

                    <!-- Ticket Card -->
                    <div class="ticket-card">
                        <div class="ticket-header">
                            <div class="event-name">${ticket.eventName}</div>
                            <div class="ticket-code-badge">${ticket.ticketCode}</div>
                        </div>

                        <!-- QR Code Section -->
                        <div class="qr-section">
                            <h3>QR Code Tiket</h3>
                            <p>Tunjukkan QR code ini saat check-in</p>
                            <div class="qr-code-container">
                                <img src="${qrDataUrl}" alt="QR Code ${ticket.ticketCode}" />
                            </div>
                        </div>

                        <!-- Event Details -->
                        <div class="details-grid">
                            <div class="detail-row">
                                <span class="detail-label">Tanggal Mulai</span>
                                <span class="detail-value">${formattedStartDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Tanggal Selesai</span>
                                <span class="detail-value">${formattedEndDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Lokasi</span>
                                <span class="detail-value">${ticket.location}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Kategori</span>
                                <span class="detail-value">${ticket.categoryName}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Info Box -->
                    <div class="info-box">
                        <h4>Cara Redeem Tiket</h4>
                        <p>
                            Datang ke <strong>booth registrasi</strong> dengan membawa e-tiket ini (print atau digital). 
                            Tunjukkan <strong>QR Code</strong> dan <strong>identitas diri</strong> untuk check-in. 
                            Registrasi dibuka mulai <strong>2 jam sebelum event dimulai</strong>.
                        </p>
                    </div>

                    <div class="warning-box">
                        <h4>Informasi Penting</h4>
                        <p>
                            • Harap datang lebih awal untuk menghindari antrian<br>
                            • Bawa identitas asli (KTP/SIM/Paspor) saat check-in<br>
                            • Satu tiket berlaku untuk satu orang<br>
                            • QR Code hanya dapat di-scan satu kali<br>
                            • Tiket tidak dapat dipindahtangankan
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p><strong>Butuh Bantuan?</strong></p>
                    <p>Email: support@eventku.com | WhatsApp: +62 821-9999-8888</p>
                    <p style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
                        2025 EventKu. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `;

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: subject ?? 'E-Tiket Event',
        html: htmlContent,
      });

      if (response.error) {
        this.logger.error(`Failed to send ticket email to ${email}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Ticket email sent to ${email}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending ticket email:`, error);
      throw error;
    }
  }

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
        gender?: string;
        address?: string;
        birthDate?: string;
      }[];
    }[];
  }) {
    try {
      const { email, buyerName, transactionCode, totalAmount, paymentMethod, status, orderItems } = params;

      // Build HTML for email
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
              <td>${att.gender || '-'}</td>
              <td>${att.birthDate || '-'}</td>
              <td>${att.identityType}</td>
              <td>${att.identityNumber}</td>
              <td>${att.address || '-'}</td>
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
                <th>Jenis Kelamin</th>
                <th>Tanggal Lahir</th>
                <th>Jenis Identitas</th>
                <th>No Identitas</th>
                <th>Alamat</th>
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

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Ringkasan Pesanan Anda - ${transactionCode}`,
        html: htmlBody,
      });

      if (response.error) {
        this.logger.error(`Failed to send order summary to ${email}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Order summary email sent to ${email}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending order summary:`, error);
      throw error;
    }
  }

  async sendWebinarAccessEmail(params: {
    to: string;
    attendeeName: string;
    eventTitle: string;
    startAt?: string | Date;
    endAt?: string | Date;
    timezone?: string;
    webinarJoinUrl: string;
    webinarNotes?: string;
  }) {
    try {
      const { to, attendeeName, eventTitle, startAt, endAt, timezone = 'Asia/Jakarta', webinarJoinUrl, webinarNotes } = params;

      const formatDate = (d?: string | Date) => {
        if (!d) return '';
        try {
          const date = typeof d === 'string' ? new Date(d) : d;
          return date.toLocaleString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: timezone,
          });
        } catch {
          return String(d ?? '');
        }
      };

      const startStr = formatDate(startAt);
      const endStr = formatDate(endAt);

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#0f172a;">
        <h2 style="margin:0 0 8px 0;">Akses Webinar Anda</h2>
        <p style="margin:0 0 16px 0;">Halo <strong>${attendeeName}</strong>,</p>
        <p style="margin:0 0 8px 0;">Anda terdaftar pada webinar <strong>${eventTitle}</strong>.</p>
        ${startStr ? `<p style="margin:0 0 4px 0;">Waktu mulai: <strong>${startStr}</strong></p>` : ''}
        ${endStr ? `<p style="margin:0 0 12px 0;">Waktu selesai: <strong>${endStr}</strong></p>` : ''}
        <p style="margin:0 12px 16px 0;">Silakan gunakan tautan berikut untuk bergabung saat waktu sudah dimulai:</p>
        <p style="margin:0 0 16px 0;"><a href="${webinarJoinUrl}" style="background:#1d4ed8;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Gabung Webinar</a></p>
        <p style="margin:0 0 12px 0; font-size:13px; color:#475569;">Mohon untuk tidak membagikan tautan ini kepada orang lain.</p>
        ${webinarNotes ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;white-space:pre-wrap;">${webinarNotes}</div>` : ''}
      </div>`;

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `[${eventTitle}] Akses Webinar Anda`,
        html,
      });

      if (response.error) {
        this.logger.error(`Failed to send webinar access email to ${to}:`, response.error);
        throw new Error(`Email sending failed: ${response.error.message}`);
      }

      this.logger.log(`✅ Webinar access email sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending webinar access email:`, error);
      throw error;
    }
  }
}
