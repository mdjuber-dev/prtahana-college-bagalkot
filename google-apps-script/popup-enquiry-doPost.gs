const SPREADSHEET_ID = "1mQ9eQI0UlTwOQY9VS763_mFpgro9XtoI4Lf-ViEnim0";
const SHEET_NAME = "Admission Enquiries";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse(false, "No data received");
    }

    const data = JSON.parse(e.postData.contents);

    const studentName = String(data.studentName || "").trim();
    const mobileNumber = String(data.mobileNumber || "").trim();
    const courseInterested = String(data.courseInterested || "").trim();

    if (!studentName || !mobileNumber || !courseInterested) {
      return jsonResponse(false, "All fields are required");
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return jsonResponse(false, "Invalid mobile number");
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse(false, `Sheet "${SHEET_NAME}" not found`);
    }

    sheet.appendRow([
      new Date(),
      studentName,
      mobileNumber,
      courseInterested,
    ]);

    return jsonResponse(true, "Enquiry submitted successfully");

  } catch (error) {
    console.error(error);
    return jsonResponse(false, error.message || String(error));
  }
}

function doGet() {
  return jsonResponse(true, "Enquiry API is working");
}

function jsonResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success,
      message,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
