const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const RECEIPTS_DIR = path.join(__dirname, '..', 'receipts');

// Create the receipts directory if it doesn't exist
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

// Theme colors matching the app
const COLORS = {
  green:       '#2D6A4F',
  greenLight:  '#40916C',
  greenPale:   '#D8F3DC',
  mustard:     '#D4A017',
  mustardLight:'#F0C842',
  white:       '#FAFAF7',
  ink:         '#1A1A1A',
  inkSoft:     '#4A4A4A',
  inkMuted:    '#8A8A8A',
  border:      '#E8E3D8',
};

/**
 * Generate a branded PDF receipt for a completed payment.
 */
async function generateReceipt(data) {
  return new Promise((resolve, reject) => {
    // Create a new A4-sized PDF with 50-point margins on all sides
   const doc = new PDFDocument({ size: 'A4', margin: 0 });

    // The PDF will be saved as a file named after the payment link ID
    const filePath = path.join(RECEIPTS_DIR, `${data.linkId}.pdf`);
    const stream = fs.createWriteStream(filePath);

    // Pipe the PDF content to the file
    doc.pipe(stream);

        const W = 595; // A4 width in points

 
    // ── HEADER BAND ──────────────────────────────────────────────────────────
    // Full-width green background
    doc.rect(0, 0, W, 180).fill(COLORS.green);
 
    // Subtle circle decorations
    doc.circle(W - 60, 30, 80).fillOpacity(0.08).fill(COLORS.mustard);
    doc.circle(60, 160, 60).fillOpacity(0.06).fill(COLORS.mustardLight);
    doc.fillOpacity(1);
 
    // Brand name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor(COLORS.mustard)
      .text('PAYLINK', 50, 44, { characterSpacing: 4 });
 
    // Tagline
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('white')
      .fillOpacity(0.65)
      .text('M-Pesa Payment Receipt', 50, 78, { characterSpacing: 1 });
    doc.fillOpacity(1);
 
    // Mustard accent line
    doc.rect(50, 96, 60, 3).fill(COLORS.mustard);
 
    // Amount — large and prominent
    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('white')
      .fillOpacity(0.65)
      .text('AMOUNT PAID', 50, 116, { characterSpacing: 1.5 });
    doc.fillOpacity(1);
 
    doc
      .fontSize(40)
      .font('Helvetica-Bold')
      .fillColor('white')
      .text(`KES ${Number(data.amount).toLocaleString()}`, 50, 130);
 
    // ── RECEIPT META STRIP ────────────────────────────────────────────────────
    // Light green strip below header
    doc.rect(0, 180, W, 48).fill(COLORS.greenPale);
 
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(COLORS.green)
      .text('RECEIPT NO.', 50, 193, { characterSpacing: 0.8 });
 
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(COLORS.ink)
      .text(data.receiptNumber || 'N/A', 50, 206);
 
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(COLORS.green)
      .text('DATE', 260, 193, { characterSpacing: 0.8 });
 
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(COLORS.ink)
      .text(formatMpesaDate(data.date), 260, 206);
 
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(COLORS.green)
      .text('REFERENCE', 430, 193, { characterSpacing: 0.8 });
 
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(COLORS.ink)
      .text(data.linkId.slice(0, 8).toUpperCase(), 430, 206);
 
    // ── DETAILS SECTION ───────────────────────────────────────────────────────
    let y = 260;
 
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.inkMuted)
      .text('PAYMENT DETAILS', 50, y, { characterSpacing: 1 });
 
    y += 20;
    doc.rect(50, y, W - 100, 0.5).fill(COLORS.border);
    y += 16;
 
    // Detail rows
    const rows = [
      { label: 'Client Name', value: data.clientName },
      { label: 'Phone Number', value: formatDisplayPhone(data.phone) },
      { label: 'Transaction Date', value: formatMpesaDate(data.date) },
      { label: 'M-Pesa Receipt', value: data.receiptNumber || 'N/A' },
    ];
 
    if (data.description) {
      rows.push({ label: 'Description', value: data.description });
    }
 
    rows.forEach((row, i) => {
      const rowBg = i % 2 === 0 ? COLORS.white : 'white';
      doc.rect(50, y - 6, W - 100, 30).fill(rowBg);
 
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(COLORS.inkMuted)
        .text(row.label, 60, y + 2);
 
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(COLORS.ink)
        .text(row.value || 'N/A', 260, y + 2, { width: 270, align: 'left' });
 
      y += 30;
    });
 
    // ── AMOUNT SUMMARY BOX ────────────────────────────────────────────────────
    y += 20;
 
    doc.rect(50, y, W - 100, 64).fill(COLORS.green);
    // Mustard left accent
    doc.rect(50, y, 5, 64).fill(COLORS.mustard);
 
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('white')
      .fillOpacity(0.7)
      .text('TOTAL AMOUNT PAID', 70, y + 14, { characterSpacing: 0.8 });
    doc.fillOpacity(1);
 
    doc
      .fontSize(26)
      .font('Helvetica-Bold')
      .fillColor(COLORS.mustardLight)
      .text(`KES ${Number(data.amount).toLocaleString()}`, 70, y + 30);
 
    // ── STATUS BADGE ──────────────────────────────────────────────────────────
    y += 90;
 
    doc.roundedRect(50, y, 110, 28, 14).fill(COLORS.greenPale);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.green)
      .text('✓  PAID', 72, y + 8);
 
    // ── FOOTER ───────────────────────────────────────────────────────────────
    const footerY = 750;
 
    doc.rect(0, footerY, W, 92).fill(COLORS.ink);
 
    // Left: brand
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(COLORS.mustard)
      .text('PAYLINK', 50, footerY + 18, { characterSpacing: 3 });
 
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('white')
      .fillOpacity(0.5)
      .text('sheryl.dev', 50, footerY + 36);
    doc.fillOpacity(1);
 
    // Right: disclaimer
    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('white')
      .fillOpacity(0.45)
      .text(
        'This is a computer-generated receipt.\nNo signature required.',
        W - 220,
        footerY + 22,
        { width: 170, align: 'right' }
      );
    doc.fillOpacity(1);
 
    // Thin mustard line at very bottom
    doc.rect(0, footerY + 78, W, 3).fill(COLORS.mustard);
 
    // ── FINALIZE ──────────────────────────────────────────────────────────────
    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

/**
 * Draw a label-value pair at a specific (x, y) position.
 * The label is small and gray. The value is larger and bold.
 */
function drawField(doc, label, value, x, y) {
  doc.fontSize(8).font('Helvetica').fillColor(COLORS.inkMuted).text(label, x, y);


  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(COLORS.ink)
    .text(value || 'N/A', x, y + 14);
}

/**
 * Convert M-Pesa date format (YYYYMMDDHHmmss) to a human-readable string.
 * Example: "20260329143022" becomes "29 Mar 2026, 14:30"
 */
function formatMpesaDate(dateStr) {
  if (!dateStr || dateStr.length < 14) return dateStr;

  const s = String(dateStr);
  const year = s.slice(0, 4);
  const month = s.slice(4, 6);
  const day = s.slice(6, 8);
  const hour = s.slice(8, 10);
  const min = s.slice(10, 12);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}, ${hour}:${min}`;
}

/**
 * Format a phone number for display on the receipt.
 * Converts 254712345678 to +254 712 345 678
 */
function formatDisplayPhone(phone) {
  const p = String(phone);
  if (p.length === 12 && p.startsWith('254')) {
    return `+254 ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
  }
  return p;
}

module.exports = { generateReceipt };
