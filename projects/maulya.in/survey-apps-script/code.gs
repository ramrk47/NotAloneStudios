/**
 * Maulya Survey — Google Apps Script Web App
 * ============================================
 * SETUP INSTRUCTIONS (do this ONCE in the Apps Script UI):
 *
 *  1. Open https://script.google.com and create a new project.
 *     OR open your Google Sheet → Extensions → Apps Script (bound script).
 *
 *  2. Paste this entire file into the editor (replace default content).
 *     Save (Ctrl+S).
 *
 *  3. Click "Deploy" → "New deployment"
 *     ┌─────────────────────────────────────────────────────────┐
 *     │  Type:          Web app                                 │
 *     │  Execute as:    Me                                      │
 *     │  Who can access: Anyone          ← THIS IS CRITICAL     │
 *     └─────────────────────────────────────────────────────────┘
 *     Click "Deploy" and authorize.
 *
 *  4. Copy the Web App URL — it will look like:
 *       https://script.google.com/macros/s/AKfyc.../exec
 *     ✅ Must contain:  /macros/s/
 *     ✅ Must end with: /exec
 *     🚫 Never use:    /macros/library/   ← always returns 403
 *     🚫 Never use:    /macros/edit?lib=  ← editor, not endpoint
 *
 *  5. Paste that URL as APPS_SCRIPT_URL in survey/index.html.
 *
 *  6. Every time you change this script, you MUST create a NEW deployment
 *     (or "New version" in Manage deployments) — edits to code don't
 *     automatically update an existing deployed version.
 *
 * CORS NOTE:
 *  Apps Script Web Apps do not respond to OPTIONS preflight requests.
 *  To avoid preflight, the frontend sends Content-Type: text/plain
 *  (a "simple request"). Google's server adds Access-Control-Allow-Origin: *
 *  automatically when access is set to "Anyone".
 *  Do NOT set custom response headers here — ContentService.TextOutput
 *  does not expose a setHeader() method.
 *
 * SHEET COLUMNS (auto-created on first run):
 *  timestamp_iso | src | survey_version | answers_json |
 *  page_url | user_agent | referrer | ip_hint | lang
 */

var SHEET_NAME = 'Responses';

// ---------------------------------------------------------------------------
// doPost — entry point for every survey submission
// ---------------------------------------------------------------------------
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Guard: empty body
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
      sheet.setFrozenRows(1);

      // Basic column widths for readability
      sheet.setColumnWidth(1, 200);  // timestamp
      sheet.setColumnWidth(4, 400);  // answers_json
      sheet.setColumnWidth(5, 280);  // page_url
      sheet.setColumnWidth(6, 180);  // user_agent
    }

    sheet.appendRow([
      payload.timestamp_iso  || new Date().toISOString(),
      payload.src            || 'unknown',
      payload.survey_version || '',
      JSON.stringify(payload.answers || {}),
      payload.page_url       || '',
      (payload.user_agent    || '').substring(0, 300),  // truncate long UA strings
      payload.referrer       || '',
      'unavailable',  // Apps Script cannot read client IP from doPost
      payload.lang           || ''
    ]);

    output.setContent(JSON.stringify({ ok: true }));

  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }

  return output;
}

// ---------------------------------------------------------------------------
// doGet — health check endpoint
// Verify deployment is live: curl https://...exec
// Expect: {"ok":true,"service":"maulya-survey"}
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
// testSheet — run manually in the Apps Script editor to verify
// the Spreadsheet binding is correct before going live.
// ---------------------------------------------------------------------------
function testSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  Logger.log('Spreadsheet: ' + ss.getName());
  Logger.log('Sheet: ' + sheet.getName() + ' | Rows so far: ' + sheet.getLastRow());
}
