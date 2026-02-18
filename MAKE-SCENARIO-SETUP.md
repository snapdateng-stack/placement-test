# Make.com Scenario Setup — SNAP DAT Placement Test

## Architecture

```
index.html → POST JSON → Make.com Webhook
                                ↓
                    [1] Save row to Google Sheets
                                ↓
                    [2] HTTP Request → Claude API (grade writing)
                                ↓
                    [3] Parse JSON response
                                ↓
                    [4] Update Sheet row with writing scores
                                ↓
                    [5] Send student email (Gmail)
                                ↓
                    [6] Send teacher email (Gmail)
```

No Google Apps Script needed. Everything runs in Make.com.

---

## Step 1 — Create the Webhook

1. Go to **make.com → Create a new scenario**
2. Click the `+` to add the first module
3. Search for **Webhooks** → choose **Custom webhook**
4. Click **Add** → name it `Placement Test`
5. Click **Copy address** — this is your webhook URL
6. Paste it into `index.html`:
   ```javascript
   MAKE_WEBHOOK_URL: 'https://hook.eu2.make.com/xxxxxxxxxxxx'
   ```
7. Click **OK** → Make.com will wait for the first request to detect the data structure
8. Open the test in your browser, fill out your own name/email, complete the test and submit
9. Make.com will say "Successfully determined" — click **OK**

---

## Step 2 — Save Row to Google Sheets

1. Click `+` after the Webhook module
2. Search **Google Sheets** → **Add a Row**
3. Connect your Google account if not already connected
4. **Spreadsheet**: select your Google Sheet
5. **Sheet**: select or create a sheet called `Submissions`
6. Map these columns (drag from the webhook data on the left):

| Column | Value from webhook |
|--------|-------------------|
| A — Timestamp | `timestamp` |
| B — Name | `studentInfo` → `name` |
| C — Email | `studentInfo` → `email` |
| D — Age | `studentInfo` → `age` |
| E — Native Language | `studentInfo` → `nativeLanguage` |
| F — Listening | `results` → `listening` → `score` |
| G — Grammar | `results` → `grammar` → `score` |
| H — Reading | `results` → `reading` → `score` |
| I — Writing Text | `writingAnswers` → `writing1` |
| J — Writing Score | *(leave blank — filled later)* |
| K — Total Score | *(leave blank — filled later)* |
| L — CEFR Level | *(leave blank — filled later)* |
| M — AI Feedback | *(leave blank — filled later)* |
| N — Email Sent | *(leave blank — filled later)* |

---

## Step 3 — Call Claude API to Grade Writing

1. Click `+` → search **HTTP** → **Make a Request**
2. Configure:

**URL:**
```
https://api.anthropic.com/v1/messages
```

**Method:** `POST`

**Headers** (add each one separately):
| Header | Value |
|--------|-------|
| `x-api-key` | `sk-ant-YOUR-KEY-HERE` |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

**Body type:** `Raw`

**Content type:** `application/json`

**Request content** (paste this exactly — replace `{{1.writingAnswers.writing1}}` by clicking inside and selecting the field from the dropdown):
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1500,
  "temperature": 0.3,
  "messages": [
    {
      "role": "user",
      "content": "Ты — дружелюбный преподаватель английского языка. Твоя задача — оценить короткое письменное задание студента и дать обратную связь на простом, понятном русском языке.\n\nСтудент выбрал ОДИН из вариантов и написал 3–5 предложений на английском:\nВариант A: Tell us a little about yourself — where you're from, what you do, and why you're learning English.\nВариант B: What is one thing you like (or dislike) about your city or country? Explain why.\n\nКРИТЕРИИ ОЦЕНКИ (28 баллов):\n1. ГРАММАТИКА (0–8): 7-8=почти без ошибок; 5-6=мелкие ошибки; 3-4=ошибки но смысл понятен; 1-2=много ошибок; 0=текст слишком короткий\n2. СЛОВАРНЫЙ ЗАПАС (0–7): 6-7=разнообразные точные слова; 4-5=достаточно для задания; 2-3=небольшой запас; 1=очень ограниченный; 0=текст слишком короткий\n3. СВЯЗНОСТЬ ТЕКСТА (0–7): 6-7=мысли идут логично; 4-5=в целом понятно; 2-3=простые связки; 1=предложения не связаны; 0=текст слишком короткий\n4. ВЫПОЛНЕНИЕ ЗАДАНИЯ (0–6): 5-6=полностью отвечает на вопрос; 3-4=отвечает на основной вопрос; 1-2=ответ неполный; 0=не отвечает на вопрос\n\nПРАВИЛА:\n- Пиши на простом разговорном русском, как будто объясняешь другу\n- Обращайся к студенту на «вы»\n- Будь конкретным и отмечай что получилось даже у слабых работ\n- Для каждого критерия: 1–2 коротких предложения\n- ctaMessage: дружеское приглашение на ZOOM-созвон, без давления, 1–2 предложения\n\nТЕКСТ СТУДЕНТА:\n{{1.writingAnswers.writing1}}\n\nВерни ТОЛЬКО валидный JSON без markdown:\n{\"grammar\":{\"score\":0,\"feedback\":\"текст\"},\"vocabulary\":{\"score\":0,\"feedback\":\"текст\"},\"coherence\":{\"score\":0,\"feedback\":\"текст\"},\"taskCompletion\":{\"score\":0,\"feedback\":\"текст\"},\"totalScore\":0,\"overallLevel\":\"A1\",\"overallFeedback\":\"текст\",\"strengths\":[\"текст\",\"текст\"],\"improvements\":[\"текст\",\"текст\"],\"ctaMessage\":\"текст\"}"
    }
  ]
}
```

3. **Parse response:** turn on **Parse response**

---

## Step 4 — Parse Claude's JSON Response

1. Click `+` → search **JSON** → **Parse JSON**
2. **JSON string**: map to `data` → `content` → `[0]` → `text` from the HTTP module output

This gives you access to: `grammar.score`, `vocabulary.score`, `coherence.score`, `taskCompletion.score`, `totalScore`, `overallLevel`, `overallFeedback`, `strengths`, `improvements`, **`ctaMessage`**.

---

## Step 5 — Update Sheet Row with Writing Scores

1. Click `+` → **Google Sheets** → **Update a Row**
2. **Spreadsheet** + **Sheet**: same as Step 2
3. **Row number**: map to the row number output from the "Add a Row" module in Step 2
4. Map these cells:

| Column | Value |
|--------|-------|
| J — Writing Score | `totalScore` from JSON parse |
| K — Total Score | `{{6.grammar.score + 8.results.listening.score + 8.results.grammar.score + 8.results.reading.score}}` *(or calculate below)* |
| L — CEFR Level | `overallLevel` from JSON parse |
| M — AI Feedback | `overallFeedback` from JSON parse |

**Calculating Total Score (use a formula in Make.com):**
```
{{add(add(add(1.results.listening.score; 1.results.grammar.score); 1.results.reading.score); 4.totalScore)}}
```
*(where `1` = webhook module number, `4` = JSON parse module number — adjust to your actual module numbers)*

---

## Step 6 — Send Student Email

1. Click `+` → **Gmail** → **Send an Email**
2. Connect your Gmail account (snapdateng@gmail.com)
3. Configure:

**To:** `{{1.studentInfo.email}}`

**Subject:** `🎉 Результаты теста по английскому — SNAP DAT`

**Content** (HTML — turn on HTML mode):

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

  <div style="background: linear-gradient(135deg, #E67E50, #5DAEA8); color: white; padding: 30px; text-align: center; border-radius: 10px;">
    <h1>🎉 Ваши результаты готовы!</h1>
    <p>Спасибо за прохождение теста SNAP DAT</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #5DAEA8;">
    <h2>📊 Баллы по разделам:</h2>
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:10px; border:1px solid #ddd;">🎧 Аудирование</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold; font-size:20px; color:#E67E50;">{{1.results.listening.score}}/18</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px; border:1px solid #ddd;">✏️ Грамматика</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold; font-size:20px; color:#E67E50;">{{1.results.grammar.score}}/36</td>
      </tr>
      <tr>
        <td style="padding:10px; border:1px solid #ddd;">📖 Чтение</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold; font-size:20px; color:#E67E50;">{{1.results.reading.score}}/18</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px; border:1px solid #ddd;">✍️ Письмо</td>
        <td style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold; font-size:20px; color:#E67E50;">{{4.totalScore}}/28</td>
      </tr>
    </table>
  </div>

  <div style="background: #f0fffe; padding: 20px; margin: 20px 0; border-radius: 8px; border: 3px solid #5DAEA8; text-align:center;">
    <h2>🎯 Итоговый результат</h2>
    <div style="font-size: 48px; font-weight: bold; color: #E67E50;">{{add(add(add(1.results.listening.score; 1.results.grammar.score); 1.results.reading.score); 4.totalScore)}}/100</div>
    <div style="font-size: 24px; font-weight: bold; color: #5DAEA8; margin-top: 10px;">{{4.overallLevel}}</div>
  </div>

  <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #E67E50;">
    <h2>✍️ Оценка письменного задания</h2>
    <table style="width:100%; border-collapse:collapse;">
      <tr style="background:#f0f8f7;">
        <td style="padding:8px; border:1px solid #ddd;"><strong>Грамматика и точность</strong></td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>{{4.grammar.score}}/8</strong></td>
      </tr>
      <tr>
        <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">{{4.grammar.feedback}}</td>
      </tr>
      <tr style="background:#f0f8f7;">
        <td style="padding:8px; border:1px solid #ddd;"><strong>Словарный запас</strong></td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>{{4.vocabulary.score}}/7</strong></td>
      </tr>
      <tr>
        <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">{{4.vocabulary.feedback}}</td>
      </tr>
      <tr style="background:#f0f8f7;">
        <td style="padding:8px; border:1px solid #ddd;"><strong>Связность и организация</strong></td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>{{4.coherence.score}}/7</strong></td>
      </tr>
      <tr>
        <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">{{4.coherence.feedback}}</td>
      </tr>
      <tr style="background:#f0f8f7;">
        <td style="padding:8px; border:1px solid #ddd;"><strong>Выполнение задания</strong></td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center;"><strong>{{4.taskCompletion.score}}/6</strong></td>
      </tr>
      <tr>
        <td colspan="2" style="padding:6px 8px; border:1px solid #ddd; font-size:13px; color:#555;">{{4.taskCompletion.feedback}}</td>
      </tr>
    </table>
    <p style="margin-top:15px;"><strong>Общая оценка:</strong></p>
    <p>{{4.overallFeedback}}</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h3>✨ Ваши сильные стороны:</h3>
    <ul>
      <li>{{4.strengths[]}}</li>
    </ul>
    <h3>📈 Рекомендации для улучшения:</h3>
    <ul>
      <li>{{4.improvements[]}}</li>
    </ul>
  </div>

  <div style="background: linear-gradient(135deg, #E8F5F4, #F0FFFE); padding: 25px; margin: 20px 0; border-radius: 8px; border: 3px solid #5DAEA8; text-align:center;">
    <h2>🗣️ Следующий шаг</h2>
    <p style="font-size:16px; margin-bottom:20px;">{{4.ctaMessage}}</p>
    <a href="https://t.me/tyveric" style="display:inline-block; background:#5DAEA8; color:white; padding:15px 30px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:18px; margin-top:10px;">
      🎥 Записаться на ZOOM созвон
    </a>
  </div>

  <div style="text-align:center; margin-top:30px; color:#666; font-size:14px;">
    <p>До встречи!<br>Команда SNAP DAT</p>
  </div>

</div>
```

> **Note on `{{4.strengths[]}}` and `{{4.improvements[]}}`:** Make.com will repeat the `<li>` for each array item automatically when you use the array iterator syntax. In practice, map `strengths` → item 1 and item 2 separately if the iterator doesn't work.

---

## Step 7 — Send Teacher Notification

1. Click `+` → **Gmail** → **Send an Email**
2. **To:** `snapdateng@gmail.com`
3. **Subject:** `📝 Новый тест: {{1.studentInfo.name}}`
4. **Content:**
```
Новый студент прошел тест.

Имя: {{1.studentInfo.name}}
Email: {{1.studentInfo.email}}
Возраст: {{1.studentInfo.age}}
Родной язык: {{1.studentInfo.nativeLanguage}}

РЕЗУЛЬТАТЫ:
Уровень: {{4.overallLevel}}
Итого: {{add(add(add(1.results.listening.score; 1.results.grammar.score); 1.results.reading.score); 4.totalScore)}}/100

Аудирование: {{1.results.listening.score}}/18
Грамматика: {{1.results.grammar.score}}/36
Чтение: {{1.results.reading.score}}/18
Письмо: {{4.totalScore}}/28

Обратная связь ИИ: {{4.overallFeedback}}

Проверьте таблицу для полной информации.
```

---

## Step 8 — Turn on and Test

1. Click **Save** (floppy disk icon)
2. Toggle the scenario **ON** (bottom left switch)
3. Set schedule to **Instantly** (triggers immediately on each webhook hit)
4. Submit the test yourself with your real email
5. Check:
   - Google Sheet has a new row ✓
   - You received the student email ✓
   - snapdateng@gmail.com received teacher notification ✓
   - Check Make.com execution history for any errors

---

## Module Numbers Reference

After building, your scenario modules will be numbered. The `{{1.xxx}}` references above assume:
- Module 1 = Webhook
- Module 2 = Google Sheets (Add Row)
- Module 3 = HTTP (Claude API)
- Module 4 = JSON Parse
- Module 5 = Google Sheets (Update Row)
- Module 6 = Gmail (student)
- Module 7 = Gmail (teacher)

If your numbers differ, update the `{{X.xxx}}` references accordingly.

---

## Common Issues

**"Webhook not receiving data"**
- Check the URL in `index.html` matches exactly
- Make sure the scenario is toggled ON
- Check browser console for fetch errors

**"Claude API returns 401"**
- Your API key is wrong or expired
- Get a new key from console.anthropic.com

**"JSON Parse fails"**
- Claude returned markdown instead of raw JSON
- The prompt already says "no markdown" — but if it fails, add a Text Parser module before JSON Parse to strip ` ```json ` and ` ``` `

**"Email not sent"**
- Check Gmail module is connected to the right account
- Check Make.com execution log for the exact error
