# 📝 Writing Rubric Integration Guide

## ✅ Your Custom 28-Point Rubric is Ready!

I've created the complete Claude API integration with your exact rubric:
- **Grammar & Accuracy:** 8 points
- **Vocabulary & Range:** 7 points
- **Coherence & Organization:** 7 points
- **Task Completion:** 6 points
- **TOTAL:** 28 points

---

## 🎯 What You Need to Do

### Option A: Fresh Setup (Recommended)
If you haven't set up Google Apps Script yet, use this file:

**File:** `claude-writing-evaluation.js`

**Steps:**
1. Open Google Sheets
2. Create new sheet: "SNAP DAT Placement Test Results"
3. Go to Extensions → Apps Script
4. Copy the **ENTIRE** `claude-writing-evaluation.js` file
5. Paste it into Apps Script
6. Update CONFIG section:
   ```javascript
   CLAUDE_API_KEY: 'sk-ant-YOUR-KEY-HERE'
   TEACHER_EMAIL: 'your@email.com'
   BOOKING_URL: 'https://t.me/yourlink'
   ```
7. Save and deploy as Web App

---

### Option B: Update Existing Setup
If you already copied `google-apps-script.js` from earlier:

**Replace these 3 functions** in your Apps Script with the versions from `claude-writing-evaluation.js`:

1. **gradeWritingWithClaude()** (lines ~30-150)
   - New system prompt with your 4-criterion rubric
   - Updated JSON structure
   - Better validation

2. **saveToSheet()** (lines ~160-220)
   - Adds rubric breakdown columns to Google Sheet
   - Shows individual criterion scores

3. **sendStudentEmail()** (lines ~230-350)
   - Updated email template
   - Shows detailed rubric breakdown
   - Beautiful formatting for each criterion

---

## 🧪 Test Your Setup

### Run the Test Function:

1. In Apps Script, find the function dropdown (top bar)
2. Select: `testWritingEvaluation`
3. Click Run ▶️
4. Check the logs (View → Logs)
5. You should see:

```
=== WRITING EVALUATION RESULTS ===
Grammar & Accuracy: 6/8
Vocabulary & Range: 5/7
Coherence & Organization: 5/7
Task Completion: 5/6
TOTAL: 21/28
Overall Level: B1
✅ Test successful!
```

---

## 📊 What Gets Saved to Google Sheet

Your sheet will now have these columns:

| Column | Example |
|--------|---------|
| Listening | 14/18 |
| Grammar | 28/36 |
| Reading | 15/18 |
| **Writing (Total)** | **21/28** |
| Writing: Grammar | 6/8 |
| Writing: Vocabulary | 5/7 |
| Writing: Coherence | 5/7 |
| Writing: Task | 5/6 |
| Total | 78/100 |
| Level | Intermediate (B1) |
| Writing Level (AI) | B1 |

---

## 📧 What Students See in Email

### Email Structure:

```
📊 Your Scores:
🎧 Listening: 14/18
✏️ Grammar: 28/36
📖 Reading: 15/18
✍️ Writing: 21/28

🎯 Final: 78/100 (78%) - Intermediate (B1)

✍️ Detailed Writing Assessment (AI):
Total: 21/28 points
Writing Level: B1

Evaluation by Criteria:

┌─────────────────────────────────────┐
│ Grammar & Accuracy        6/8       │
│ [Feedback in Russian]               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Vocabulary & Range        5/7       │
│ [Feedback in Russian]               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Coherence & Organization  5/7       │
│ [Feedback in Russian]               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Task Completion           5/6       │
│ [Feedback in Russian]               │
└─────────────────────────────────────┘

Overall Feedback: [3-4 sentences]

✨ Strengths: [2 bullet points]
📈 Improvements: [2 bullet points]

[🎥 Book ZOOM Call Button]
```

---

## 🔍 How the Rubric Works

### Grammar & Accuracy (8 points):

**7-8 points:** Nearly error-free, uses complex structures correctly
- Past perfect, conditionals, passive voice used accurately
- Minor slips don't impede communication

**5-6 points:** Good control of basic structures, minor errors
- Present/past/future used correctly
- Some errors with complex structures
- Meaning is always clear

**3-4 points:** Noticeable errors but meaning is clear
- Basic tenses mostly correct
- Frequent errors with articles, prepositions
- Errors don't prevent understanding

**1-2 points:** Frequent errors that impede communication
- Basic structures often incorrect
- Reader must work to understand

**0 points:** Cannot assess (too short or no text)

---

### Vocabulary & Range (7 points):

**6-7 points:** Wide range, precise word choice
- Uses topic-specific vocabulary naturally
- Good collocations (make a decision, take a break)
- Appropriate register

**4-5 points:** Adequate range for the task
- Some good vocabulary choices
- Generally appropriate words
- Some repetition but acceptable

**2-3 points:** Limited range, basic vocabulary
- Overuse of simple words (good, bad, thing)
- Frequent repetition
- Limited expression of ideas

**1 point:** Very limited vocabulary
- Only most basic words
- Struggles to express ideas

**0 points:** Cannot assess

---

### Coherence & Organization (7 points):

**6-7 points:** Excellent structure and flow
- Clear introduction, body, conclusion
- Effective use of linking words (however, therefore, although)
- Ideas progress logically
- Paragraphs well-structured

**4-5 points:** Generally well-organized
- Basic paragraphing present
- Some linking words used
- Ideas mostly connected
- Reader can follow easily

**2-3 points:** Basic organization, limited cohesion
- Simple linking (and, but, so)
- Some jumps between ideas
- Paragraphing may be unclear

**1 point:** Poor organization
- Difficult to follow
- Ideas disconnected
- No clear structure

**0 points:** Cannot assess

---

### Task Completion (6 points):

**5-6 points:** Fully addresses the prompt
- Appropriate length (meets word count)
- All parts of question answered
- Well-developed ideas with examples
- Stays on topic throughout

**3-4 points:** Addresses main points adequately
- Reasonable length
- Main question answered
- Some development of ideas
- Mostly on topic

**1-2 points:** Partially addresses prompt
- Too short or too long
- Missing key elements
- Underdeveloped ideas
- May drift off topic

**0 points:** Does not address prompt or too short to assess

---

## 🎓 Scoring Examples

### Example 1: A2 Level (14/28)

**Writing Sample:**
> "I wake up 7 o'clock. I eat breakfast. I go to work. I like my work. It is good. I come home 6 o'clock. I watch TV and I sleep."

**Scores:**
- Grammar: 3/8 (basic tenses, missing articles/prepositions)
- Vocabulary: 2/7 (very basic, repetitive)
- Coherence: 4/7 (simple but clear sequence)
- Task: 5/6 (answers the question, appropriate)
- **Total: 14/28**

---

### Example 2: B1 Level (20/28)

**Writing Sample:**
> "I usually wake up at 7 AM. After breakfast, I take the bus to work. I work in an office from 9 to 5. My job is interesting because I meet different people. In the evening, I like to relax at home. Sometimes I watch movies or read books. I think it's important to have free time."

**Scores:**
- Grammar: 6/8 (good control, minor errors)
- Vocabulary: 5/7 (adequate range, some good choices)
- Coherence: 5/7 (well-organized, basic linking)
- Task: 4/6 (answers question, could be more developed)
- **Total: 20/28**

---

### Example 3: B2 Level (25/28)

**Writing Sample:**
> "In my opinion, while social media does have some drawbacks, the advantages significantly outweigh them. Firstly, these platforms have revolutionized communication, enabling us to maintain relationships across vast distances. Moreover, they serve as valuable educational tools, providing access to diverse perspectives and information. However, it's crucial to acknowledge the potential for addiction and privacy concerns. Nevertheless, if used responsibly, social media remains an invaluable resource in our increasingly connected world."

**Scores:**
- Grammar: 7/8 (complex structures, nearly error-free)
- Vocabulary: 6/7 (wide range, precise, good collocations)
- Coherence: 7/7 (excellent organization, sophisticated linking)
- Task: 5/6 (fully addresses prompt, well-developed)
- **Total: 25/28**

---

## 💡 Key Features

### Holistic Evaluation:
- Claude evaluates **both tasks together** as one writing sample
- Task 1 (daily routine) shows basic ability
- Task 2 (opinion essay) shows higher-level skills
- The rubric is applied holistically across both

### Consistency:
- Temperature set to 0.3 for consistent scoring
- Clear scoring bands prevent wild variations
- Same rubric applied to all students

### Validation:
- Scores are validated and capped at maximum values
- Total automatically recalculated
- Fallback assessment if Claude API fails

---

## 🔧 Customization Options

### Want to adjust the rubric weights?

Edit the system prompt in `gradeWritingWithClaude()`:

```javascript
SCORING RUBRIC (28 points total):

1. GRAMMAR & ACCURACY (0-8 points):    // ← Change this
2. VOCABULARY & RANGE (0-7 points):    // ← Change this
3. COHERENCE & ORGANIZATION (0-7 points):  // ← Change this
4. TASK COMPLETION (0-6 points):       // ← Change this
```

**Make sure the total equals 28!**

### Want feedback in English instead of Russian?

Change these parts in the system prompt:
```javascript
"feedback": "[2-3 sentences in Russian]"
// ↓ Change to:
"feedback": "[2-3 sentences in English]"
```

---

## ✅ Integration Checklist

Before going live:

- [ ] Copied `claude-writing-evaluation.js` to Apps Script
- [ ] Updated CONFIG (API key, email, booking URL)
- [ ] Ran `testWritingEvaluation()` successfully
- [ ] Deployed as Web App
- [ ] Updated index.html with Web App URL
- [ ] Tested with full submission
- [ ] Received email with rubric breakdown
- [ ] Checked Google Sheet has all columns
- [ ] Verified scores total to 28 points

---

## 🎯 Final Score Calculation

```
Listening:  18 points  (auto-graded, frontend)
Grammar:    36 points  (auto-graded, frontend)
Reading:    18 points  (auto-graded, frontend)
Writing:    28 points  (AI-graded with your rubric)
────────────────────────────────────────────────
TOTAL:     100 points
```

**Example:**
- Listening: 14/18
- Grammar: 28/36
- Reading: 15/18
- Writing: 21/28 (Grammar 6 + Vocab 5 + Coherence 5 + Task 5)
- **Total: 78/100 (78%) = Intermediate (B1)**

---

## 🚀 You're Done!

Your placement test now has professional-grade writing assessment with detailed rubric feedback!

**Students get:**
- ✅ Total writing score out of 28
- ✅ Breakdown by 4 criteria
- ✅ Specific feedback for each criterion
- ✅ Overall level estimate (A1-C1)
- ✅ Strengths and improvements
- ✅ All in beautiful email format

**You get:**
- ✅ Detailed data in Google Sheets
- ✅ Individual rubric scores for analysis
- ✅ Writing samples saved for review
- ✅ Consistent, fair scoring
- ✅ Zero manual grading!

---

## 📞 Questions?

**Check logs:**
- Apps Script: View → Logs
- Look for "Writing assessment complete. Total score: X/28"

**Common issues:**
- If scores don't add up to 28, Claude recalculates automatically
- If API fails, fallback assessment gives 13/28
- All scores are validated and capped at maximums

**Need help?** Run `testWritingEvaluation()` and check the logs!

---

**Enjoy your automated, rubric-based writing assessment!** ✨
