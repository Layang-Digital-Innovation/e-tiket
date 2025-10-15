const QRCode = require('qrcode');
const handlebars = require('handlebars');

async function testQRCode() {
  console.log('=== Testing QR Code Generation ===');
  
  // Test 1: Generate QR Code
  const ticketCode = 'TEST-TICKET-123';
  const qrDataUrl = await QRCode.toDataURL(ticketCode, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 200,
    margin: 1,
  });
  
  console.log('1. QR Code Generated:');
  console.log('   - Ticket Code:', ticketCode);
  console.log('   - Data URL Length:', qrDataUrl.length);
  console.log('   - Starts with:', qrDataUrl.substring(0, 30));
  console.log('   - Is valid:', qrDataUrl.startsWith('data:image/png;base64,'));
  
  // Test 2: Handlebars with double braces (escaped)
  const template1 = '<img src="{{qrCode}}" />';
  const compiled1 = handlebars.compile(template1);
  const html1 = compiled1({ qrCode: qrDataUrl });
  console.log('\n2. Double Braces {{qrCode}}:');
  console.log('   - Contains "data:image":', html1.includes('data:image'));
  console.log('   - Preview:', html1.substring(0, 100));
  
  // Test 3: Handlebars with triple braces (unescaped)
  const template2 = '<img src="{{{qrCode}}}" />';
  const compiled2 = handlebars.compile(template2);
  const html2 = compiled2({ qrCode: qrDataUrl });
  console.log('\n3. Triple Braces {{{qrCode}}}:');
  console.log('   - Contains "data:image":', html2.includes('data:image'));
  console.log('   - Preview:', html2.substring(0, 100));
  
  // Test 4: Handlebars with each loop
  const template3 = '{{#each items}}<img src="{{{qrCode}}}" />{{/each}}';
  const compiled3 = handlebars.compile(template3);
  const html3 = compiled3({ items: [{ qrCode: qrDataUrl }] });
  console.log('\n4. With {{#each}} loop:');
  console.log('   - Contains "data:image":', html3.includes('data:image'));
  console.log('   - Preview:', html3.substring(0, 100));
  
  console.log('\n=== Test Complete ===');
}

testQRCode().catch(console.error);
