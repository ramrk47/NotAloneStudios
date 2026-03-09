/**
 * Maulya Survey — Google Apps Script Web App
 * ============================================
 * SETUP INSTRUCTIONS:
 *  1. Open https://script.google.com and create a new project.
 *  2. Paste this entire file into the editor (replace the default function).
 *  3. Click "Save" (Ctrl+S).
 *  4. Click "Deploy" → "New deployment" → Type: Web app.
 *     - Description: "Maulya Survey v1"
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Click "Deploy", authorize when prompted.
 *  6. Copy the Web App URL (looks like https://script.google.com/macros/s/AKfy.../exec).
 *  7. Paste that URL as APPS_SCRIPT_URL in survey/index.html.
 *
 * SHEET:
 *  - This script creates a sheet named "Responses" inside whatever Spreadsheet
 *    it is bound to. If standalone (not bound), bind it first via
 *    Resources → Cloud Platform Project or use SpreadsheetApp.openById().
 *  - Easiest: create this as a bound script directly from a Google Sheet:
 *      Open Sheets → Extensions → Apps Script → paste this code.
 *
 * COLUMNS (auto-created if missing):
 *  timestamp_iso | src | survey_version | answers_json |
 *  page_url | user_agent | referrer | ip_hint | lang
 */

var SHEET_NAME = 'Responses';

// ---------------------------------------------------------------------------
// doPost — called on every survey submission
// ---------------------------------------------------------------------------
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request body');
    }

    var payload = JSON.parse(e.postData.contents);

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Auto-create sheet + header row on first run
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'timestamp_iso',
        'src',
        'survey_version',
        'answers_json',
        'page_url',
        'user_agent',
        'referrer',
        'ip_hint',
        'lang'
      ]);
      // Freeze header row
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      payload.timestamp_iso  || new Date().toISOString(),
      payload.src            || 'unknown',
      payload.survey_version || '',
      JSON.stringify(payload.answers || {}),
      payload.page_url       || '',
      (payload.user_agent    || '').substring(0, 300),  // truncate long UAs
      payload.referrer       || '',
      'unavailable',  // Apps Script cannot reliably read client IP
      payload.lang           || ''
    ]);

    output.setContent(JSON.stringify({ ok: true }));

  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }

  return output;
}

// ---------------------------------------------------------------------------
// doGet — health check / deployment verification
// ---------------------------------------------------------------------------
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'maulya-survey', ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// testSheet — run manually in editor to verify Spreadsheet connection
// ---------------------------------------------------------------------------
function testSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  Logger.log('Connected to spreadsheet: ' + ss.getName());
  Logger.log('Sheet: ' + sheet.getName() + ' | Rows: ' + sheet.getLastRow());
}
