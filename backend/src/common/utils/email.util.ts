import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

export interface ETicketData {
  // Pemesan / user
  fullName: string;
  email: string;
  phoneNumber: string;
  identityType: string;
  identityNumber: string;

  // Ringkasan order
  transactionCode: string;
  status: string; // contoh: "Confirmed"
  totalAmount: string; // format Rp 0, misal "Rp 150.000"
  paymentMethod: string;

  // Daftar tiket / order items
  orderItems: Array<{
    eventName: string;
    ticketCode: string;
    startDate: string; // format: "10 Okt 2025"
    startTime: string; // format: "14:00"
    location: string;
    categoryName: string;
    qrCode: string; // base64 image string
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone: string;
    attendeeIdentityNumber: string;
  }>;
}


/**
 * Generate PDF dari HTML template e-ticket
 */
export async function generateTicketPDFHtml(data: ETicketData): Promise<Buffer> {
  // 1️⃣ Load template HTML
  const templatePath = path.join(__dirname, 'e-ticket.html'); // simpan HTML mu di sini
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  // 2️⃣ Compile template dengan Handlebars
  const template = Handlebars.compile(htmlTemplate);
  const html = template(data);

  // 3️⃣ Generate PDF pakai Puppeteer
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
