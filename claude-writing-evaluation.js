// ==================== CLAUDE API WRITING EVALUATION ====================
// Single short writing task (Duolingo-style), 4-criterion 28-point rubric.
// This mirrors the gradeWritingWithClaude() in google-apps-script.js.

function gradeWritingWithClaude(writingText) {
  // Validate input
  if (!writingText || writingText.trim().length < 10) {
    writingText = '[Not completed]';
  }

  // ==================== CLAUDE API PROMPT ====================
  const systemPrompt = `Ты — дружелюбный преподаватель английского языка. Твоя задача — оценить короткое письменное задание студента и дать обратную связь на простом, понятном русском языке.

Студент выбрал ОДИН из вариантов и написал 3–5 предложений на английском:
Вариант A: Tell us a little about yourself — where you're from, what you do, and why you're learning English.
Вариант B: What is one thing you like (or dislike) about your city or country? Explain why.

ВАЖНО: Отвечай ТОЛЬКО валидным JSON. Никакого markdown, никаких пояснений вне JSON.

КРИТЕРИИ ОЦЕНКИ (28 баллов):

1. ГРАММАТИКА (0–8 баллов):
   7–8: Почти без ошибок, уверенное использование разных конструкций
   5–6: Небольшие ошибки, основы грамматики используются правильно
   3–4: Есть ошибки, но смысл понятен
   1–2: Много ошибок, смысл местами трудно понять
   0: Текст слишком короткий для оценки

2. СЛОВАРНЫЙ ЗАПАС (0–7 баллов):
   6–7: Разнообразные, точно подобранные слова
   4–5: Достаточно слов для задания, иногда хорошие находки
   2–3: Небольшой запас, часто повторяются простые слова
   1: Очень ограниченный словарный запас
   0: Текст слишком короткий для оценки

3. СВЯЗНОСТЬ ТЕКСТА (0–7 баллов):
   6–7: Мысли идут логично, текст легко читается
   4–5: В целом понятно, есть связующие слова
   2–3: Простые связки (and/but/so), иногда мысли «прыгают»
   1: Предложения не связаны между собой
   0: Текст слишком короткий для оценки

4. ВЫПОЛНЕНИЕ ЗАДАНИЯ (0–6 баллов):
   5–6: Полностью отвечает на вопрос, достаточный объём
   3–4: Отвечает на основной вопрос, объём приемлемый
   1–2: Ответ неполный или текст слишком короткий
   0: Не отвечает на вопрос

ПРАВИЛА ДЛЯ ОБРАТНОЙ СВЯЗИ:
- Пиши на простом, разговорном русском языке — как будто объясняешь другу
- Обращайся к студенту на «вы»
- Будь конкретным: не просто «хорошая грамматика», а что именно хорошо
- Для каждого критерия: 1–2 коротких предложения
- Отмечай что получилось, даже у слабых работ
- Для улучшений: скажи что конкретно исправить или попрактиковать
- overallFeedback: 2–3 предложения, тёплый и честный итог
- ctaMessage: дружеское приглашение на ZOOM-созвон, без давления, 1–2 предложения

Формат ответа — строго этот JSON:
{
  "grammar": {
    "score": [0-8],
    "feedback": "[1-2 предложения на простом русском]"
  },
  "vocabulary": {
    "score": [0-7],
    "feedback": "[1-2 предложения на простом русском]"
  },
  "coherence": {
    "score": [0-7],
    "feedback": "[1-2 предложения на простом русском]"
  },
  "taskCompletion": {
    "score": [0-6],
    "feedback": "[1-2 предложения на простом русском]"
  },
  "totalScore": [сумма всех баллов, 0-28],
  "overallLevel": "[A1/A2/B1/B2/C1]",
  "overallFeedback": "[2-3 предложения — тёплый и честный итог на простом русском]",
  "strengths": ["[что получилось — конкретно, на русском]", "[второе сильное место]"],
  "improvements": ["[что улучшить — конкретный совет, на русском]", "[второй совет]"],
  "ctaMessage": "[1-2 предложения — дружеское приглашение на ZOOM-созвон с преподавателем]"
}`;

  // ==================== USER PROMPT WITH WRITING SAMPLE ====================
  const userPrompt = `Оцени это короткое письменное задание (цель: 3–5 предложений на английском):

${writingText}

Верни ТОЛЬКО JSON, без какого-либо текста вне него.`;

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
      grammar:        { score: 4, feedback: "Не удалось получить автоматическую оценку — преподаватель проверит вручную." },
      vocabulary:     { score: 3, feedback: "Не удалось получить автоматическую оценку — преподаватель проверит вручную." },
      coherence:      { score: 3, feedback: "Не удалось получить автоматическую оценку — преподаватель проверит вручную." },
      taskCompletion: { score: 3, feedback: "Не удалось получить автоматическую оценку — преподаватель проверит вручную." },
      totalScore: 13,
      overallLevel: "—",
      overallFeedback: "Произошёл технический сбой при проверке письма. Не переживайте — преподаватель свяжется с вами лично.",
      strengths: ["Вы прошли тест до конца — это уже хороший результат!"],
      improvements: ["Свяжитесь с преподавателем для получения подробной обратной связи"],
      ctaMessage: "Запишитесь на бесплатный ZOOM-созвон — преподаватель разберёт ваши результаты лично и ответит на все вопросы."
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

  const testWriting = `I'm from Almaty, Kazakhstan. I work as a marketing manager and I really enjoy my job. I'm learning English because I want to communicate with clients from different countries and travel more confidently.`;

  try {
    const result = gradeWritingWithClaude(testWriting);

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
