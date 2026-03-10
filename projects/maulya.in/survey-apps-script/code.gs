/**
 * Maulya Survey — Google Apps Script Web App
 * ============================================
 * FIRST-TIME SETUP (do this once):
 *
 *  STEP 1 — Link a Google Sheet
 *  ─────────────────────────────
 *  Option A (standalone script — most likely your situation):
 *    1. Open https://sheets.google.com → create a new sheet (name it anything,
 *       e.g. "Maulya Survey Responses")
 *    2. Copy the spreadsheet ID from the URL:
 *         https://docs.google.com/spreadsheets/d/ *** THIS PART *** /edit
 *    3. Paste it as the SPREADSHEET_ID value below (between the quotes)
 *    4. Save this file (Ctrl+S) and re-deploy (see Step 2)
 *
 *  Option B (bound script — only if you opened Apps Script from a Sheet):
 *    Leave SPREADSHEET_ID empty ('') — the script uses the bound sheet.
 *
 *  STEP 2 — Deploy or re-deploy as Web App
 *  ─────────────────────────────────────────
 *    Click Deploy → Manage deployments → pencil icon on existing deployment
 *    → Version: "New version" → Deploy.
 *    The exec URL stays the same; no need to update survey/index.html.
 *
 *    Deployment settings must be:
 *    ┌─────────────────────────────────────────────────────────┐
 *    │  Type:           Web app                                │
 *    │  Execute as:     Me                                     │
 *    │  Who can access: Anyone          ← THIS IS CRITICAL     │
 *    └─────────────────────────────────────────────────────────┘
 *
 *  STEP 3 — Verify
 *  ─────────────────
 *    Run testSheet() from the editor (select it in the dropdown → Run).
 *    It should log the spreadsheet name. If it errors, check SPREADSHEET_ID.
 *
 * CORS NOTE:
 *  Frontend sends Content-Type: text/plain to avoid OPTIONS preflight.
 *  Google adds Access-Control-Allow-Origin: * automatically for "Anyone" deployments.
 *
 * SHEET COLUMNS (auto-created on first POST):
 *  timestamp_iso | src | survey_version | answers_json |
 *  page_url | user_agent | referrer | lang
 */

// ─── SET THIS to your Google Sheet ID if using a standalone script ───────────
var SPREADSHEET_ID = '1TpL48O9EJT9VSZ7Y7YMmiZ_e1eD_gVPsGD2YOiFglVc';
// ─────────────────────────────────────────────────────────────────────────────

var SHEET_NAME = 'Responses';

// ---------------------------------------------------------------------------
// getSheet — resolves the Responses sheet regardless of bound vs standalone
// ---------------------------------------------------------------------------
function getSheet() {
  var ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) {
    throw new Error(
      'No spreadsheet found. ' +
      'Set SPREADSHEET_ID at the top of code.gs (copy the ID from your Sheet URL), ' +
      'then re-deploy.'
    );
  }

  var sheet = ss.getSheetByName(SHEET_NAME);

  // Auto-create sheet + header row on first run
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'timestamp_iso',
      'src',
      'survey_version',
      'answers_json',
      'contact_name',
      'contact_info',
      'page_url',
      'user_agent',
      'referrer',
      'lang'
    ]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);  // timestamp
    sheet.setColumnWidth(4, 400);  // answers_json
    sheet.setColumnWidth(5, 280);  // page_url
    sheet.setColumnWidth(6, 180);  // user_agent
  }

  return sheet;
}

// ---------------------------------------------------------------------------
// doPost — entry point for every survey submission
// ---------------------------------------------------------------------------
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request body');
    }

    var payload = JSON.parse(e.postData.contents);
    var sheet   = getSheet();

    sheet.appendRow([
      payload.timestamp_iso  || new Date().toISOString(),
      payload.src            || 'unknown',
      payload.survey_version || '',
      JSON.stringify(payload.answers || {}),
      payload.contact_name   || '',
      payload.contact_info   || '',
      payload.page_url       || '',
      (payload.user_agent    || '').substring(0, 300),
      payload.referrer       || '',
      payload.lang           || ''
    ]);

    output.setContent(JSON.stringify({ ok: true }));

  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }

  return output;
}

// ---------------------------------------------------------------------------
// doGet — health check  (curl https://...exec  →  {"ok":true})
// ---------------------------------------------------------------------------
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok:      true,
      service: 'maulya-survey',
      ts:      new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// testSheet — run manually in the editor to verify the sheet connection
// ---------------------------------------------------------------------------
function testSheet() {
  var sheet = getSheet();
  var ss    = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet: ' + ss.getName() + ' (' + ss.getUrl() + ')');
  Logger.log('Sheet: "' + sheet.getName() + '" | Rows: ' + sheet.getLastRow());
  Logger.log('All good — doPost() will write to this sheet.');
}
