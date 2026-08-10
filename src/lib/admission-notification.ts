import { supabase } from './supabase-config';
import { generatePremiumPDFBlob, type PDFData } from './pdf-generator';

/**
 * Generate the admission PDF, convert it to a base64 string, and send both
 * the student confirmation email and the college notification email via the
 * send-admission-email edge function. The edge function uses the Resend API
 * key configured in Supabase secrets.
 *
 * This is fire-and-forget: it never blocks the user's success flow. If email
 * sending fails, the admission submission still succeeds.
 */
export async function sendAdmissionEmailNotification(
  pdfData: PDFData,
  payload: {
    studentName: string;
    applicationId: string;
    referenceCode: string;
    courseInterested: string;
    mobileNumber: string;
    submittedAt: string;
    status: string;
    email: string;
  },
): Promise<void> {
  if (!supabase) return;

  try {
    const blob = await generatePremiumPDFBlob(pdfData);
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
    }
    const pdfBase64 = btoa(binary);

    await supabase.functions.invoke('send-admission-email', {
      body: {
        ...payload,
        pdfBase64,
        pdfFileName: `Admission-Acknowledgement-${payload.applicationId}.pdf`,
      },
    });
  } catch (err) {
    console.error('Email notification failed (non-blocking):', err);
  }
}
