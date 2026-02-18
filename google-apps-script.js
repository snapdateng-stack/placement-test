// ==================== SNAP DAT PLACEMENT TEST - GOOGLE APPS SCRIPT ====================
//
// WHAT THIS DOES:
//   1. Receives test submission from index.html (via POST)
//   2. Saves one row to the specified Google Sheet tab
//   3. Make.com watches that tab for new rows → calls Claude → sends email
//
// SETUP:
//   1. Go to script.google.com → New project
//   2. Paste this entire file, replacing any existing code
//   3. Click Deploy → New Deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   4. Copy the Web App URL
//   5. Paste it into index.html as APPS_SCRIPT_URL

// ==================== CONFIGURATION ====================
const CONFIG = {
  // The spreadsheet ID (from the URL between /d/ and /edit)
  SPREADSHEET_ID: '1LRJNd2sK_APY42TRWnjf28dNy0HRN6gZxl3W998o0Fo',

  // The tab GID (from the URL after gid=)
  // This targets the exact tab — change if you want a different tab
  SHEET_GID: 1121176103,

  // Fallback: if GID not found, use this tab name instead
  SHEET_NAME: 'Submissions'
};

// ==================== MAIN HANDLER ====================
function doPost(e) {
  try {
    // FormData submissions arrive in e.parameter.data
    // Raw JSON submissions arrive in e.postData.contents
    const raw = (e.parameter && e.parameter.data)
                  ? e.parameter.data
                  : e.postData.contents;
    const data = JSON.parse(raw);
    Logger.log('Received submission from: ' + (data.studentInfo && data.studentInfo.name));

    saveToSheet(data);

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

// ==================== GET THE SPREADSHEET ====================
// getActiveSpreadsheet() works when this script was created via
// Extensions → Apps Script inside the Google Sheet (container-bound).
// openById() is the fallback for standalone scripts.
function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      Logger.log('Using active spreadsheet: ' + ss.getName());
      return ss;
    }
  } catch (e) {
    Logger.log('getActiveSpreadsheet failed, trying openById: ' + e.toString());
  }
  Logger.log('Using openById fallback');
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

// ==================== GET THE RIGHT TAB ====================
function getSheet() {
  const ss = getSpreadsheet();

  // Try to find the tab by GID first
  const byGid = ss.getSheets().find(s => s.getSheetId() === CONFIG.SHEET_GID);
  if (byGid) {
    Logger.log('Found tab by GID: ' + byGid.getName());
    return byGid;
  }

  // Fall back to finding by name
  const byName = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (byName) {
    Logger.log('Found tab by name: ' + CONFIG.SHEET_NAME);
    return byName;
  }

  // Last resort: create the tab
  Logger.log('Tab not found — creating: ' + CONFIG.SHEET_NAME);
  return ss.insertSheet(CONFIG.SHEET_NAME);
}

// ==================== SAVE ROW TO SHEET ====================
function saveToSheet(data) {
  const sheet = getSheet();

  // Add headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Name',
      'Email',
      'Age',
      'Native Language',
      'Listening',
      'Grammar',
      'Reading',
      'Writing Text',
      // Make.com fills these after grading:
      'Writing Score',
      'Writing Level',
      'Grammar /8',
      'Vocabulary /7',
      'Coherence /7',
      'Task Completion /6',
      'Total Score /100',
      'CEFR Level',
      'AI Feedback',
      'Email Sent'
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  // Append the test data row
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.studentInfo.name        || '',
    data.studentInfo.email       || '',
    data.studentInfo.age         || '',
    data.studentInfo.nativeLanguage || '',
    (data.results && data.results.listening) ? data.results.listening.score : 0,
    (data.results && data.results.grammar)   ? data.results.grammar.score   : 0,
    (data.results && data.results.reading)   ? data.results.reading.score   : 0,
    (data.writingAnswers && data.writingAnswers.writing1) ? data.writingAnswers.writing1 : '[Not completed]'
    // Columns 10-19 left blank — Make.com fills them
  ]);

  Logger.log('Row saved. Total rows now: ' + sheet.getLastRow());
}

// ==================== TEST FUNCTION ====================
// Run this manually in the Apps Script editor to verify everything works
// before deploying. Check the Logs (View → Logs) for output.
function testSetup() {
  Logger.log('--- testSetup started ---');

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet opened: ' + ss.getName());

    const sheet = getSheet();
    Logger.log('✅ Tab found: "' + sheet.getName() + '" (GID: ' + sheet.getSheetId() + ')');
    Logger.log('   Current rows: ' + sheet.getLastRow());

    // Write a test row
    const testData = {
      timestamp: new Date().toISOString(),
      studentInfo: { name: 'Test Student', email: 'test@example.com', age: '25', nativeLanguage: 'Russian' },
      results: {
        listening: { score: 12 },
        grammar:   { score: 24 },
        reading:   { score: 10 }
      },
      writingAnswers: { writing1: 'I am from Almaty. I work as a teacher.' }
    };
    saveToSheet(testData);
    Logger.log('✅ Test row written successfully');
    Logger.log('--- testSetup complete ---');

  } catch (err) {
    Logger.log('❌ ERROR: ' + err.toString());
  }
}
