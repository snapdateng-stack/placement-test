// ==================== SNAP DAT PLACEMENT TEST - GOOGLE APPS SCRIPT ====================
//
// ⚠️  THIS FILE IS NOW OPTIONAL — THE PRIMARY FLOW USES MAKE.COM DIRECTLY
//
// Use this script ONLY if you want a Google Sheets row saved as a backup
// before Make.com processes the data. If Make.com handles everything
// (including saving to Sheets), you do NOT need to deploy this script.
//
// WHAT THIS SCRIPT DOES (stripped-down version):
//   1. Receives raw test submission from index.html
//   2. Saves ONE row to Google Sheets with all raw data
//   3. Returns success — Make.com watches the Sheet for new rows
//
// SETUP (only if you want the Apps Script → Sheet → Make.com flow):
//   1. Open your Google Sheet
//   2. Extensions → Apps Script → paste this file
//   3. Deploy → New Deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   4. Copy the Web App URL
//   5. In index.html, change MAKE_WEBHOOK_URL to this URL
//      (only if using this as the receiver instead of Make.com directly)
//
// NOTE: If you are posting DIRECTLY to Make.com webhook (recommended),
// this file is not used at all.

// ==================== CONFIGURATION ====================
const CONFIG = {
  SHEET_NAME: 'Raw Submissions'
};

// ==================== MAIN HANDLER ====================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received submission from: ' + (data.studentInfo && data.studentInfo.name));

    saveRawToSheet(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== SAVE RAW ROW TO SHEET ====================
// Make.com watches this sheet for new rows and handles the rest.
function saveRawToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    const headers = [
      'Timestamp',
      'Name',
      'Email',
      'Age',
      'Native Language',
      'Listening Score',
      'Grammar Score',
      'Reading Score',
      'Listening Max',
      'Grammar Max',
      'Reading Max',
      'Writing Text',
      // Make.com will fill these columns after Claude grades the writing:
      'Writing Score',        // ← Make.com fills
      'Writing Level',        // ← Make.com fills
      'Grammar Criterion',    // ← Make.com fills
      'Vocabulary Criterion', // ← Make.com fills
      'Coherence Criterion',  // ← Make.com fills
      'Task Completion',      // ← Make.com fills
      'Total Score',          // ← Make.com fills
      'CEFR Level',           // ← Make.com fills
      'AI Feedback',          // ← Make.com fills
      'Email Sent'            // ← Make.com fills
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
  }

  // Save raw MCQ results + writing text
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.studentInfo.name || '',
    data.studentInfo.email || '',
    data.studentInfo.age || '',
    data.studentInfo.nativeLanguage || '',
    data.results && data.results.listening ? data.results.listening.score : 0,
    data.results && data.results.grammar ? data.results.grammar.score : 0,
    data.results && data.results.reading ? data.results.reading.score : 0,
    18,   // listening max
    36,   // grammar max
    18,   // reading max
    data.writingAnswers && data.writingAnswers.writing1 ? data.writingAnswers.writing1 : '[Not completed]'
    // Columns 13-22 are blank — Make.com fills them after grading
  ]);

  Logger.log('Row saved to sheet: ' + CONFIG.SHEET_NAME);
}
