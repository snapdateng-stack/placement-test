// ==================== UPDATES FOR index.html ====================
// Replace the CONFIG section (around line 905) with this:

const CONFIG = {
    // ⚠️ REQUIRED: Paste your Google Apps Script Web App URL here
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',  // ← CHANGE THIS!

    // ZOOM/Telegram booking link
    BOOKING_URL: 'https://t.me/tyveric',  // ← Update if needed

    // School name
    SCHOOL_NAME: 'SNAP DAT - школа английского языка'
};

// ==================== UPDATE calculateResults() function ====================
// Replace the existing calculateResults() function (around line 1968) with this:

function calculateResults() {
    const results = {
        listening: {
            score: 0,
            max: 18,
            byLevel: {
                beginner: { score: 0, total: 4 },
                intermediate: { score: 0, total: 4 },
                advanced: { score: 0, total: 4 }
            }
        },
        grammar: {
            score: 0,
            max: 36,
            byLevel: {
                beginner: { score: 0, total: 6 },
                intermediate: { score: 0, total: 6 },
                advanced: { score: 0, total: 6 }
            }
        },
        reading: {
            score: 0,
            max: 18,
            byLevel: {
                beginner: { score: 0, total: 4 },
                intermediate: { score: 0, total: 4 },
                advanced: { score: 0, total: 4 }
            }
        },
        totalScore: 0,
        maxScore: 72,  // Without writing (writing is 28 points, added by backend)
        percentage: 0
    };

    // Score listening
    testData.listening.questions.forEach(q => {
        if (currentState.answers[q.id] === q.correct) {
            results.listening.score += q.points;
            results.listening.byLevel[q.level].score++;
        }
    });

    // Score grammar
    testData.grammar.questions.forEach(q => {
        if (currentState.answers[q.id] === q.correct) {
            results.grammar.score += q.points;
            results.grammar.byLevel[q.level].score++;
        }
    });

    // Score reading
    testData.reading.passages.forEach(passage => {
        passage.questions.forEach(q => {
            if (currentState.answers[q.id] === q.correct) {
                results.reading.score += q.points;
                results.reading.byLevel[q.level].score++;
            }
        });
    });

    results.totalScore = results.listening.score + results.grammar.score + results.reading.score;
    // Note: Percentage is calculated on backend after adding writing score (out of 100)
    results.percentage = Math.round((results.totalScore / results.maxScore) * 100);

    return results;
}

// ==================== REPLACE finishTest() function ====================
// Replace the existing finishTest() function (around line 2054) with this NEW version:

function finishTest() {
    const container = document.getElementById('testContainer');

    // Show loading screen
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Обработка результатов...</p>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
                Идет проверка ответов и оценка письменных работ с помощью ИИ
            </p>
        </div>
    `;

    // Calculate results (without writing)
    const results = calculateResults();

    // Prepare data to send to Google Apps Script
    const exportData = {
        timestamp: new Date().toISOString(),
        studentInfo: currentState.studentInfo,
        results: results,
        answers: currentState.answers,
        writingAnswers: currentState.writingAnswers
    };

    // Send to Google Apps Script
    fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',  // Important for Apps Script CORS
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportData)
    })
    .then(() => {
        // Show confirmation screen (Option B - NO results displayed)
        setTimeout(() => {
            showConfirmationScreen();
        }, 2000);  // Small delay to show processing
    })
    .catch(error => {
        console.error('Submission error:', error);
        // Still show confirmation since no-cors doesn't return errors
        setTimeout(() => {
            showConfirmationScreen();
        }, 2000);
    });

    // Hide timer
    document.getElementById('timer').style.display = 'none';

    // Clear state
    clearState();
}

// ==================== NEW FUNCTION: showConfirmationScreen() ====================
// Add this NEW function after finishTest():

function showConfirmationScreen() {
    const container = document.getElementById('testContainer');

    // Option B: Show confirmation message with ZOOM booking CTA
    container.innerHTML = `
        <div class="screen active">
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 72px; margin-bottom: 20px;">✅</div>

                <h2 style="color: var(--navy-blue); font-size: 32px; margin-bottom: 20px;">
                    Тест успешно отправлен!
                </h2>

                <div style="background: linear-gradient(135deg, var(--cream) 0%, #FFF8EE 100%);
                            padding: 30px;
                            border-radius: 12px;
                            border-left: 4px solid var(--primary-orange);
                            margin: 30px 0;
                            text-align: left;">
                    <p style="font-size: 18px; line-height: 1.8; margin-bottom: 15px;">
                        📝 Идет проверка ответов и письма.
                    </p>
                    <p style="font-size: 18px; line-height: 1.8; margin-bottom: 15px;">
                        📧 <strong>Проверьте почту через 1-2 минуты.</strong>
                    </p>
                    <p style="font-size: 18px; line-height: 1.8; color: var(--text-dark);">
                        А пока вы ждете, запишитесь на созвон в ZOOM для оценки разговорных навыков
                        и получения полного отчета диагностики!
                    </p>
                </div>

                <div style="background: linear-gradient(135deg, #E8F5F4 0%, #F0FFFE 100%);
                            padding: 25px;
                            border-radius: 12px;
                            border: 3px solid var(--primary-teal);
                            margin: 30px 0;">
                    <p style="font-size: 16px; color: var(--text-light); margin-bottom: 15px;">
                        📧 Результаты будут отправлены на:
                    </p>
                    <p style="font-size: 18px; font-weight: 600; color: var(--navy-blue); margin-bottom: 25px;">
                        ${currentState.studentInfo.email}
                    </p>

                    <a href="${CONFIG.BOOKING_URL}"
                       class="cta-button"
                       target="_blank"
                       style="display: inline-block;
                              padding: 18px 40px;
                              background: linear-gradient(135deg, var(--primary-teal) 0%, var(--accent-green) 100%);
                              color: var(--white);
                              text-decoration: none;
                              border-radius: 10px;
                              font-weight: 600;
                              font-size: 18px;
                              transition: all 0.3s;">
                        🎥 Записаться на ZOOM созвон
                    </a>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: var(--light-gray); border-radius: 10px;">
                    <p style="font-size: 14px; color: var(--text-light); line-height: 1.6;">
                        💡 <strong>Что дальше?</strong><br>
                        1. Проверьте почту (через 1-2 минуты)<br>
                        2. Получите полные результаты с оценкой письма<br>
                        3. Запишитесь на устное собеседование<br>
                        4. Начните обучение на вашем уровне!
                    </p>
                </div>
            </div>
        </div>
    `;

    // Scroll to top
    window.scrollTo(0, 0);
}

// ==================== REMOVE/COMMENT OUT OLD FUNCTIONS ====================
// You can delete or comment out these old functions (they're not needed anymore):
// - exportToGoogleSheets()
// - submitToGoogleForm()

// The old results screen in HTML is also not used anymore, but you can leave it for now.
