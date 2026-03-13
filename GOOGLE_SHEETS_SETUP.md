# Google Sheets Integration Setup Guide

## Problem
The placement test shows "function not found" error because the Google Apps Script is not deployed yet.

## Solution: Deploy Google Apps Script

### Step 1: Open Your Google Sheet
1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1LRJNd2sK_APY42TRWnjf28dNy0HRN6gZxl3W998o0Fo/edit
2. Make sure you're logged into the correct Google account

### Step 2: Create the Apps Script Project

**Option A: Container-Bound Script (Recommended)**
1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-apps-script.js` from this repository
4. Paste it into the Apps Script editor
5. Click the "Save" icon (💾) or press `Ctrl+S`
6. Name the project: "Placement Test Submission Handler"

**Option B: Standalone Script**
1. Go to https://script.google.com
2. Click **New Project**
3. Copy the entire contents of `google-apps-script.js` from this repository
4. Paste it into the Apps Script editor
5. Click "Save" and name it "Placement Test Submission Handler"

### Step 3: Test the Script (Optional but Recommended)
1. In the Apps Script editor, select the function `testSetup` from the dropdown at the top
2. Click the **Run** button (▶️)
3. The first time you run it, you'll be asked to authorize:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Placement Test Submission Handler (unsafe)**
   - Click **Allow**
4. Check **View → Logs** (or press `Ctrl+Enter`) to see if the test passed
5. Check your Google Sheet - you should see a new row with test data

### Step 4: Deploy as Web App
1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description:** "Placement test submission v1"
   - **Execute as:** **Me** (your email)
   - **Who has access:** **Anyone**
5. Click **Deploy**
6. You may need to authorize again - follow the same steps as before
7. **IMPORTANT:** Copy the **Web app URL** that appears
   - It will look like: `https://script.google.com/macros/s/AKfycby...LONG_ID.../exec`
   - Keep this URL - you'll need it in the next step

### Step 5: Update the URL in index.html
1. Open `index.html` in this repository
2. Find line 901 (or search for `APPS_SCRIPT_URL`)
3. Replace:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
   ```
   with:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby...YOUR_ACTUAL_URL.../exec',
   ```
4. Save the file
5. Commit and push the changes

### Step 6: Test the Integration
1. Deploy your updated `index.html` to Vercel
2. Take the placement test yourself
3. Submit the test
4. Check your Google Sheet - a new row should appear with your submission
5. Check the browser console (F12) for any error messages

---

## Troubleshooting

### Error: "function not found"
- **Cause:** The Apps Script is not deployed or the URL is wrong
- **Fix:** Make sure you completed Step 4 and Step 5 correctly

### Error: "Script function not found: doPost"
- **Cause:** The function name is wrong or the script wasn't saved
- **Fix:** Make sure you pasted the entire `google-apps-script.js` file and clicked Save

### No data appears in Google Sheets
- **Cause:** Permission issues or wrong spreadsheet ID
- **Fix:**
  1. Run the `testSetup` function manually (Step 3)
  2. Check the Logs for error messages
  3. Verify the SPREADSHEET_ID in `google-apps-script.js` line 20 matches your sheet

### "Access denied" or "Authorization required"
- **Cause:** The script doesn't have permission to access the spreadsheet
- **Fix:** Run the `testSetup` function and authorize the permissions

### Data goes to the wrong sheet/tab
- **Fix:** Update `SHEET_GID` on line 24 of `google-apps-script.js`:
  1. Open your Google Sheet
  2. Go to the "Submissions" tab
  3. Look at the URL - copy the number after `gid=`
  4. Paste it as the value of `SHEET_GID`
  5. Re-deploy the script (Deploy → Manage deployments → Edit → Version: New Version → Deploy)

---

## Configuration Details

The script is currently configured to save data to:
- **Spreadsheet ID:** `1LRJNd2sK_APY42TRWnjf28dNy0HRN6gZxl3W998o0Fo`
- **Sheet GID:** `1121176103`
- **Fallback tab name:** `Submissions`

To change these, edit lines 20-27 in `google-apps-script.js`.

---

## Data Flow

```
Student completes test
    ↓
index.html sends POST to Apps Script
    ↓
Apps Script saves row to Google Sheets
    ↓
Make.com watches for new rows
    ↓
Make.com calls Claude AI to grade writing
    ↓
Make.com updates row with scores
    ↓
Make.com sends email to student
```

---

## Need Help?

If you're still having issues:
1. Check the browser console (F12 → Console tab) for error messages
2. Check the Apps Script logs (Apps Script editor → View → Logs)
3. Make sure the Google Sheet is accessible to your account
4. Verify the script is deployed with "Anyone" access (not "Anyone with the link")
