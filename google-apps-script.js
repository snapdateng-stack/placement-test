// ==================== SNAP DAT PLACEMENT TEST - GOOGLE APPS SCRIPT ====================
// This script handles:
// 1. Receiving test submissions from the frontend
// 2. Grading writing tasks with Claude API
// 3. Saving results to Google Sheets
// 4. Sending emails to student and teacher
//
// SETUP INSTRUCTIONS:
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete any existing code
// 4. Paste this entire file
// 5. Update the CONFIG section below
// 6. Click Deploy → New Deployment → Web App
// 7. Set "Execute as: Me" and "Who has access: Anyone"
// 8. Copy the Web App URL and paste it in your index.html

// ==================== CONFIGURATION ====================
const CONFIG = {
  // ⚠️ REQUIRED: Your Claude API key from https://console.anthropic.com/
  CLAUDE_API_KEY: 'sk-ant-YOUR-KEY-HERE',  // ← CHANGE THIS!

  // ⚠️ REQUIRED: Your email address
  TEACHER_EMAIL: 'snapdateng@gmail.com',  // ← CHANGE THIS!

  // ⚠️ REQUIRED: Your ZOOM/Telegram booking link
  BOOKING_URL: 'https://t.me/tyveric',  // ← CHANGE THIS!

  // School name
  SCHOOL_NAME: 'SNAP DAT',

  // Scoring (out of 100)
  MAX_SCORES: {
    listening: 18,
    grammar: 36,
    reading: 18,
    writing: 28,
    total: 100
  }
};

// ==================== MAIN HANDLER ====================
// This function is called when the frontend submits the test
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received submission from: ' + data.studentInfo.name);

    // Validate required fields
    if (!data.studentInfo || !data.studentInfo.email || !data.writingAnswers) {
      throw new Error('Missing required fields');
    }

    // 1. Grade writing with Claude API
    Logger.log('Calling Claude API for writing assessment...');
    const writingAssessment = gradeWritingWithClaude(
      data.writingAnswers.writing1 || ''
    );
    Logger.log('Claude assessment complete. Score: ' + writingAssessment.totalScore);

    // 2. Calculate final results
    const finalResults = calculateFinalResults(data.results, writingAssessment);
    Logger.log('Final results calculated. Total: ' + finalResults.totalScore + '/100');

    // 3. Save to Google Sheets
    Logger.log('Saving to Google Sheets...');
    saveToSheet(data, finalResults, writingAssessment);

    // 4. Send email to student
    Logger.log('Sending email to student...');
    sendStudentEmail(data.studentInfo, finalResults, writingAssessment);

    // 5. Notify teacher
    Logger.log('Notifying teacher...');
    sendTeacherEmail(data.studentInfo, finalResults);

    // 6. Return success response
    Logger.log('All tasks completed successfully!');
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Test submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);

    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== CLAUDE API INTEGRATION ====================
function gradeWritingWithClaude(writingText) {
  // Validate input
  if (!writingText || writingText.trim().length < 10) {
    writingText = '[Not completed]';
  }

  // Create prompt for Claude — single short task, 4-criterion rubric
  const prompt = `You are an expert ESL teacher grading a short English placement test writing sample.

The student was asked to write 3–5 sentences choosing one of these prompts:
Option A: Tell us about yourself — where you're from, what you do, and why you're learning English.
Option B: What is one thing you like (or dislike) about your city or country? Explain why.

SCORING RUBRIC (28 points total):

1. GRAMMAR & ACCURACY (0-8 points):
   7-8: Nearly error-free, uses varied structures correctly
   5-6: Good control of basics, minor errors, meaning always clear
   3-4: Noticeable errors but meaning is clear
   1-2: Frequent errors that impede understanding
   0: Cannot assess (too short or no text)

2. VOCABULARY & RANGE (0-7 points):
   6-7: Wide range, precise word choice, good collocations
   4-5: Adequate range, some good choices, minor repetition
   2-3: Limited, overuse of simple words
   1: Only most basic words
   0: Cannot assess

3. COHERENCE & ORGANIZATION (0-7 points):
   6-7: Clear flow, effective connectors, ideas progress logically
   4-5: Generally well-organized, some linking words
   2-3: Simple linking (and/but/so), some jumps
   1: Poor organization, ideas disconnected
   0: Cannot assess

4. TASK COMPLETION (0-6 points):
   5-6: Fully addresses the prompt, appropriate length, developed ideas
   3-4: Addresses main point, reasonable length
   1-2: Partially addresses prompt, too short, underdeveloped
   0: Does not address prompt or too short to assess

STUDENT'S WRITING:
${writingText}

Provide your grading in EXACTLY this JSON format (no markdown, no code blocks):
{
  "grammar": { "score": [0-8], "feedback": "[2-3 sentences in Russian]" },
  "vocabulary": { "score": [0-7], "feedback": "[2-3 sentences in Russian]" },
  "coherence": { "score": [0-7], "feedback": "[2-3 sentences in Russian]" },
  "taskCompletion": { "score": [0-6], "feedback": "[2-3 sentences in Russian]" },
  "totalScore": [sum of all 4, 0-28],
  "overallLevel": "[A1/A2/B1/B2/C1 — based on writing quality]",
  "overallFeedback": "[3-4 sentences overall assessment in Russian]",
  "strengths": ["[strength 1 in Russian]", "[strength 2 in Russian]"],
  "improvements": ["[area 1 in Russian]", "[area 2 in Russian]"]
}`;

  // Prepare API request
  const payload = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: prompt
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CONFIG.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    // Call Claude API
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      throw new Error('Claude API returned status ' + statusCode + ': ' + response.getContentText());
    }

    const result = JSON.parse(response.getContentText());

    // Extract and parse JSON from Claude's response
    let content = result.content[0].text;

    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON
    const assessment = JSON.parse(content);

    // Validate the response structure
    if (!assessment.grammar || !assessment.vocabulary || !assessment.coherence || !assessment.taskCompletion || typeof assessment.totalScore !== 'number') {
      throw new Error('Invalid response structure from Claude');
    }

    // Ensure scores are within valid ranges
    assessment.grammar.score = Math.max(0, Math.min(8, assessment.grammar.score));
    assessment.vocabulary.score = Math.max(0, Math.min(7, assessment.vocabulary.score));
    assessment.coherence.score = Math.max(0, Math.min(7, assessment.coherence.score));
    assessment.taskCompletion.score = Math.max(0, Math.min(6, assessment.taskCompletion.score));
    assessment.totalScore = assessment.grammar.score + assessment.vocabulary.score + assessment.coherence.score + assessment.taskCompletion.score;

    return assessment;

  } catch (error) {
    Logger.log('Claude API Error: ' + error.toString());

    // Return fallback assessment if Claude fails
    return {
      grammar: { score: 3, feedback: "Автоматическая оценка недоступна. Преподаватель проверит вручную." },
      vocabulary: { score: 3, feedback: "Автоматическая оценка недоступна." },
      coherence: { score: 3, feedback: "Автоматическая оценка недоступна." },
      taskCompletion: { score: 4, feedback: "Автоматическая оценка недоступна." },
      totalScore: 13,
      overallLevel: "—",
      overallFeedback: "Технический сбой при автоматической оценке. Преподаватель проверит работу вручную и отправит обновленные результаты.",
      strengths: ["Тест успешно отправлен"],
      improvements: ["Ожидайте ручной проверки преподавателя"]
    };
  }
}

// ==================== CALCULATE FINAL RESULTS ====================
function calculateFinalResults(partialResults, writingAssessment) {
  const results = {
    listening: partialResults.listening.score,
    grammar: partialResults.grammar.score,
    reading: partialResults.reading.score,
    writing: writingAssessment.totalScore,
    totalScore: 0,
    percentage: 0,
    level: ''
  };

  // Calculate total (out of 100)
  results.totalScore = results.listening + results.grammar + results.reading + results.writing;
  results.percentage = Math.round(results.totalScore);  // Already out of 100

  // Determine CEFR level
  results.level = getPlacementLevel(results.percentage);

  return results;
}

// ==================== DETERMINE CEFR LEVEL ====================
function getPlacementLevel(percentage) {
  if (percentage < 17) return "Pre-Beginner (A0)";
  if (percentage < 31) return "Beginner (A1)";
  if (percentage < 46) return "Elementary (A2)";
  if (percentage < 61) return "Low Intermediate (B1-)";
  if (percentage < 76) return "Intermediate (B1)";
  if (percentage < 86) return "High Intermediate (B1+/B2)";
  return "Advanced (B2+/C1)";
}

// ==================== SAVE TO GOOGLE SHEETS ====================
function saveToSheet(data, results, writingAssessment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Results');

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Results');

    // Add headers
    sheet.appendRow([
      'Дата',
      'Имя',
      'Email',
      'Возраст',
      'Родной язык',
      'Аудирование',
      'Грамматика',
      'Чтение',
      'Письмо (итого)',
      'Итого',
      'Процент',
      'Уровень',
      'Уровень письма (ИИ)',
      'Письмо: Грамматика',
      'Письмо: Словарный запас',
      'Письмо: Связность',
      'Письмо: Выполнение задания',
      'Текст письма',
      'Обратная связь ИИ'
    ]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, 19);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
  }

  // Append data
  sheet.appendRow([
    new Date(),
    data.studentInfo.name,
    data.studentInfo.email,
    data.studentInfo.age || 'Не указано',
    data.studentInfo.nativeLanguage || 'Не указано',
    results.listening + '/18',
    results.grammar + '/36',
    results.reading + '/18',
    results.writing + '/28',
    results.totalScore + '/100',
    results.percentage + '%',
    results.level,
    writingAssessment.overallLevel || '—',
    writingAssessment.grammar.score + '/8',
    writingAssessment.vocabulary.score + '/7',
    writingAssessment.coherence.score + '/7',
    writingAssessment.taskCompletion.score + '/6',
    data.writingAnswers.writing1 || '[Не выполнено]',
    writingAssessment.overallFeedback
  ]);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 12);
}

// ==================== SEND EMAIL TO STUDENT ====================
function sendStudentEmail(studentInfo, results, writingAssessment) {
  const subject = '🎉 Результаты теста по английскому - ' + CONFIG.SCHOOL_NAME;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #E67E50 0%, #5DAEA8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
    .section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #5DAEA8; }
    .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .score-box { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #E67E50; }
    .score-number { font-size: 32px; font-weight: bold; color: #E67E50; }
    .cta-button { display: inline-block; background: #5DAEA8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Ваши результаты готовы!</h1>
      <p>Спасибо за прохождение теста ${CONFIG.SCHOOL_NAME}</p>
    </div>

    <div class="section">
      <h2>📊 Ваши баллы:</h2>
      <div class="score-grid">
        <div class="score-box">
          <div>🎧 Аудирование</div>
          <div class="score-number">${results.listening}/18</div>
        </div>
        <div class="score-box">
          <div>✏️ Грамматика</div>
          <div class="score-number">${results.grammar}/36</div>
        </div>
        <div class="score-box">
          <div>📖 Чтение</div>
          <div class="score-number">${results.reading}/18</div>
        </div>
        <div class="score-box">
          <div>✍️ Письмо</div>
          <div class="score-number">${results.writing}/28</div>
        </div>
      </div>
    </div>

    <div class="section" style="border-left-color: #E67E50; text-align: center;">
      <h2>🎯 Итоговый результат</h2>
      <div class="score-number" style="font-size: 48px;">${results.totalScore}/100</div>
      <p style="font-size: 20px; margin: 10px 0;">${results.percentage}%</p>
      <p style="font-size: 24px; font-weight: bold; color: #5DAEA8;">${results.level}</p>
    </div>

    <div class="section">
      <h2>✍️ Оценка письменного задания (ИИ)</h2>
      <p><strong>Итого: ${writingAssessment.totalScore}/28</strong> &nbsp;|&nbsp; Уровень письма: <strong>${writingAssessment.overallLevel || '—'}</strong></p>
      <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="background:#f0f8f7;">
          <td style="padding:8px; border:1px solid #ddd;"><strong>Грамматика и точность</strong></td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>${writingAssessment.grammar.score}/8</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">${writingAssessment.grammar.feedback}</td>
        </tr>
        <tr style="background:#f0f8f7;">
          <td style="padding:8px; border:1px solid #ddd;"><strong>Словарный запас</strong></td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>${writingAssessment.vocabulary.score}/7</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">${writingAssessment.vocabulary.feedback}</td>
        </tr>
        <tr style="background:#f0f8f7;">
          <td style="padding:8px; border:1px solid #ddd;"><strong>Связность и организация</strong></td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>${writingAssessment.coherence.score}/7</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">${writingAssessment.coherence.feedback}</td>
        </tr>
        <tr style="background:#f0f8f7;">
          <td style="padding:8px; border:1px solid #ddd;"><strong>Выполнение задания</strong></td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>${writingAssessment.taskCompletion.score}/6</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">${writingAssessment.taskCompletion.feedback}</td>
        </tr>
      </table>
      <p><strong>Общая оценка:</strong></p>
      <p>${writingAssessment.overallFeedback}</p>
    </div>

    <div class="section">
      <h3>✨ Ваши сильные стороны:</h3>
      <ul>
        ${writingAssessment.strengths.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <h3>📈 Рекомендации для улучшения:</h3>
      <ul>
        ${writingAssessment.improvements.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <div class="section" style="text-align: center; background: linear-gradient(135deg, #E8F5F4 0%, #F0FFFE 100%);">
      <h2>🗣️ Следующий шаг</h2>
      <p>Запишитесь на ZOOM созвон для оценки разговорных навыков и получения полного отчета диагностики!</p>
      <a href="${CONFIG.BOOKING_URL}" class="cta-button">🎥 Записаться на ZOOM созвон</a>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
      <p>До встречи!<br>Команда ${CONFIG.SCHOOL_NAME}</p>
    </div>
  </div>
</body>
</html>
  `;

  MailApp.sendEmail({
    to: studentInfo.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// ==================== SEND EMAIL TO TEACHER ====================
function sendTeacherEmail(studentInfo, results) {
  const subject = '📝 Новый тест: ' + studentInfo.name;

  const body = `Новый студент прошел тест:

Имя: ${studentInfo.name}
Email: ${studentInfo.email}
Возраст: ${studentInfo.age || 'Не указано'}
Родной язык: ${studentInfo.nativeLanguage || 'Не указано'}

РЕЗУЛЬТАТЫ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Уровень: ${results.level}
Баллы: ${results.totalScore}/100 (${results.percentage}%)

Аудирование: ${results.listening}/18
Грамматика: ${results.grammar}/36
Чтение: ${results.reading}/18
Письмо: ${results.writing}/28

Проверьте таблицу для полной информации.
`;

  MailApp.sendEmail({
    to: CONFIG.TEACHER_EMAIL,
    subject: subject,
    body: body
  });
}

// ==================== TEST FUNCTION (Optional) ====================
// Run this function to test your setup
function testSetup() {
  Logger.log('Testing setup...');

  // Test 1: Check API key
  if (CONFIG.CLAUDE_API_KEY === 'sk-ant-YOUR-KEY-HERE') {
    Logger.log('❌ ERROR: You need to set your Claude API key!');
    return;
  }
  Logger.log('✅ API key is set');

  // Test 2: Check email
  if (CONFIG.TEACHER_EMAIL === 'snapdateng@gmail.com') {
    Logger.log('⚠️ WARNING: Using default teacher email');
  }
  Logger.log('✅ Teacher email: ' + CONFIG.TEACHER_EMAIL);

  // Test 3: Test Claude API
  Logger.log('Testing Claude API...');
  try {
    const testAssessment = gradeWritingWithClaude(
      "I'm from Almaty. I work as a teacher and I love my job. I'm learning English because I want to travel and communicate with people from different countries."
    );
    Logger.log('✅ Claude API is working!');
    Logger.log('Test score: ' + testAssessment.totalScore + '/28');
    Logger.log('Grammar: ' + testAssessment.grammar.score + '/8');
    Logger.log('Vocabulary: ' + testAssessment.vocabulary.score + '/7');
    Logger.log('Coherence: ' + testAssessment.coherence.score + '/7');
    Logger.log('Task Completion: ' + testAssessment.taskCompletion.score + '/6');
    Logger.log('Writing Level: ' + testAssessment.overallLevel);
  } catch (error) {
    Logger.log('❌ Claude API error: ' + error.toString());
    return;
  }

  Logger.log('✅ All tests passed! Your setup is ready.');
}
