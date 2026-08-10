import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  studentName: string;
  applicationId: string;
  referenceCode: string;
  courseInterested: string;
  mobileNumber: string;
  submittedAt: string;
  status: string;
  email: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(iso: string): string {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// ── Student confirmation email template ──
function studentEmailHtml(d: EmailPayload): string {
  const status = d.status || "Submitted";
  const statusColor = status.toLowerCase().includes("review")
    ? "#d97706"
    : status.toLowerCase().includes("verif")
      ? "#2563eb"
      : "#16a34a";
  const statusBg = status.toLowerCase().includes("review")
    ? "#fef3c7"
    : status.toLowerCase().includes("verif")
      ? "#dbeafe"
      : "#dcfce7";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admission Confirmation - Prarthana PU Science College</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;min-height:100vh;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:32px 24px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;background:#ffffff;border-radius:14px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#1e3a8a;line-height:56px;">P</div>
                    <h1 style="color:#ffffff;margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:0.5px;">Prarthana PU Science College</h1>
                    <p style="color:#bfdbfe;margin:0;font-size:13px;">Bagalkot, Karnataka &nbsp;|&nbsp; Estd. 2015</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#1e3a8a;margin:0 0 8px;font-size:20px;font-weight:700;">Thank You, ${escapeHtml(d.studentName)}!</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your admission application has been successfully received. We appreciate your interest in joining Prarthana PU Science College. Below is your application summary for your records.
              </p>

              <!-- Status Badge -->
              <div style="text-align:center;margin:0 0 24px;">
                <span style="display:inline-block;background:${statusBg};color:${statusColor};padding:6px 20px;border-radius:20px;font-size:13px;font-weight:600;">${escapeHtml(status)}</span>
              </div>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;width:45%;">Application ID</td>
                  <td style="padding:12px 16px;color:#1e3a8a;font-size:14px;font-weight:700;border:1px solid #e2e8f0;">${escapeHtml(d.applicationId)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Reference Code</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;font-weight:600;border:1px solid #e2e8f0;">${escapeHtml(d.referenceCode)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Student Name</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${escapeHtml(d.studentName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Course Applied</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${escapeHtml(d.courseInterested)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Submission Date</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${formatDateTime(d.submittedAt)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Admission Status</td>
                  <td style="padding:12px 16px;border:1px solid #e2e8f0;">
                    <span style="background:${statusBg};color:${statusColor};padding:3px 12px;border-radius:12px;font-size:12px;font-weight:600;">${escapeHtml(status)}</span>
                  </td>
                </tr>
              </table>

              <!-- PDF Note -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:0 0 24px;">
                <p style="color:#1e40af;font-size:13px;margin:0;line-height:1.5;">
                  <strong>Admission Acknowledgement PDF</strong><br>
                  Your acknowledgement document is attached to this email. Please keep it safe — you will need it during document verification.
                </div>
              </div>

              <!-- Next Steps -->
              <h3 style="color:#1e3a8a;font-size:16px;font-weight:600;margin:0 0 12px;">What Happens Next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:4px 0;color:#475569;font-size:14px;line-height:1.6;">
                    <strong style="color:#2563eb;">1.</strong> Our admissions team will review your application.<br>
                    <strong style="color:#2563eb;">2.</strong> You will be contacted for document verification.<br>
                    <strong style="color:#2563eb;">3.</strong> Final admission is subject to eligibility and fee payment.
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:0 0 8px;">
                <h3 style="color:#1e3a8a;font-size:15px;font-weight:600;margin:0 0 10px;">Contact Us</h3>
                <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
                  <strong>Phone:</strong> +91 98765 43210<br>
                  <strong>Email:</strong> info@prarthanapusciencecollege.in<br>
                  <strong>Address:</strong> College Road, Bagalkot, Karnataka 587101<br>
                  <strong>Website:</strong> <a href="https://prarthanapusciencecollege.in" style="color:#2563eb;text-decoration:none;">prarthanapusciencecollege.in</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;padding:20px 24px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.5;">
                This is an automated confirmation email. Please do not reply directly.<br>
                &copy; 2026 Prarthana PU Science College, Bagalkot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── College notification email template ──
function collegeEmailHtml(d: EmailPayload, googleSheetUrl: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Admission Application</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;min-height:100vh;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:28px 24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0 0 4px;font-size:20px;font-weight:700;">New Admission Application</h1>
              <p style="color:#bfdbfe;margin:0;font-size:13px;">Prarthana PU Science College, Bagalkot</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px;">
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
                A new admission application has been submitted. Please review the details below in the Admin Dashboard.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px;">
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;width:40%;">Student Name</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;font-weight:700;border:1px solid #e2e8f0;">${escapeHtml(d.studentName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Course</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${escapeHtml(d.courseInterested)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Mobile Number</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${escapeHtml(d.mobileNumber)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Application ID</td>
                  <td style="padding:12px 16px;color:#1e3a8a;font-size:14px;font-weight:700;border:1px solid #e2e8f0;">${escapeHtml(d.applicationId)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Reference Code</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${escapeHtml(d.referenceCode)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-weight:600;color:#64748b;font-size:13px;border:1px solid #e2e8f0;">Submission Time</td>
                  <td style="padding:12px 16px;color:#1e293b;font-size:14px;border:1px solid #e2e8f0;">${formatDateTime(d.submittedAt)}</td>
                </tr>
              </table>

              ${googleSheetUrl ? `
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:0 0 20px;">
                <p style="color:#1e40af;font-size:13px;margin:0;">
                  <strong>Google Sheet:</strong> <a href="${escapeHtml(googleSheetUrl)}" style="color:#2563eb;text-decoration:none;">View in Google Sheets</a>
                </p>
              </div>` : ""}

              <div style="text-align:center;padding:12px 0;">
                <a href="https://prarthanapusciencecollege.in/admin" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">Open Admin Dashboard</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;padding:16px 24px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                Automated notification &mdash; Prarthana PU Science College Admission System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendViaResend(
  apiKey: string,
  from: string,
  to: string[],
  subject: string,
  html: string,
  replyTo: string,
  attachments?: Array<{ filename: string; content: string }>,
): Promise<{ success: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    from,
    to,
    subject,
    html,
    reply_to: replyTo,
  };
  if (attachments && attachments.length > 0) {
    body.attachments = attachments;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Resend API error (${res.status}): ${errText}` };
  }

  return { success: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json() as EmailPayload;
    const {
      studentName, applicationId, referenceCode, courseInterested,
      mobileNumber, submittedAt, status, email, pdfBase64, pdfFileName,
    } = body;

    if (!studentName || !applicationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: studentName, applicationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const COLLEGE_EMAIL = Deno.env.get("COLLEGE_EMAIL") || "admissions@prarthanapusciencecollege.in";
    const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "onboarding@resend.dev";
    const GOOGLE_SHEET_URL = Deno.env.get("GOOGLE_SHEET_URL") || null;

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured — skipping email notifications");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped — no API key", applicationId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = { student: false, college: false, studentError: "", collegeError: "" };

    // ── 1. Student confirmation email ──
    if (email) {
      const attachments = pdfBase64
        ? [{ filename: pdfFileName || `Admission-${applicationId}.pdf`, content: pdfBase64 }]
        : undefined;

      const studentResult = await sendViaResend(
        RESEND_API_KEY,
        SENDER_EMAIL,
        [email],
        `Admission Confirmation - ${applicationId} | Prarthana PU Science College`,
        studentEmailHtml({ studentName, applicationId, referenceCode, courseInterested, mobileNumber, submittedAt, status, email }),
        COLLEGE_EMAIL,
        attachments,
      );

      results.student = studentResult.success;
      results.studentError = studentResult.error || "";
      if (!studentResult.success) {
        console.error("Student email failed:", studentResult.error);
      }
    }

    // ── 2. College notification email ──
    const collegeResult = await sendViaResend(
      RESEND_API_KEY,
      SENDER_EMAIL,
      [COLLEGE_EMAIL],
      `New Admission Application - ${studentName} (${applicationId})`,
      collegeEmailHtml({ studentName, applicationId, referenceCode, courseInterested, mobileNumber, submittedAt, status, email }, GOOGLE_SHEET_URL),
      COLLEGE_EMAIL,
    );

    results.college = collegeResult.success;
    results.collegeError = collegeResult.error || "";
    if (!collegeResult.success) {
      console.error("College email failed:", collegeResult.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notifications processed",
        applicationId,
        studentEmailSent: results.student,
        collegeEmailSent: results.college,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
