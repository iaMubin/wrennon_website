# "View Demo" Form — Google Apps Script Setup Guide

This file is for you — it's not part of the website. It walks through, step by
step, how to create an Apps Script in your own Google account that receives
submissions (name, company, email, file) from the "View Demo" →
"See results with your data" form and saves them to a Google Sheet and Google
Drive.

---

## Step 1 — Create a Google Sheet

1. Go to sheets.google.com and create a new blank spreadsheet.
2. Name it something like `Wrennon Demo Requests`.
3. Add a header row (columns A through F):
   `Timestamp | Name | Company | Email | File Link | File ID`

## Step 2 — Create a Google Drive folder

1. In drive.google.com, create a new folder named `Wrennon Demo Uploads`.
2. Open the folder and copy the folder ID from the URL —
   `https://drive.google.com/drive/folders/`**`THIS_PART_IS_THE_ID`**

## Step 3 — Create the Apps Script project

1. Go to script.google.com → **New project**.
2. Delete the default `Code.gs` content and paste in the full script below.
3. Replace the two constants `SHEET_ID` and `DRIVE_FOLDER_ID` with your own
   Sheet and Folder IDs (the Sheet ID is also the part of the Sheet URL right
   after `/d/`).

```javascript
// ==== CONFIG — update these two ====
const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const DRIVE_FOLDER_ID = "PASTE_YOUR_DRIVE_FOLDER_ID_HERE";

function doPost(e) {
  try {
    // We expect a JSON payload sent with Content-Type: text/plain
    const data = JSON.parse(e.postData.contents);
    const name = (data.name || "").toString().trim();
    const company = (data.company || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const fileName = data.fileName || "uploaded_file";
    const mimeType = data.mimeType || "application/octet-stream";
    const fileData = data.fileData;

    if (!name || !company || !email) {
      return jsonResponse({ success: false, error: "Missing required fields." });
    }

    if (!fileData) {
      return jsonResponse({ success: false, error: "No file received." });
    }

    // Decode the base64 file data
    const decodedFile = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(decodedFile, mimeType, fileName);

    // Server-side generated filename — never trust the client's filename directly
    const extMatch = fileName.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : "";
    
    const allowedExts = [".csv", ".txt", ".docx", ".pdf", ".xlsx"];
    if (allowedExts.indexOf(ext) === -1) {
      return jsonResponse({ success: false, error: "Unsupported file type." });
    }

    const safeFileName = "demo-upload-" + new Date().getTime() + "-" +
      Math.random().toString(36).substring(2, 8) + ext;

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const savedFile = folder.createFile(blob).setName(safeFileName);

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      new Date(),
      name,
      company,
      email,
      savedFile.getUrl(),
      savedFile.getId()
    ]);

    // Send confirmation email to the user
    const subject = "Wrennon - We have received your data!";
    const body = "Hi " + name + ",\n\n" +
                 "Thank you for uploading your tickets. We have securely received your data.\n" +
                 "We will process these past interactions through our engine and email your custom results within 24 hours.\n\n" +
                 "Best,\nThe Wrennon Team";
                 
    MailApp.sendEmail(email, subject, body);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

> **Note:** In Apps Script's `doPost(e)`, multipart file uploads arrive in the
> `e.files` object (keyed by field name — here, `file`), while text fields
> arrive in `e.parameter`. The script above handles both.

## Step 4 — Deploy

1. In the top right, click **Deploy → New deployment**.
2. Click the gear icon (⚙️) and select **Web app** as the type.
3. Settings:
   - **Execute as:** Me (your account)
   - **Who has access:** **Anyone** — this is required, otherwise the
     `fetch()` call from the website will fail with a permission error.
4. Click **Deploy**. The first time, an authorization popup will appear —
   grant access with your Google account (Advanced → Go to project (unsafe)
   → Allow, since this is your own script).
5. Once deployed, you'll get a **Web app URL** that looks like:
   `https://script.google.com/macros/s/XXXXXXXXXX/exec`
6. Copy that URL.

## Step 5 — Add the URL to the website

Open `js/demo-modal.js` and find this line near the top:

```javascript
const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
```

Replace `"PASTE_YOUR_APPS_SCRIPT_URL_HERE"` with the Web app URL from Step 4.
Save and redeploy to Netlify, and the form will start working.

## Updating the script later

If you change the script code, you'll need to redeploy: **Deploy → Manage
deployments → Edit (pencil icon) → Version: New version → Deploy**. Otherwise
the old version stays live — the URL itself doesn't change.
