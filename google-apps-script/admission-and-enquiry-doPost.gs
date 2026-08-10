const SPREADSHEET_ID = '1mQ9eQI0UlTwOQY9VS763_mFpgro9XtoI4Lf-ViEnim0';
const SHEET_NAMES = {
  admission: 'Admissions',
  enquiry: 'Enquiries',
};

const ADMISSION_HEADERS = [
  'Timestamp',
  'applicationId',
  'referenceCode',
  'admissionSession',
  'studentName',
  'fatherName',
  'motherName',
  'dateOfBirth',
  'gender',
  'email',
  'mobileNumber',
  'alternateMobile',
  'parentMobile',
  'nationality',
  'motherTongue',
  'address',
  'city',
  'district',
  'state',
  'pinCode',
  'previousSchool',
  'previousSchoolAddress',
  'sslcMarks',
  'sslcBoard',
  'passingYear',
  'courseInterested',
  'mediumOfInstruction',
  'preferredBatch',
  'religion',
  'caste',
  'bloodGroup',
  'aadhaarNumber',
  'transportRequired',
  'hostelRequired',
  'parentOccupation',
  'parentEmail',
  'emergencyContact',
  'annualFamilyIncome',
  'admissionSource',
  'message',
  'photoDataUrl',
  'submittedAt',
  'status',
];

const ENQUIRY_HEADERS = [
  'Timestamp',
  'Enquiry ID',
  'Name',
  'Mobile Number',
  'Email',
  'Course Interested',
  'Message',
  'Enquiry Type',
  'Submitted At',
  'Source',
  'Status',
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST data received');
    }

    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('POST data must be a JSON object');
    }

    const sheetType = data.sheetType === 'enquiry' ? 'enquiry' : 'admission';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = SHEET_NAMES[sheetType];
    const requiredHeaders = sheetType === 'enquiry' ? ENQUIRY_HEADERS : ADMISSION_HEADERS;
    const sheet = getOrCreateSheet_(spreadsheet, sheetName);

    const headers = ensureHeaders_(sheet, requiredHeaders, data);
    const row = headers.map(function(header) {
      if (header === 'Timestamp') return new Date();
      if (header === 'sheetType') return '';
      return data[header] == null ? '' : data[header];
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: sheetType === 'enquiry'
          ? 'Enquiry submitted successfully'
          : 'Admission submitted successfully',
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: String(error),
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet, requiredHeaders, data) {
  const lastColumn = Math.max(sheet.getLastColumn(), requiredHeaders.length);
  const existing = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
    : [];

  const headers = existing.filter(function(header) {
    return header.trim() !== '';
  });

  requiredHeaders.forEach(function(header) {
    if (headers.indexOf(header) === -1) headers.push(header);
  });

  Object.keys(data).forEach(function(key) {
    if (key !== 'sheetType' && headers.indexOf(key) === -1) headers.push(key);
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return headers;
}
