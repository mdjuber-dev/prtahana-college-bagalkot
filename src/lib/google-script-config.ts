import { buildEnquirySheetRow, generateEnquiryId, type EnquiryFormData } from './admission-config';

/**
 * Google Apps Script Integration
 *
 * Official Web App URL Endpoint:
 * https://script.google.com/macros/s/AKfycbxC2mOQjfBASD4eBoFytQ01v2JXiN9xSwpeDNM1v3q4cmp2qFX-wPL8Wyu2yqt2W51PGA/exec
 */

export const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxC2mOQjfBASD4eBoFytQ01v2JXiN9xSwpeDNM1v3q4cmp2qFX-wPL8Wyu2yqt2W51PGA/exec";

// NEW: Separate Google Apps Script endpoint for home page popup enquiries.
// Replace the placeholder with the real /exec URL for the Enquiries sheet.
export const POPUP_GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxJTKB6Gi9sr7ZeY5sqOzxMcg2tQpri6pySVxxXl9LG5Iwq1fXDdgYQ-JeUfgb8aEC8/exec";

async function postPayloadToSheets(payload: Record<string, string>, overrideUrl?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const directUrl = overrideUrl ?? GOOGLE_APPS_SCRIPT_URL;
    const response = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resData = await response.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

    if (!resData || resData.success === false) {
      const msg = resData?.message || resData?.error || `Google Sheets request failed (HTTP ${response.status})`;
      console.error('[GS] Direct POST submission failed:', msg);
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (err) {
    console.error('[GS] Fetch error submitting to Google Sheets:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error. Failed to reach Google Sheets server.',
    };
  }
}

/**
 * Submits complete admission row data to Google Sheets.
 */
export async function submitToGoogleSheets(
  sheetRow: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  return postPayloadToSheets(sheetRow);
}

/**
 * Submit general enquiry to Google Sheets (Enquiries sheet) with a generated Enquiry ID.
 */
export async function submitEnquiryToGoogleSheets(enquiry: EnquiryFormData & { enquiryType?: string }): Promise<{ success: boolean; error?: string }> {
  const enquiryId = generateEnquiryId();
  const submittedAt = new Date().toISOString();
  const payload = buildEnquirySheetRow(
    {
      name: enquiry.name,
      mobile: enquiry.mobile,
      email: enquiry.email || '',
      course: enquiry.course || '',
      message: enquiry.message || '',
      enquiryType: enquiry.enquiryType,
    },
    enquiryId,
    submittedAt
  );
  return postPayloadToSheets(payload);
}

/**
 * Submit the home page popup enquiry to Google Sheets using the exact
 * shape required by the Apps Script endpoint:
 * { studentName, mobileNumber, courseInterested }
 */
export async function submitPopupEnquiryToGoogleSheets(payload: { studentName: string; mobileNumber: string; courseInterested: string }): Promise<{ success: boolean; error?: string }> {
  const url = POPUP_GOOGLE_APPS_SCRIPT_URL;
  if (!url || url.includes('[PASTE THE NEW ENQUIRY /exec URL HERE]')) {
    const msg = 'Popup Google Apps Script URL not configured';
    console.error('[GS][Popup] ', msg);
    return { success: false, error: msg };
  }

  return postPayloadToSheets(payload, url);
}
