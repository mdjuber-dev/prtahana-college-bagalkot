import jsPDF from 'jspdf';
import { siteConfig } from './site-config';
import type { AdmissionFormData } from './admission-config';

// ── Dimensions (mm) ──
const PAGE_W = 210;
const PAGE_H = 297;
const M = 12;
const CONTENT_W = PAGE_W - M * 2;
const TOP = 8;
const SECTION_GAP = 4;
const CARD_PAD = 3.5;
const CARD_R = 2;
const ROW_H = 5;
const TITLE_H = 6.5;
const ADMISSION_SESSION = '2026-27';

// ── Colors ──
const C = {
  primary: [37, 99, 235] as [number, number, number],
  primaryDark: [30, 58, 138] as [number, number, number],
  primaryMid: [29, 78, 216] as [number, number, number],
  primaryLight: [219, 234, 254] as [number, number, number],
  primary50: [239, 246, 255] as [number, number, number],
  primaryUltra: [248, 251, 255] as [number, number, number],
  gray50: [249, 250, 251] as [number, number, number],
  gray100: [243, 244, 246] as [number, number, number],
  gray200: [229, 231, 235] as [number, number, number],
  gray300: [209, 213, 219] as [number, number, number],
  gray400: [156, 163, 175] as [number, number, number],
  gray500: [107, 114, 128] as [number, number, number],
  gray700: [55, 65, 81] as [number, number, number],
  gray900: [17, 24, 39] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenLight: [220, 252, 231] as [number, number, number],
  greenDark: [21, 128, 61] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  amberLight: [254, 243, 199] as [number, number, number],
  amberDark: [180, 83, 9] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  blueLight: [219, 234, 254] as [number, number, number],
  blueDark: [29, 78, 216] as [number, number, number],
  purple: [147, 51, 234] as [number, number, number],
  purpleLight: [243, 232, 255] as [number, number, number],
  purpleDark: [126, 34, 206] as [number, number, number],
};

// ── Helpers ──
function setFill(pdf: jsPDF, c: [number, number, number]): void {
  pdf.setFillColor(c[0], c[1], c[2]);
}
function setText(pdf: jsPDF, c: [number, number, number]): void {
  pdf.setTextColor(c[0], c[1], c[2]);
}
function setDraw(pdf: jsPDF, c: [number, number, number]): void {
  pdf.setDrawColor(c[0], c[1], c[2]);
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}
function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

async function imageToDataURL(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

function drawWatermark(pdf: jsPDF, logoPng: string): void {
  if (!logoPng) return;
  const wmSize = 110;
  const cx = PAGE_W / 2 - wmSize / 2;
  const cy = PAGE_H / 2 - wmSize / 2;
  pdf.saveGraphicsState();
  try {
    const gs = (pdf as unknown as { GState: new (o: { opacity: number }) => unknown }).GState;
    pdf.setGState(new gs({ opacity: 0.035 }));
  } catch {
    pdf.restoreGraphicsState();
    return;
  }
  pdf.addImage(logoPng, 'PNG', cx, cy, wmSize, wmSize);
  pdf.restoreGraphicsState();
}

function drawGradientBar(pdf: jsPDF, y: number, h: number): void {
  const strips = 60;
  const stripH = h / strips;
  for (let i = 0; i < strips; i++) {
    setFill(pdf, lerpColor(C.primaryDark, C.primary, i / strips));
    pdf.rect(0, y + i * stripH, PAGE_W, stripH + 0.5, 'F');
  }
}

// ── Identity Card (compact premium header) ──
function drawIdentityCard(pdf: jsPDF, y: number, data: PDFData, logoPng: string): number {
  const headerH = 24;
  const bodyH = 16;
  const totalH = headerH + bodyH;

  // Outer rounded card
  setFill(pdf, C.primary);
  pdf.roundedRect(M, y, CONTENT_W, totalH, CARD_R, CARD_R, 'F');

  // Gradient header
  drawGradientBar(pdf, y, headerH);

  // Make bottom of header square
  setFill(pdf, lerpColor(C.primaryDark, C.primary, 1));
  pdf.rect(M, y + headerH - 2, CONTENT_W, 2, 'F');

  // Logo
  if (logoPng) {
    pdf.addImage(logoPng, 'PNG', M + 4, y + 4, 12, 12);
  }

  // College name + location + title
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('PRARTHANA PU SCIENCE COLLEGE', M + 19, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Bagalkot, Karnataka  •  Estd. 2015', M + 19, y + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('ADMISSION ACKNOWLEDGEMENT', M + 19, y + 17);

  // QR code (top right)
  const qrSize = 16;
  const qrX = M + CONTENT_W - qrSize - 4;
  const qrY = y + 3;
  if (data.qrDataUrl) {
    setFill(pdf, C.white);
    pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, 'F');
    pdf.addImage(data.qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  // ── Body section (white) ──
  const bodyY = y + headerH;
  setFill(pdf, C.primaryUltra);
  pdf.rect(M, bodyY, CONTENT_W, bodyH, 'F');
  // Round only bottom corners
  setFill(pdf, C.primaryUltra);
  pdf.roundedRect(M, bodyY, CONTENT_W, bodyH, CARD_R, CARD_R, 'F');

  setDraw(pdf, C.primaryLight);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(M, y, CONTENT_W, totalH, CARD_R, CARD_R, 'S');

  // Photo (left)
  const photoW = 14;
  const photoH = 12;
  const photoX = M + 4;
  const photoY = bodyY + (bodyH - photoH) / 2;

  setFill(pdf, C.white);
  setDraw(pdf, C.primary);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(photoX - 0.5, photoY - 0.5, photoW + 1, photoH + 1, 1, 1, 'FD');

  if (data.formData?.photoDataUrl) {
    try {
      pdf.addImage(data.formData.photoDataUrl, 'JPEG', photoX, photoY, photoW, photoH);
    } catch {
      setFill(pdf, C.gray100);
      pdf.roundedRect(photoX, photoY, photoW, photoH, 1, 1, 'F');
      setText(pdf, C.gray400);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5);
      pdf.text('No Photo', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
    }
  } else {
    setFill(pdf, C.gray100);
    pdf.roundedRect(photoX, photoY, photoW, photoH, 1, 1, 'F');
    setText(pdf, C.gray400);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5);
    pdf.text('No Photo', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  }

  // Three info columns
  const colStartX = photoX + photoW + 5;
  const colW = (CONTENT_W - (photoW + 10) - 4) / 3;

  const cols = [
    { label: 'APPLICATION ID', value: data.applicationId || 'N/A' },
    { label: 'REFERENCE CODE', value: data.referenceCode || 'N/A' },
    { label: 'ADMISSION SESSION', value: ADMISSION_SESSION },
  ];

  cols.forEach((col, i) => {
    const cx = colStartX + i * colW;
    setText(pdf, C.gray500);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.text(col.label, cx, bodyY + 5);

    setText(pdf, C.primaryDark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(col.value, cx, bodyY + 10);
  });

  // Status badge (right side of body)
  const statusLabel = (data.status || 'Submitted').toLowerCase();
  let stColor = C.green,
    stLight = C.greenLight,
    stDark = C.greenDark,
    stText = 'Submitted';

  if (statusLabel.includes('review')) {
    stColor = C.amber;
    stLight = C.amberLight;
    stDark = C.amberDark;
    stText = 'Under Review';
  } else if (statusLabel.includes('verif')) {
    stColor = C.blue;
    stLight = C.blueLight;
    stDark = C.blueDark;
    stText = 'Verified';
  } else if (statusLabel.includes('approv')) {
    stColor = C.purple;
    stLight = C.purpleLight;
    stDark = C.purpleDark;
    stText = 'Approved';
  }

  const badgeW = 22;
  const badgeH = 6;
  const badgeX = M + CONTENT_W - badgeW - 4;
  const badgeY = bodyY + (bodyH - badgeH) / 2;

  setFill(pdf, stLight);
  pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
  setFill(pdf, stColor);
  pdf.circle(badgeX + 2, badgeY + badgeH / 2, 0.9, 'F');

  setText(pdf, stDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6);
  pdf.text(stText.toUpperCase(), badgeX + 4, badgeY + badgeH / 2 + 0.2, { baseline: 'middle' });

  return y + totalH + SECTION_GAP;
}

// ── Section Title Bar ──
function drawTitleBar(pdf: jsPDF, title: string, y: number): number {
  setFill(pdf, C.primary50);
  pdf.roundedRect(M, y, CONTENT_W, TITLE_H, 1.5, 1.5, 'F');
  setFill(pdf, C.primary);
  pdf.roundedRect(M, y, 1.5, TITLE_H, 0.8, 0.8, 'F');

  setText(pdf, C.primaryDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(title.toUpperCase(), M + 5, y + 4.5);

  return y + TITLE_H + 0.5;
}

// ── Info Table (2-column grid with separator lines) ──
interface InfoItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

function drawInfoTable(pdf: jsPDF, title: string, y: number, items: InfoItem[]): number {
  y = drawTitleBar(pdf, title, y);

  const fullItems = items.filter((i) => i.fullWidth);
  const normalItems = items.filter((i) => !i.fullWidth);
  const normalRows = Math.ceil(normalItems.length / 2);
  const totalRows = fullItems.length + normalRows;
  const cardH = totalRows * ROW_H + CARD_PAD * 2;

  // Card background
  setFill(pdf, C.white);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  const colW = CONTENT_W / 2;
  let currentRow = 0;

  // Full-width items first
  for (const item of fullItems) {
    const rowY = y + CARD_PAD + currentRow * ROW_H + 3.5;
    drawCell(pdf, M + CARD_PAD, rowY, CONTENT_W - CARD_PAD * 2, item);
    currentRow++;
    if (currentRow < totalRows) {
      setDraw(pdf, C.gray100);
      pdf.setLineWidth(0.15);
      pdf.line(M + 2, y + CARD_PAD + currentRow * ROW_H, M + CONTENT_W - 2, y + CARD_PAD + currentRow * ROW_H);
    }
  }

  // Normal 2-column items
  for (let i = 0; i < normalItems.length; i += 2) {
    const rowY = y + CARD_PAD + currentRow * ROW_H + 3.5;
    drawCell(pdf, M + CARD_PAD, rowY, colW - CARD_PAD, normalItems[i]);
    if (i + 1 < normalItems.length) {
      drawCell(pdf, M + colW + CARD_PAD, rowY, colW - CARD_PAD * 2, normalItems[i + 1]);
    }
    currentRow++;
    if (currentRow < totalRows) {
      setDraw(pdf, C.gray100);
      pdf.setLineWidth(0.15);
      pdf.line(M + 2, y + CARD_PAD + currentRow * ROW_H, M + CONTENT_W - 2, y + CARD_PAD + currentRow * ROW_H);
    }
  }

  return y + cardH + SECTION_GAP;
}

function drawCell(pdf: jsPDF, x: number, y: number, w: number, item: InfoItem): void {
  const labelW = Math.min(36, w * 0.45);

  // Label
  setText(pdf, C.gray500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(item.label.toUpperCase(), x, y);

  // Colon
  setText(pdf, C.gray400);
  pdf.setFontSize(7);
  pdf.text(':', x + labelW, y);

  // Value
  setText(pdf, C.gray900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  const valW = w - labelW - 3;
  const lines = pdf.splitTextToSize(item.value || 'Not Provided', valW);
  pdf.text(lines[0] || 'Not Provided', x + labelW + 3, y);
}

// ── Document Checklist (3 columns) ──
function drawDocumentChecklist(pdf: jsPDF, y: number, data: PDFData): number {
  const docs = [
    { label: 'Passport Photo', done: !!data.formData?.photoDataUrl },
    { label: 'Aadhaar Card', done: !!data.formData?.aadhaarNumber },
    { label: 'SSLC Marks Card', done: !!data.formData?.sslcMarks },
    { label: 'Transfer Certificate', done: false },
    { label: 'Income Certificate', done: false },
    { label: 'Caste Certificate', done: false },
  ];

  y = drawTitleBar(pdf, 'Document Checklist', y);

  const rows = Math.ceil(docs.length / 3);
  const cardH = rows * 5.5 + CARD_PAD * 2;

  setFill(pdf, C.white);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  const colW = CONTENT_W / 3;
  docs.forEach((doc, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + CARD_PAD + col * colW;
    const rowY = y + CARD_PAD + row * 5.5 + 4;

    // Check icon
    if (doc.done) {
      setFill(pdf, C.green);
      pdf.roundedRect(x, rowY - 2.5, 2.5, 2.5, 0.5, 0.5, 'F');
      setText(pdf, C.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.5);
      pdf.text('✓', x + 1.25, rowY - 0.6, { align: 'center' });
    } else {
      setFill(pdf, C.white);
      setDraw(pdf, C.gray300);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(x, rowY - 2.5, 2.5, 2.5, 0.5, 0.5, 'S');
    }

    setText(pdf, doc.done ? C.gray900 : C.gray500);
    pdf.setFont('helvetica', doc.done ? 'bold' : 'normal');
    pdf.setFontSize(7.5);
    pdf.text(doc.label, x + 4, rowY);
  });

  // Completion bar
  const doneCount = docs.filter((d) => d.done).length;
  const pct = Math.round((doneCount / docs.length) * 100);
  const barY = y + cardH - 2;

  setText(pdf, C.gray500);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6);
  pdf.text(`${pct}% COMPLETE`, M + CARD_PAD, barY);

  const pbX = M + 30;
  const pbW = CONTENT_W - 36;
  setFill(pdf, C.gray200);
  pdf.roundedRect(pbX, barY - 2, pbW, 1.5, 0.7, 0.7, 'F');
  setFill(pdf, C.primary);
  pdf.roundedRect(pbX, barY - 2, pbW * (pct / 100), 1.5, 0.7, 0.7, 'F');

  return y + cardH + SECTION_GAP;
}

// ── Compact Horizontal Timeline ──
function drawTimeline(pdf: jsPDF, y: number): number {
  const steps = [
    { label: 'Submitted', state: 'done' },
    { label: 'Under Review', state: 'current' },
    { label: 'Verification', state: 'pending' },
    { label: 'Fee Payment', state: 'pending' },
    { label: 'Approved', state: 'pending' },
  ];

  y = drawTitleBar(pdf, 'Admission Timeline', y);

  const cardH = 12;
  setFill(pdf, C.white);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  const stepW = CONTENT_W / steps.length;
  const lineY = y + 6;

  steps.forEach((step, i) => {
    const cx = M + stepW * i + stepW / 2;

    // Connector
    if (i < steps.length - 1) {
      const nextCx = M + stepW * (i + 1) + stepW / 2;
      setDraw(pdf, step.state === 'done' ? C.green : C.gray300);
      pdf.setLineWidth(step.state === 'done' ? 0.6 : 0.3);
      pdf.line(cx + 2, lineY, nextCx - 2, lineY);
    }

    // Circle
    if (step.state === 'done') {
      setFill(pdf, C.green);
      pdf.circle(cx, lineY, 2, 'F');
      setText(pdf, C.white);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.text('✓', cx, lineY + 0.4, { align: 'center' });
    } else if (step.state === 'current') {
      setFill(pdf, C.amberLight);
      pdf.circle(cx, lineY, 2.5, 'F');
      setFill(pdf, C.amber);
      pdf.circle(cx, lineY, 2, 'F');
      setFill(pdf, C.white);
      pdf.circle(cx, lineY, 0.8, 'F');
    } else {
      setFill(pdf, C.white);
      setDraw(pdf, C.gray300);
      pdf.setLineWidth(0.3);
      pdf.circle(cx, lineY, 2, 'S');
    }

    // Label
    setText(
      pdf,
      step.state === 'done' ? C.gray900 : step.state === 'current' ? C.amberDark : C.gray500
    );
    pdf.setFont('helvetica', step.state !== 'pending' ? 'bold' : 'normal');
    pdf.setFontSize(7);
    pdf.text(step.label, cx, lineY + 4.5, { align: 'center' });
  });

  return y + cardH + SECTION_GAP;
}

// ── Office Use (compact table) ──
function drawOfficeUse(pdf: jsPDF, y: number, data: PDFData): number {
  const items: InfoItem[] = [
    { label: 'Admission No', value: '— Pending —' },
    { label: 'Student ID', value: '— Pending —' },
    { label: 'Batch', value: data.formData?.preferredBatch || '— Pending —' },
    { label: 'Section', value: '— Pending —' },
    { label: 'Verified By', value: '— Pending —' },
    { label: 'Remarks', value: '— Pending —' },
  ];
  return drawInfoTable(pdf, 'Office Use Only', y, items);
}

// ── Digital Verification (slim green strip) ──
function drawDigitalVerification(pdf: jsPDF, y: number): number {
  const stripH = 8;
  setFill(pdf, C.greenLight);
  pdf.roundedRect(M, y, CONTENT_W, stripH, CARD_R, CARD_R, 'F');
  setFill(pdf, C.green);
  pdf.roundedRect(M, y, 1.5, stripH, 0.8, 0.8, 'F');

  const items = ['Digitally Generated', 'ERP Verified', 'QR Secured'];
  const itemW = CONTENT_W / 3;

  items.forEach((item, i) => {
    const x = M + 5 + i * itemW;
    const cy = y + stripH / 2;

    setFill(pdf, C.green);
    pdf.circle(x + 1.5, cy, 1.3, 'F');
    setText(pdf, C.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.text('✓', x + 1.5, cy + 0.3, { align: 'center' });

    setText(pdf, C.greenDark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(item, x + 4, cy + 0.3, { baseline: 'middle' });
  });

  return y + stripH + SECTION_GAP;
}

// ── Notice (compact yellow card) ──
function drawNotice(pdf: jsPDF, y: number): number {
  const lines = [
    'This acknowledgement confirms receipt of your online application.',
    'Carry this document during document verification.',
    'Final admission is subject to eligibility verification and fee payment.',
  ];

  const lineH = 3.8;
  const cardH = lines.length * lineH + 5;

  setFill(pdf, C.amberLight);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'F');
  setFill(pdf, C.amber);
  pdf.roundedRect(M, y, 1.5, cardH, 0.8, 0.8, 'F');

  // Icon
  setFill(pdf, C.amber);
  pdf.circle(M + 5, y + 4, 1.8, 'F');
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text('!', M + 5, y + 5, { align: 'center' });

  setText(pdf, C.amberDark);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('Important Notice', M + 9, y + 4.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  lines.forEach((line, i) => {
    const ly = y + 8.5 + i * lineH;
    setFill(pdf, C.amber);
    pdf.circle(M + 5, ly - 0.8, 0.5, 'F');
    pdf.text(line, M + 8, ly);
  });

  return y + cardH + SECTION_GAP;
}

// ── Signatures (single row, page 2 only) ──
function drawSignatures(pdf: jsPDF, y: number): number {
  const cardH = 20;
  setFill(pdf, C.gray50);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  const sigW = CONTENT_W / 3;
  const labels = ['Admission Officer', 'Principal', 'College Seal'];

  labels.forEach((label, i) => {
    const cx = M + i * sigW + sigW / 2;

    if (label === 'College Seal') {
      setDraw(pdf, C.primaryLight);
      pdf.setLineWidth(0.4);
      pdf.circle(cx, y + 9, 5.5, 'S');
      setDraw(pdf, C.primary);
      pdf.setLineWidth(0.3);
      pdf.circle(cx, y + 9, 4, 'S');
      setText(pdf, C.primary);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(4);
      pdf.text('PPSC', cx, y + 8, { align: 'center' });
      pdf.text('BAGALKOT', cx, y + 10.5, { align: 'center' });
    } else {
      setDraw(pdf, C.gray400);
      pdf.setLineWidth(0.3);
      pdf.setLineDashPattern([1.5, 1.5], 0);
      pdf.line(cx - 18, y + 11, cx + 18, y + 11);
      pdf.setLineDashPattern([], 0);
    }

    setText(pdf, C.gray700);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(label, cx, y + 16, { align: 'center' });
  });

  return y + cardH + SECTION_GAP;
}

// ── Footer (once per page) ──
function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number): void {
  const fy = PAGE_H - 12;
  setFill(pdf, C.gray50);
  pdf.rect(0, fy, PAGE_W, 12, 'F');
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.3);
  pdf.line(0, fy, PAGE_W, fy);

  setText(pdf, C.gray500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  const genDate = new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });
  pdf.text(
    `${siteConfig.shortName}  |  ${siteConfig.url}  |  ${siteConfig.phoneDisplay}  |  Generated: ${genDate}  |  Page ${pageNum} of ${totalPages}`,
    PAGE_W / 2,
    fy + 7,
    { align: 'center' }
  );
}

// ── Public API ──
export interface PDFData {
  applicationId: string;
  referenceCode: string;
  submittedAt: string;
  status: string;
  formData: AdmissionFormData;
  qrDataUrl: string;
}

export async function generatePremiumPDF(data: PDFData): Promise<void> {
  const pdf = await buildPremiumPDF(data);
  pdf.save(`Admission-Acknowledgement-${data.applicationId}.pdf`);
}

export async function generatePremiumPDFBlob(data: PDFData): Promise<Blob> {
  const pdf = await buildPremiumPDF(data);
  return pdf.output('blob');
}

async function buildPremiumPDF(data: PDFData): Promise<jsPDF> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  let logoPng = '';
  try {
    logoPng = await imageToDataURL(siteConfig.logo);
  } catch {
    // logo failed to load – continue without it
  }

  // ════════ PAGE 1 ════════
  drawWatermark(pdf, logoPng);
  let y = TOP;

  // Identity card
  y = drawIdentityCard(pdf, y, data, logoPng);

  // Personal Information
  y = drawInfoTable(pdf, 'Personal Information', y, [
    { label: 'Student Name', value: data.formData?.studentName || 'Not Provided' },
    { label: 'Father Name', value: data.formData?.fatherName || 'Not Provided' },
    { label: 'Mother Name', value: data.formData?.motherName || 'Not Provided' },
    { label: 'Date of Birth', value: data.formData?.dateOfBirth || 'Not Provided' },
    { label: 'Gender', value: data.formData?.gender || 'Not Provided' },
    { label: 'Mobile Number', value: data.formData?.mobileNumber || 'Not Provided' },
    { label: 'Email', value: data.formData?.email || 'Not Provided' },
    { label: 'Nationality', value: data.formData?.nationality || 'Not Provided' },
    { label: 'Mother Tongue', value: data.formData?.motherTongue || 'Not Provided' },
    { label: 'Blood Group', value: data.formData?.bloodGroup || 'Not Provided' },
  ]);

  // Academic Information
  y = drawInfoTable(pdf, 'Academic Information', y, [
    { label: 'Course Applied', value: data.formData?.courseInterested || 'Not Provided' },
    { label: 'Preferred Batch', value: data.formData?.preferredBatch || 'Not Provided' },
    { label: 'Previous School', value: data.formData?.previousSchool || 'Not Provided' },
    { label: 'SSLC Board', value: data.formData?.sslcBoard || 'Not Provided' },
    { label: 'SSLC Marks / %', value: data.formData?.sslcMarks || 'Not Provided' },
    { label: 'Passing Year', value: data.formData?.passingYear || 'Not Provided' },
    { label: 'Medium of Instruction', value: data.formData?.mediumOfInstruction || 'Not Provided' },
    { label: 'School Address', value: data.formData?.previousSchoolAddress || 'Not Provided' },
  ]);

  // Parent Information
  y = drawInfoTable(pdf, 'Parent Information', y, [
    { label: "Parent's Occupation", value: data.formData?.parentOccupation || 'Not Provided' },
    { label: 'Parent Mobile', value: data.formData?.parentMobile || 'Not Provided' },
    { label: 'Emergency Contact', value: data.formData?.emergencyContact || 'Not Provided' },
    { label: 'Parent Email', value: data.formData?.parentEmail || 'Not Provided' },
    { label: 'Admission Source', value: data.formData?.admissionSource || 'Not Provided' },
    { label: 'Annual Family Income', value: data.formData?.annualFamilyIncome || 'Not Provided' },
  ]);

  // Address Information
  y = drawInfoTable(pdf, 'Address Information', y, [
    { label: 'Full Address', value: data.formData?.address || 'Not Provided', fullWidth: true },
    { label: 'City', value: data.formData?.city || 'Not Provided' },
    { label: 'District', value: data.formData?.district || 'Not Provided' },
    { label: 'State', value: data.formData?.state || 'Not Provided' },
    { label: 'PIN Code', value: data.formData?.pinCode || 'Not Provided' },
  ]);

  // Additional Information
  y = drawInfoTable(pdf, 'Additional Information', y, [
    { label: 'Religion', value: data.formData?.religion || 'Not Provided' },
    { label: 'Caste', value: data.formData?.caste || 'Not Provided' },
    { label: 'Aadhaar Number', value: data.formData?.aadhaarNumber || 'Not Provided' },
    { label: 'Transport Required', value: data.formData?.transportRequired || 'No' },
    { label: 'Hostel Required', value: data.formData?.hostelRequired || 'No' },
    { label: 'Message', value: data.formData?.message || '-' },
  ]);

  // Document Checklist
  y = drawDocumentChecklist(pdf, y, data);

  drawFooter(pdf, 1, 2);

  // ════════ PAGE 2 ════════
  pdf.addPage();
  drawWatermark(pdf, logoPng);
  y = TOP;

  // Timeline
  y = drawTimeline(pdf, y);

  // Office Use
  y = drawOfficeUse(pdf, y, data);

  // Digital Verification
  y = drawDigitalVerification(pdf, y);

  // Notice
  y = drawNotice(pdf, y);

  // Signatures (page 2 only)
  y = drawSignatures(pdf, y);

  drawFooter(pdf, 2, 2);

  return pdf;
}

// ════════════════════════════════════════════════════════════
// RECEPTION PDF (INTERNAL COLLEGE RECORD DOSSIER)
// ════════════════════════════════════════════════════════════

export async function generateReceptionPDFBlob(data: PDFData): Promise<Blob> {
  const pdf = await buildReceptionPDF(data);
  return pdf.output('blob');
}

export async function generateReceptionPDF(data: PDFData): Promise<void> {
  const pdf = await buildReceptionPDF(data);
  pdf.save(`Reception-Dossier-${data.applicationId}.pdf`);
}

export async function buildReceptionPDF(data: PDFData): Promise<jsPDF> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  let logoPng = '';
  try {
    logoPng = await imageToDataURL(siteConfig.logo);
  } catch {
    // logo failed to load – continue without it
  }

  // ════════ PAGE 1 ════════
  drawWatermark(pdf, logoPng);
  let y = TOP;

  // Header Banner
  y = drawReceptionHeaderBanner(pdf, y, data, logoPng);

  // Personal Info
  y = drawInfoTable(pdf, 'Student Personal Details', y, [
    { label: 'Student Name', value: data.formData?.studentName || 'Not Provided' },
    { label: 'Father Name', value: data.formData?.fatherName || 'Not Provided' },
    { label: 'Mother Name', value: data.formData?.motherName || 'Not Provided' },
    { label: 'Date of Birth', value: data.formData?.dateOfBirth || 'Not Provided' },
    { label: 'Gender', value: data.formData?.gender || 'Not Provided' },
    { label: 'Blood Group', value: data.formData?.bloodGroup || 'Not Provided' },
    { label: 'Nationality', value: data.formData?.nationality || 'Not Provided' },
    { label: 'Mother Tongue', value: data.formData?.motherTongue || 'Not Provided' },
    { label: 'Aadhaar Number', value: data.formData?.aadhaarNumber || 'Not Provided' },
    { label: 'Student Mobile', value: data.formData?.mobileNumber || 'Not Provided' },
    { label: 'Student Email', value: data.formData?.email || 'Not Provided' },
    { label: 'Emergency Contact', value: data.formData?.emergencyContact || 'Not Provided' },
  ]);

  // Academic Details
  y = drawInfoTable(pdf, 'Academic Details', y, [
    { label: 'Course Applied', value: data.formData?.courseInterested || 'Not Provided' },
    { label: 'Preferred Batch', value: data.formData?.preferredBatch || 'Not Provided' },
    { label: 'Previous School', value: data.formData?.previousSchool || 'Not Provided' },
    { label: 'SSLC Board', value: data.formData?.sslcBoard || 'Not Provided' },
    { label: 'SSLC Marks / %', value: data.formData?.sslcMarks || 'Not Provided' },
    { label: 'Passing Year', value: data.formData?.passingYear || 'Not Provided' },
    { label: 'Medium of Instruction', value: data.formData?.mediumOfInstruction || 'Not Provided' },
    { label: 'School Address', value: data.formData?.previousSchoolAddress || 'Not Provided' },
  ]);

  // Parent & Guardian Details
  y = drawInfoTable(pdf, 'Parent & Guardian Details', y, [
    { label: "Parent's Occupation", value: data.formData?.parentOccupation || 'Not Provided' },
    { label: 'Parent Mobile', value: data.formData?.parentMobile || 'Not Provided' },
    { label: 'Alternate Mobile', value: data.formData?.alternateMobile || 'Not Provided' },
    { label: 'Parent Email', value: data.formData?.parentEmail || 'Not Provided' },
    { label: 'Annual Family Income', value: data.formData?.annualFamilyIncome || 'Not Provided' },
    { label: 'Admission Source', value: data.formData?.admissionSource || 'Not Provided' },
  ]);

  // Address Details
  y = drawInfoTable(pdf, 'Address & Facilities Details', y, [
    { label: 'Full Address', value: data.formData?.address || 'Not Provided', fullWidth: true },
    { label: 'City', value: data.formData?.city || 'Not Provided' },
    { label: 'District', value: data.formData?.district || 'Not Provided' },
    { label: 'State', value: data.formData?.state || 'Not Provided' },
    { label: 'PIN Code', value: data.formData?.pinCode || 'Not Provided' },
    { label: 'Transport Required', value: data.formData?.transportRequired || 'No' },
    { label: 'Hostel Required', value: data.formData?.hostelRequired || 'No' },
  ]);

  drawFooter(pdf, 1, 2);

  // ════════ PAGE 2 ════════
  pdf.addPage();
  drawWatermark(pdf, logoPng);
  y = TOP;

  // Additional Information
  y = drawInfoTable(pdf, 'Additional Information', y, [
    { label: 'Religion', value: data.formData?.religion || 'Not Provided' },
    { label: 'Caste', value: data.formData?.caste || 'Not Provided' },
    { label: 'Aadhaar Number', value: data.formData?.aadhaarNumber || 'Not Provided' },
    { label: 'Message', value: data.formData?.message || '-' },
  ]);

  // Office Verification Section
  y = drawReceptionOfficeVerification(pdf, y);

  // Fee & Scholarship Section
  y = drawReceptionFeeSection(pdf, y);

  // Remarks & Signatures
  y = drawReceptionRemarksAndSignatures(pdf, y);

  drawFooter(pdf, 2, 2);

  return pdf;
}

function drawReceptionHeaderBanner(pdf: jsPDF, y: number, data: PDFData, logoPng: string): number {
  const cardH = 34;
  setFill(pdf, C.primaryDark);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'F');

  // Logo
  if (logoPng) {
    try {
      pdf.addImage(logoPng, 'PNG', M + 3, y + 3, 14, 14);
    } catch {
      /* ignore */
    }
  }

  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('PRARTHANA PU SCIENCE COLLEGE', M + 20, y + 8);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  setText(pdf, C.primaryLight);
  pdf.text('Bagalkot, Karnataka - 587101  |  Integrated Science & Competitive Coaching', M + 20, y + 13);

  // Internal Record Badge
  setFill(pdf, C.purpleDark);
  pdf.roundedRect(M + 20, y + 16, 75, 5, 1, 1, 'F');
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.text('RECEPTION REGISTER DOSSIER  (INTERNAL COLLEGE RECORD ONLY)', M + 22, y + 19.5);

  // Reference Code & IDs Block
  const idX = M + 105;
  setText(pdf, C.white);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Application ID: ${data.applicationId}`, idX, y + 8);
  pdf.text(`Reference Code: ${data.referenceCode}`, idX, y + 13);

  setText(pdf, C.primaryLight);
  pdf.text('Admission Number: [                                ]', idX, y + 18);
  pdf.text(`Date: ${new Date(data.submittedAt || Date.now()).toLocaleDateString('en-IN')}`, idX, y + 23);

  // QR Code if available
  if (data.qrDataUrl) {
    try {
      pdf.addImage(data.qrDataUrl, 'PNG', PAGE_W - M - 22, y + 3, 19, 19);
    } catch {
      /* ignore */
    }
  }

  return y + cardH + SECTION_GAP;
}

function drawReceptionOfficeVerification(pdf: jsPDF, y: number): number {
  const cardH = 48;
  setFill(pdf, C.gray50);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  // Title
  setFill(pdf, C.primaryDark);
  pdf.roundedRect(M, y, CONTENT_W, TITLE_H, CARD_R, CARD_R, 'F');
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('Office Verification & Document Checklist', M + CARD_PAD, y + 4.5);

  let ry = y + TITLE_H + 3;
  const docs = [
    '1. SSLC / 10th Standard Marks Card',
    '2. Transfer Certificate (TC)',
    '3. Study & Conduct Certificate',
    '4. Student Aadhaar Card Copy',
    '5. Caste & Category Certificate',
    '6. Income Certificate',
    '7. Passport Size Photos (4 Copies)',
  ];

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');

  docs.forEach((doc) => {
    setText(pdf, C.gray900);
    pdf.text(doc, M + 4, ry);

    setDraw(pdf, C.gray400);
    pdf.rect(M + 75, ry - 3, 3, 3);
    setText(pdf, C.gray700);
    pdf.text('Original Verified', M + 80, ry);

    pdf.rect(M + 110, ry - 3, 3, 3);
    pdf.text('Xerox Attached', M + 115, ry);

    setText(pdf, C.gray500);
    pdf.text('Sign: ____________', M + 150, ry);

    ry += 5.5;
  });

  return y + cardH + SECTION_GAP;
}

function drawReceptionFeeSection(pdf: jsPDF, y: number): number {
  const cardH = 34;
  setFill(pdf, C.gray50);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  // Title
  setFill(pdf, C.primaryDark);
  pdf.roundedRect(M, y, CONTENT_W, TITLE_H, CARD_R, CARD_R, 'F');
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('Fee & Scholarship Structure Approval', M + CARD_PAD, y + 4.5);

  let ry = y + TITLE_H + 4;
  setText(pdf, C.gray900);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  pdf.text('Total Approved Fee: ₹ ____________________', M + 4, ry);
  pdf.text('Concession / Scholarship: ₹ ____________________', M + 95, ry);

  ry += 6;
  pdf.text(
    'Scholarship Category / Reason: ____________________________________________________________________',
    M + 4,
    ry
  );

  ry += 6;
  pdf.text('Net Payable Fee: ₹ ____________________', M + 4, ry);
  pdf.text('First Installment Paid: ₹ ____________________', M + 95, ry);

  ry += 6;
  pdf.text('Receipt Number: ________________________', M + 4, ry);
  pdf.text('Payment Mode:  [  ] Cash   [  ] UPI/Online   [  ] Cheque/DD', M + 95, ry);

  return y + cardH + SECTION_GAP;
}

function drawReceptionRemarksAndSignatures(pdf: jsPDF, y: number): number {
  const cardH = 50;
  setFill(pdf, C.gray50);
  setDraw(pdf, C.gray200);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(M, y, CONTENT_W, cardH, CARD_R, CARD_R, 'FD');

  // Title
  setFill(pdf, C.primaryDark);
  pdf.roundedRect(M, y, CONTENT_W, TITLE_H, CARD_R, CARD_R, 'F');
  setText(pdf, C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text('Reception Remarks & Final Approval Signatures', M + CARD_PAD, y + 4.5);

  let ry = y + TITLE_H + 5;
  setText(pdf, C.gray900);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  pdf.text(
    'Reception Remarks: _____________________________________________________________________________________',
    M + 4,
    ry
  );
  ry += 6;
  pdf.text(
    'Counsellor Remarks: ____________________________________________________________________________________',
    M + 4,
    ry
  );
  ry += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text(
    'Admission Decision:   [  ] ADMITTED      [  ] PROVISIONAL      [  ] UNDER REVIEW      [  ] REJECTED',
    M + 4,
    ry
  );

  // Signatures Row
  ry += 14;
  const sigW = CONTENT_W / 4;
  const sigLabels = ['Student Signature', 'Parent Signature', 'Reception Officer', 'Principal Approval'];

  sigLabels.forEach((label, i) => {
    const cx = M + i * sigW + sigW / 2;
    setDraw(pdf, C.gray400);
    pdf.setLineWidth(0.3);
    pdf.setLineDashPattern([1.5, 1.5], 0);
    pdf.line(cx - 15, ry, cx + 15, ry);
    pdf.setLineDashPattern([], 0);

    setText(pdf, C.gray700);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text(label, cx, ry + 4, { align: 'center' });
  });

  return y + cardH + SECTION_GAP;
}