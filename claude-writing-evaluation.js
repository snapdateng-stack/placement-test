// ==================== CLAUDE API WRITING EVALUATION ====================
// This is the UPDATED grading function for google-apps-script.js
// Replace the existing gradeWritingWithClaude() function with this version

function gradeWritingWithClaude(task1, task2) {
  // Validate inputs
  if (!task1 || task1.trim().length < 20) {
    task1 = '[Not completed]';
  }
  if (!task2 || task2.trim().length < 20) {
    task2 = '[Not completed]';
  }

  // ==================== CLAUDE API SYSTEM PROMPT ====================
  const systemPrompt = `You are an expert ESL teacher evaluating English placement test writing samples.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations outside the JSON.

SCORING RUBRIC (28 points total):

1. GRAMMAR & ACCURACY (0-8 points):
   - 7-8: Nearly error-free, complex structures used correctly
   - 5-6: Minor errors, good control of basic structures
   - 3-4: Noticeable errors but meaning is clear
   - 1-2: Frequent errors that impede communication
   - 0: Cannot assess due to insufficient text

2. VOCABULARY & RANGE (0-7 points):
   - 6-7: Wide range, precise word choice, appropriate collocations
   - 4-5: Adequate range for the task, some good vocabulary
   - 2-3: Limited range, basic vocabulary, some repetition
   - 1: Very limited vocabulary
   - 0: Cannot assess

3. COHERENCE & ORGANIZATION (0-7 points):
   - 6-7: Excellent structure, clear progression, effective linking
   - 4-5: Generally well-organized, adequate paragraphing
   - 2-3: Basic organization, limited use of cohesive devices
   - 1: Poor organization, difficult to follow
   - 0: Cannot assess

4. TASK COMPLETION (0-6 points):
   - 5-6: Fully addresses prompt, appropriate length, well-developed
   - 3-4: Addresses main points, adequate development
   - 1-2: Partially addresses prompt, underdeveloped
   - 0: Does not address prompt or too short

EVALUATION APPROACH:
- Evaluate BOTH tasks together as one writing sample
- Consider the tasks complement each other (Task 1 shows basic ability, Task 2 shows higher-level skills)
- Apply the rubric holistically across both tasks
- Total must equal 28 points or less

Your response must be valid JSON in this EXACT format:
{
  "grammar": {
    "score": [0-8],
    "feedback": "[2-3 sentences in Russian explaining the score]"
  },
  "vocabulary": {
    "score": [0-7],
    "feedback": "[2-3 sentences in Russian]"
  },
  "coherence": {
    "score": [0-7],
    "feedback": "[2-3 sentences in Russian]"
  },
  "taskCompletion": {
    "score": [0-6],
    "feedback": "[2-3 sentences in Russian]"
  },
  "totalScore": [sum of all scores, 0-28],
  "overallLevel": "[A1/A2/B1/B2/C1 - estimate based on writing]",
  "overallFeedback": "[3-4 sentences overall assessment in Russian]",
  "strengths": ["[strength 1 in Russian]", "[strength 2 in Russian]"],
  "improvements": ["[area 1 in Russian]", "[area 2 in Russian]"]
}`;

  // ==================== USER PROMPT WITH WRITING SAMPLES ====================
  const userPrompt = `Evaluate these two writing samples from an English placement test:

TASK 1 - Daily Routine (Target: 80-120 words, A1-A2 level):
Prompt: "Write about your typical day. What time do you wake up? What do you do during the day? What do you do during the evening? Use present simple tense."

Student response:
${task1}

---

TASK 2 - Opinion Essay (Target: 120-180 words, B1-B2 level):
Prompt: "Some people think that social media has more disadvantages than advantages. Do you agree or disagree? Give reasons and examples to support your opinion."

Student response:
${task2}

---

Evaluate BOTH tasks together using the 28-point rubric. Return ONLY the JSON response, no other text.`;

  // ==================== CALL CLAUDE API ====================
  const payload = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    temperature: 0.3,  // Lower temperature for consistent scoring
    messages: [
      {
        role: "user",
        content: systemPrompt + "\n\n" + userPrompt
      }
    ]
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
      Logger.log('Claude API Error - Status: ' + statusCode);
      Logger.log('Response: ' + response.getContentText());
      throw new Error('Claude API returned status ' + statusCode);
    }

    const result = JSON.parse(response.getContentText());

    // Extract content from Claude's response
    let content = result.content[0].text;

    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON
    const assessment = JSON.parse(content);

    // ==================== VALIDATE AND NORMALIZE SCORES ====================
    // Ensure all scores are within valid ranges
    assessment.grammar.score = Math.max(0, Math.min(8, assessment.grammar.score));
    assessment.vocabulary.score = Math.max(0, Math.min(7, assessment.vocabulary.score));
    assessment.coherence.score = Math.max(0, Math.min(7, assessment.coherence.score));
    assessment.taskCompletion.score = Math.max(0, Math.min(6, assessment.taskCompletion.score));

    // Recalculate total to ensure accuracy
    assessment.totalScore =
      assessment.grammar.score +
      assessment.vocabulary.score +
      assessment.coherence.score +
      assessment.taskCompletion.score;

    // Ensure total doesn't exceed 28
    assessment.totalScore = Math.min(28, assessment.totalScore);

    // Validate required fields exist
    if (!assessment.grammar || !assessment.vocabulary ||
        !assessment.coherence || !assessment.taskCompletion) {
      throw new Error('Invalid response structure from Claude');
    }

    Logger.log('Writing assessment complete. Total score: ' + assessment.totalScore + '/28');
    Logger.log('Breakdown: Grammar=' + assessment.grammar.score +
               ', Vocabulary=' + assessment.vocabulary.score +
               ', Coherence=' + assessment.coherence.score +
               ', Task=' + assessment.taskCompletion.score);

    return assessment;

  } catch (error) {
    Logger.log('ERROR in gradeWritingWithClaude: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);

    // ==================== FALLBACK ASSESSMENT ====================
    // Return a fallback assessment if Claude fails
    return {
      grammar: {
        score: 4,
        feedback: "Автоматическая оценка недоступна. Преподаватель проверит грамматику вручную."
      },
      vocabulary: {
        score: 3,
        feedback: "Автоматическая оценка недоступна. Преподаватель проверит словарный запас вручную."
      },
      coherence: {
        score: 3,
        feedback: "Автоматическая оценка недоступна. Преподаватель проверит организацию текста вручную."
      },
      taskCompletion: {
        score: 3,
        feedback: "Автоматическая оценка недоступна. Преподаватель проверит выполнение задания вручную."
      },
      totalScore: 13,
      overallLevel: "B1",
      overallFeedback: "Технический сбой при автоматической оценке. Преподаватель проверит ваши работы вручную и отправит обновленные результаты в течение 24 часов.",
      strengths: ["Тест успешно отправлен", "Ожидайте ручной проверки"],
      improvements: ["Результаты будут отправлены после проверки преподавателем"]
    };
  }
}

// ==================== UPDATED SAVE TO SHEETS FUNCTION ====================
// Replace the saveToSheet() function with this version to show the new rubric breakdown

function saveToSheet(data, results, writingAssessment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Results');

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Results');

    // Add headers with new rubric breakdown
    sheet.appendRow([
      'Дата',
      'Имя',
      'Email',
      'Возраст',
      'Родной язык',
      'Аудирование',
      'Грамматика',
      'Чтение',
      'Письмо (Всего)',
      'Письмо: Грамматика',
      'Письмо: Словарь',
      'Письмо: Связность',
      'Письмо: Выполнение',
      'Итого',
      'Процент',
      'Уровень',
      'Уровень письма (ИИ)',
      'Текст письма 1',
      'Текст письма 2',
      'Обратная связь ИИ'
    ]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, 20);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
  }

  // Append data with detailed rubric breakdown
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
    writingAssessment.grammar.score + '/8',
    writingAssessment.vocabulary.score + '/7',
    writingAssessment.coherence.score + '/7',
    writingAssessment.taskCompletion.score + '/6',
    results.totalScore + '/100',
    results.percentage + '%',
    results.level,
    writingAssessment.overallLevel || 'N/A',
    data.writingAnswers.writing1 || '[Не выполнено]',
    data.writingAnswers.writing2 || '[Не выполнено]',
    writingAssessment.overallFeedback
  ]);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 16);
}

// ==================== UPDATED EMAIL TO STUDENT ====================
// Replace sendStudentEmail() with this version to show the new rubric

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
    .rubric-item { display: flex; justify-content: space-between; padding: 10px; background: white; margin: 8px 0; border-radius: 5px; border-left: 3px solid #5DAEA8; }
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
      <h2>✍️ Детальная оценка письма (ИИ)</h2>
      <p><strong>Общий балл:</strong> ${results.writing}/28 баллов</p>
      <p><strong>Уровень письма:</strong> ${writingAssessment.overallLevel}</p>

      <h3 style="margin-top: 20px;">Оценка по критериям:</h3>

      <div class="rubric-item">
        <span><strong>Грамматика и точность</strong></span>
        <span style="color: #E67E50; font-weight: bold;">${writingAssessment.grammar.score}/8</span>
      </div>
      <p style="margin: 5px 0 15px 10px; font-size: 14px;">${writingAssessment.grammar.feedback}</p>

      <div class="rubric-item">
        <span><strong>Словарный запас</strong></span>
        <span style="color: #E67E50; font-weight: bold;">${writingAssessment.vocabulary.score}/7</span>
      </div>
      <p style="margin: 5px 0 15px 10px; font-size: 14px;">${writingAssessment.vocabulary.feedback}</p>

      <div class="rubric-item">
        <span><strong>Связность и организация</strong></span>
        <span style="color: #E67E50; font-weight: bold;">${writingAssessment.coherence.score}/7</span>
      </div>
      <p style="margin: 5px 0 15px 10px; font-size: 14px;">${writingAssessment.coherence.feedback}</p>

      <div class="rubric-item">
        <span><strong>Выполнение задания</strong></span>
        <span style="color: #E67E50; font-weight: bold;">${writingAssessment.taskCompletion.score}/6</span>
      </div>
      <p style="margin: 5px 0 15px 10px; font-size: 14px;">${writingAssessment.taskCompletion.feedback}</p>

      <p style="margin-top: 20px;"><strong>Общая оценка:</strong></p>
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

// ==================== TEST FUNCTION WITH NEW RUBRIC ====================
function testWritingEvaluation() {
  Logger.log('Testing writing evaluation with new rubric...');

  const testWriting1 = `I wake up at 7 AM every morning. First, I eat breakfast with my family. Then I go to work by bus. I work in an office from 9 to 5. After work, I go home and watch TV. I go to bed at 11 PM.`;

  const testWriting2 = `In my opinion, social media has both advantages and disadvantages, but I think the advantages are more important. First, social media helps us stay connected with friends and family who live far away. For example, I use WhatsApp to talk to my sister in another country. Second, we can learn new things from social media. However, some people spend too much time on social media and this is not healthy. In conclusion, I believe social media is good if we use it carefully.`;

  try {
    const result = gradeWritingWithClaude(testWriting1, testWriting2);

    Logger.log('\n=== WRITING EVALUATION RESULTS ===');
    Logger.log('Grammar & Accuracy: ' + result.grammar.score + '/8');
    Logger.log('Vocabulary & Range: ' + result.vocabulary.score + '/7');
    Logger.log('Coherence & Organization: ' + result.coherence.score + '/7');
    Logger.log('Task Completion: ' + result.taskCompletion.score + '/6');
    Logger.log('TOTAL: ' + result.totalScore + '/28');
    Logger.log('Overall Level: ' + result.overallLevel);
    Logger.log('\n✅ Test successful!');

    return result;
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    return null;
  }
}
