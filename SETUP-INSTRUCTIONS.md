# 🚀 SNAP DAT Placement Test - Complete Setup Guide

This guide will walk you through setting up your English placement test with AI grading.

## 📋 What You'll Need

- ✅ GitHub account (free)
- ✅ Google account (free)
- ✅ Claude API key from Anthropic (~$1/100 tests)
- ⏱️ **Total setup time: 20-30 minutes**

---

## 🎯 PART 1: Get Your Claude API Key

### Step 1.1: Sign up for Anthropic (Claude)

1. Go to: https://console.anthropic.com/
2. Click "Sign Up" (top right)
3. Create account with your email
4. Verify your email

### Step 1.2: Add credits to your account

1. Go to: https://console.anthropic.com/settings/plans
2. Click "Buy credits"
3. Add $5-10 (this will last for 500-1000 tests!)
4. Enter payment info

### Step 1.3: Create API key

1. Go to: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: "Placement Test"
4. Click "Create"
5. **COPY THE KEY** - it looks like: `sk-ant-api03-xxxxx...`
6. ⚠️ **IMPORTANT:** Save this key somewhere safe! You won't see it again.

**✅ Done!** You now have your Claude API key.

---

## 🗂️ PART 2: Set Up Google Sheets & Apps Script

### Step 2.1: Create a Google Sheet

1. Go to: https://sheets.google.com
2. Click "+ Blank" to create new spreadsheet
3. Name it: "SNAP DAT Placement Test Results"
4. You'll see an empty sheet - that's perfect!

### Step 2.2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** (top menu)
2. Click **Apps Script**
3. A new tab will open with code editor
4. You'll see some default code - DELETE IT ALL

### Step 2.3: Paste the Backend Code

1. Open the file: `google-apps-script.js` (in this project)
2. Copy **ALL** the code (Ctrl+A, Ctrl+C)
3. Paste it into the Apps Script editor
4. The file will be named "Code.gs" automatically

### Step 2.4: Configure Your Settings

In the Apps Script editor, find the `CONFIG` section at the top (around line 25):

```javascript
const CONFIG = {
  CLAUDE_API_KEY: 'sk-ant-YOUR-KEY-HERE',  // ← PASTE YOUR CLAUDE KEY HERE!
  TEACHER_EMAIL: 'snapdateng@gmail.com',   // ← CHANGE TO YOUR EMAIL!
  BOOKING_URL: 'https://t.me/tyveric',     // ← YOUR ZOOM/TELEGRAM LINK
  SCHOOL_NAME: 'SNAP DAT',
  ...
};
```

**Change these 3 things:**
1. `CLAUDE_API_KEY` → Paste your Claude API key from Part 1
2. `TEACHER_EMAIL` → Your email address
3. `BOOKING_URL` → Your Telegram/calendar link

### Step 2.5: Test Your Setup (Optional but Recommended)

1. In Apps Script editor, find the function dropdown (top bar)
2. Select: `testSetup`
3. Click the "Run" button (▶️ play icon)
4. **First time only:** You'll see "Authorization required"
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Untitled project (unsafe)"
   - Click "Allow"
5. Wait a few seconds
6. Click "View" → "Logs" to see results
7. You should see: ✅ All tests passed!

**If you see errors:**
- ❌ "ERROR: You need to set your Claude API key!" → Go back to step 2.4
- ❌ "Claude API error" → Check your API key is correct
- ❌ Other errors → Copy error message and ask for help

### Step 2.6: Deploy as Web App

1. Click **Deploy** button (top right)
2. Click **New deployment**
3. Click the gear icon ⚙️ next to "Select type"
4. Choose **Web app**
5. Settings:
   - **Description:** "Placement Test Backend"
   - **Execute as:** Me (your@email.com)
   - **Who has access:** **Anyone**
6. Click **Deploy**
7. You'll see "Authorization required" again
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to Untitled project (unsafe)"
   - Click "Allow"
8. **COPY THE WEB APP URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
9. **SAVE THIS URL!** You'll need it in Part 3.

**✅ Done!** Your Google backend is ready.

---

## 💻 PART 3: Set Up GitHub Pages (Frontend)

### Step 3.1: Create GitHub Account (if you don't have one)

1. Go to: https://github.com
2. Click "Sign up"
3. Follow the steps to create account
4. Verify your email

### Step 3.2: Create a New Repository

1. Go to: https://github.com/new
2. Repository name: `placement-test`
3. Description: "English Placement Test"
4. Set to **Public**
5. ✅ Check "Add a README file"
6. Click "Create repository"

### Step 3.3: Upload Your Files

1. In your repository, click "Add file" → "Upload files"
2. Drag and drop these files from your computer:
   - `index.html`
   - `logo.png` (if you have one)
   - All audio files (`*.mp3`)
3. Scroll down, add commit message: "Initial commit"
4. Click "Commit changes"

### Step 3.4: Update index.html with Apps Script URL

1. In your repository, click on `index.html`
2. Click the pencil icon ✏️ (Edit this file)
3. Find the `CONFIG` section (around line 905)
4. Look for this line:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
   ```
5. Replace `YOUR_SCRIPT_ID_HERE` with your Web App URL from Step 2.6
6. Also find the finishTest() function (around line 2054) and replace it with the new version from `index-html-updates.js`
7. Scroll down, add commit message: "Add Apps Script URL"
8. Click "Commit changes"

**Detailed instructions for code updates:**
- Open the file `index-html-updates.js` in this project
- Copy each section and replace the corresponding section in your `index.html`
- The file has comments showing which lines to replace

### Step 3.5: Enable GitHub Pages

1. In your repository, click "Settings" (top menu)
2. Scroll down to "Pages" (left sidebar)
3. Under "Source", select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click "Save"
5. Wait 1-2 minutes
6. Refresh the page
7. You'll see: "Your site is live at https://yourusername.github.io/placement-test"
8. **COPY THIS URL** - this is your test URL!

**✅ Done!** Your test is now live!

---

## 🧪 PART 4: Test Everything

### Step 4.1: Take the Test Yourself

1. Go to your test URL: `https://yourusername.github.io/placement-test`
2. Fill in your info (use your email)
3. Complete all 4 sections (you can pick random answers to test)
4. Write something in both writing tasks
5. Click "Submit Test"
6. You should see the confirmation screen with your custom message

### Step 4.2: Check Your Email

1. Wait 1-2 minutes
2. Check your inbox
3. You should receive an email with:
   - ✅ All 4 section scores
   - ✅ Total score out of 100
   - ✅ CEFR level
   - ✅ AI feedback on writing
   - ✅ Link to book ZOOM call

### Step 4.3: Check Google Sheets

1. Go back to your Google Sheet
2. You should see:
   - ✅ New sheet tab called "Results" (auto-created)
   - ✅ One row with your test data
   - ✅ All scores, writing samples, AI feedback

### Step 4.4: Check Teacher Notification

1. Check your teacher email
2. You should have received a notification email
3. It shows: student name, level, scores

**If everything works: 🎉 CONGRATULATIONS! You're done!**

---

## 🐛 Troubleshooting

### Problem: "Apps Script URL is not working"

**Solution:**
1. Go back to Apps Script
2. Click Deploy → Manage deployments
3. Make sure "Who has access" is set to **Anyone**
4. Copy the URL again and update index.html

### Problem: "No email received"

**Solution:**
1. Check spam folder
2. Go to Google Sheet → View execution logs (Extensions → Apps Script → View logs)
3. Look for errors
4. Common issue: Wrong email address in studentInfo

### Problem: "Claude API error"

**Solution:**
1. Check API key is correct in Apps Script CONFIG
2. Make sure you added credits to your Anthropic account
3. Check API usage: https://console.anthropic.com/settings/usage

### Problem: "GitHub Pages shows 404"

**Solution:**
1. Wait 5 minutes (sometimes takes time to deploy)
2. Make sure index.html is in the root folder, not a subfolder
3. Check Settings → Pages is enabled

### Problem: "Test submissions not saving to Sheet"

**Solution:**
1. Open Apps Script
2. Click "View" → "Logs"
3. Run testSetup() function to check for errors
4. Make sure you authorized the script (Step 2.5)

---

## 📊 Understanding the Scoring

### Total Points: 100

| Section | Points | Breakdown |
|---------|--------|-----------|
| 🎧 Listening | 18 | 4 beginner (1pt) + 4 intermediate (2pt) + 4 advanced (3pt) |
| ✏️ Grammar | 36 | 6 beginner (1pt) + 6 intermediate (2pt) + 6 advanced (3pt) |
| 📖 Reading | 18 | 4 beginner (1pt) + 4 intermediate (2pt) + 4 advanced (3pt) |
| ✍️ Writing | 28 | Task 1: 12 points + Task 2: 16 points |
| **TOTAL** | **100** | |

### CEFR Level Mapping

| Percentage | Level |
|------------|-------|
| 0-16% | Pre-Beginner (A0) |
| 17-30% | Beginner (A1) |
| 31-45% | Elementary (A2) |
| 46-60% | Low Intermediate (B1-) |
| 61-75% | Intermediate (B1) |
| 76-85% | High Intermediate (B1+/B2) |
| 86-100% | Advanced (B2+/C1) |

---

## 💰 Costs

### What you'll pay:

| Service | Cost | Notes |
|---------|------|-------|
| GitHub Pages | **FREE** | Unlimited for public repos |
| Google Apps Script | **FREE** | Plenty for this use case |
| Gmail (emails) | **FREE** | 100/day limit (more than enough) |
| **Claude API** | **~$0.01/test** | Only thing you pay for! |

### Example costs:
- 10 students: **$0.10**
- 100 students: **$1.00**
- 1,000 students: **$10.00**

**Much cheaper than teacher time!** ⏰

---

## 🔒 Security Notes

### ✅ What's Safe:

- ✅ Claude API key is hidden in Apps Script (not visible to students)
- ✅ Students can't see backend code
- ✅ All data saved securely in your Google Sheet
- ✅ Only you can access the sheet

### ⚠️ What to Keep Private:

- ⚠️ **Never** commit your Claude API key to GitHub
- ⚠️ **Never** put API keys in index.html
- ⚠️ Keep your Apps Script Web App URL private (but it's OK if students see it)

---

## 📞 Getting Help

### If you get stuck:

1. **Check logs:**
   - Apps Script: View → Logs
   - Browser: Right-click → Inspect → Console tab

2. **Common errors:**
   - "Authorization required" → You need to authorize the script
   - "API key invalid" → Check your Claude API key
   - "404 error" → Wait a few minutes for GitHub Pages to deploy

3. **Test each part separately:**
   - Part 1: Run testSetup() in Apps Script
   - Part 2: Check Apps Script execution logs
   - Part 3: Visit your GitHub Pages URL
   - Part 4: Submit a test with your own email

---

## 🎉 You're Done!

Your test is now live and ready to use!

**Share this URL with students:**
```
https://yourusername.github.io/placement-test
```

**Your workflow:**
1. Student completes test (45 min)
2. Student clicks Submit
3. Apps Script calls Claude AI (5 sec)
4. Results saved to your Google Sheet
5. Student receives email (1-2 min)
6. You receive notification
7. Student books ZOOM call
8. You review data in Google Sheet

**Enjoy your automated placement test!** 🚀

---

## 📝 Quick Reference

### Important URLs:

- **Test URL:** `https://yourusername.github.io/placement-test`
- **Apps Script:** https://script.google.com
- **Google Sheet:** https://sheets.google.com
- **GitHub Repo:** `https://github.com/yourusername/placement-test`
- **Claude Console:** https://console.anthropic.com

### File Locations:

- **Frontend:** `index.html` on GitHub
- **Backend:** Apps Script in Google Sheets
- **Data:** "Results" sheet in Google Sheets
- **Logs:** Apps Script → View → Logs

### Need to update something?

- **Change ZOOM link:** Update `BOOKING_URL` in both:
  - Apps Script CONFIG
  - index.html CONFIG
- **Change email:** Update `TEACHER_EMAIL` in Apps Script CONFIG
- **Change questions:** Edit testData in index.html
- **Change scoring rubric:** Edit grading prompt in Apps Script

---

**Good luck with your placement tests!** 📚✨
