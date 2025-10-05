import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

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
}