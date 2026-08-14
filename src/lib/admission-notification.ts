import type { PDFData } from './pdf-generator';

/**
 * Email sending used to rely on a removed Edge Function. The admission flow
 * treats notifications as non-blocking, so keep this as a safe no-op until a
 * Neon/Express mail endpoint is configured with server-side mail credentials.
 */
export async function sendAdmissionEmailNotification(
  _pdfData: PDFData,
  _payload: {
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
  return Promise.resolve();
}
