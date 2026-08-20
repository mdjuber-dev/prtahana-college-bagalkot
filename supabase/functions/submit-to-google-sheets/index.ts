import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_SCRIPT_URL =
  Deno.env.get("GOOGLE_SCRIPT_URL") ??
  "https://script.google.com/macros/s/AKfycbxC2mOQjfBASD4eBoFytQ01v2JXiN9xSwpeDNM1v3q4cmp2qFX-wPL8Wyu2yqt2W51PGA/exec";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 15000;

interface SuccessResponse {
  success: true;
  status: number;
  timestamp: string;
  executionTime: number;
  duplicate?: boolean;
  data?: unknown;
}

interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  status: number;
  timestamp: string;
  executionTime: number;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function jsonResponse(body: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<body") ||
    trimmed.includes("google apps script")
  );
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGoogleScript(
  payload: Record<string, unknown>,
  googleScriptUrl: string,
): Promise<{ ok: boolean; data: unknown; status: number; raw?: string }> {
  let lastError: Error | null = null;
  let lastStatus = 0;
  let lastRaw = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[GoogleScript] Attempt ${attempt}/${MAX_RETRIES}`);
    console.log(`[GoogleScript] URL: ${googleScriptUrl}`);

    try {
      const response = await fetchWithTimeout(
        googleScriptUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        REQUEST_TIMEOUT_MS,
      );

      lastStatus = response.status;
      console.log(`[GoogleScript] HTTP Status: ${response.status}`);

      const rawText = await response.text();
      lastRaw = rawText;
      console.log(`[GoogleScript] Raw response length: ${rawText.length}`);

      // Detect HTML error pages (common when script is misconfigured / unauthorized)
      if (isHtmlResponse(rawText)) {
        console.error(
          `[GoogleScript] Received HTML instead of JSON (attempt ${attempt})`,
        );
        lastError = new Error(
          "Google Apps Script returned HTML instead of JSON. Check deployment permissions and URL.",
        );
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`[GoogleScript] Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        break;
      }

      let data: unknown;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error(
          `[GoogleScript] Failed to parse JSON (attempt ${attempt}):`,
          rawText.slice(0, 300),
        );
        lastError = new Error("Invalid JSON response from Google Apps Script");
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(delay);
          continue;
        }
        break;
      }

      console.log(`[GoogleScript] Parsed response:`, JSON.stringify(data));

      // Success path (even if Google returns success:false we still surface it)
      return {
        ok: response.ok,
        data,
        status: response.status,
        raw: rawText,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[GoogleScript] Network/timeout error (attempt ${attempt}):`, message);

      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error(
          `Request timed out after ${REQUEST_TIMEOUT_MS}ms`,
        );
      } else {
        lastError = err instanceof Error ? err : new Error(message);
      }

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[GoogleScript] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  return {
    ok: false,
    data: {
      success: false,
      message: lastError?.message ?? "Google Apps Script unavailable after retries",
      error: lastError?.message ?? "Unknown error",
    },
    status: lastStatus || 502,
    raw: lastRaw,
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log("========== submit-to-google-sheets ==========");
  console.log(`[Request] Method: ${req.method}`);
  console.log(`[Request] URL: ${req.url}`);
  console.log(`[Request] Timestamp: ${timestamp}`);

  // CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[CORS] Preflight handled");
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    console.warn(`[Request] Method not allowed: ${req.method}`);
    return jsonResponse(
      {
        success: false,
        message: "Method not allowed. Use POST.",
        error: "METHOD_NOT_ALLOWED",
        status: 405,
        timestamp,
        executionTime: Date.now() - startTime,
      },
      405,
    );
  }

  // Parse & validate payload
  let payload: Record<string, unknown>;
  try {
    const bodyText = await req.text();
    console.log(`[Payload] Raw body length: ${bodyText.length}`);

    if (!bodyText || bodyText.trim() === "") {
      console.warn("[Payload] Empty body received");
      return jsonResponse(
        {
          success: false,
          message: "Empty payload",
          error: "EMPTY_PAYLOAD",
          status: 400,
          timestamp,
          executionTime: Date.now() - startTime,
        },
        400,
      );
    }

    payload = JSON.parse(bodyText) as Record<string, unknown>;

    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      console.warn("[Payload] Invalid structure (not an object)");
      return jsonResponse(
        {
          success: false,
          message: "Payload must be a JSON object",
          error: "INVALID_PAYLOAD_STRUCTURE",
          status: 400,
          timestamp,
          executionTime: Date.now() - startTime,
        },
        400,
      );
    }

    if (Object.keys(payload).length === 0) {
      console.warn("[Payload] Empty object received");
      return jsonResponse(
        {
          success: false,
          message: "Payload object is empty",
          error: "EMPTY_PAYLOAD",
          status: 400,
          timestamp,
          executionTime: Date.now() - startTime,
        },
        400,
      );
    }

    console.log(`[Payload] Keys: ${Object.keys(payload).join(", ")}`);
    console.log(
      `[Payload] applicationId: ${payload.applicationId ?? payload.applicationID ?? "N/A"}`,
    );
  } catch (parseErr) {
    console.error("[Payload] JSON parse error:", parseErr);
    return jsonResponse(
      {
        success: false,
        message: "Invalid JSON in request body",
        error: parseErr instanceof Error ? parseErr.message : "PARSE_ERROR",
        status: 400,
        timestamp,
        executionTime: Date.now() - startTime,
      },
      400,
    );
  }

  // Determine target URL from payload or environment
  const targetGoogleScriptUrl =
    (payload.googleScriptUrl && typeof payload.googleScriptUrl === "string" && payload.googleScriptUrl.trim() !== "")
      ? payload.googleScriptUrl.trim()
      : GOOGLE_SCRIPT_URL;

  if (!targetGoogleScriptUrl || targetGoogleScriptUrl.trim() === "") {
    console.error("[Config] Google script URL is missing");
    return jsonResponse(
      {
        success: false,
        message: "Server misconfiguration: Google script URL is not set",
        error: "MISSING_GOOGLE_SCRIPT_URL",
        status: 500,
        timestamp,
        executionTime: Date.now() - startTime,
      },
      500,
    );
  }

  // Call Google Apps Script with retries
  try {
    const payloadToSend = { ...payload };
    if (typeof payloadToSend.googleScriptUrl !== 'undefined') {
      delete payloadToSend.googleScriptUrl;
    }

    const result = await callGoogleScript(payloadToSend, targetGoogleScriptUrl);
    const executionTime = Date.now() - startTime;

    console.log(`[Result] ok=${result.ok}, status=${result.status}, time=${executionTime}ms`);

    // Google returned a structured response
    if (result.data && typeof result.data === "object") {
      const gData = result.data as Record<string, unknown>;

      if (gData.success === true) {
        const responseBody: SuccessResponse = {
          success: true,
          status: result.status || 200,
          timestamp,
          executionTime,
        };
        if (gData.duplicate === true) {
          responseBody.duplicate = true;
        }
        if (gData.data !== undefined) {
          responseBody.data = gData.data;
        }
        console.log("[Success] Admission data submitted successfully");
        return jsonResponse(responseBody, 200);
      }

      // Google returned success: false
      console.error("[GoogleScript] Business failure:", gData.message || gData.error);
      return jsonResponse(
        {
          success: false,
          message: String(gData.message ?? "Google Sheets submission failed"),
          error: String(gData.error ?? gData.message ?? "GOOGLE_SCRIPT_ERROR"),
          status: result.status || 502,
          timestamp,
          executionTime,
        },
        200, // Still 200 so frontend can read the body cleanly
      );
    }

    // Unexpected shape
    console.error("[GoogleScript] Unexpected response shape");
    return jsonResponse(
      {
        success: false,
        message: "Unexpected response from Google Apps Script",
        error: "UNEXPECTED_RESPONSE",
        status: result.status || 502,
        timestamp,
        executionTime,
      },
      502,
    );
  } catch (err) {
    const executionTime = Date.now() - startTime;
    console.error("[Fatal] Unhandled error:", err);
    return jsonResponse(
      {
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "UNKNOWN_ERROR",
        status: 500,
        timestamp,
        executionTime,
      },
      500,
    );
  }
});