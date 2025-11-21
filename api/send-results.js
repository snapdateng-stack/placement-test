import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentInfo, results, placement, writingAnswers, aiFeedback } = await req.json();
    await sendEmail(studentInfo, results, placement, writingAnswers, aiFeedback);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

async function sendEmail(studentInfo, results, placement, writingAnswers, aiFeedback) {
  const emailHtml = generateEmailHTML(studentInfo, results, placement, writingAnswers, aiFeedback);
  
  await resend.emails.send({
    from: 'English Test <onboarding@resend.dev>',
    to: 'snapdateng@gmail.com',
    subject: `New English Placement Test Result - ${studentInfo.name}`,
    html: emailHtml,
  });
}

function generateEmailHTML(studentInfo, results, placement, writingAnswers, aiFeedback) {
  return `
    <h1>New English Placement Test Result</h1>
    <h2>Student Information</h2>
    <p><strong>Name:</strong> ${studentInfo.name}</p>
    <p><strong>Email:</strong> ${studentInfo.email}</p>
    <p><strong>Age:</strong> ${studentInfo.age || 'Not provided'}</p>
    <p><strong>Native Language:</strong> ${studentInfo.nativeLanguage || 'Not provided'}</p>
    
    <h2>Test Results</h2>
    <p><strong>Total Score:</strong> ${results.totalScore}/${results.maxScore} (${results.percentage}%)</p>
    <p><strong>Placement Level:</strong> ${placement.level}</p>
    
    <h3>Section Breakdown</h3>
    <ul>
      <li>Listening: ${results.listening.score}/${results.listening.max}</li>
      <li>Grammar: ${results.grammar.score}/${results.grammar.max}</li>
      <li>Reading: ${results.reading.score}/${results.reading.max}</li>
    </ul>
    
    <h2>Writing Tasks</h2>
    <h3>Task 1 (Daily Routine):</h3>
    <p>${writingAnswers.writing1 || 'Not completed'}</p>
    
    <h3>Task 2 (Opinion Essay):</h3>
    <p>${writingAnswers.writing2 || 'Not completed'}</p>
    
    ${aiFeedback ? `
    <h2>AI Assessment</h2>
    <pre>${JSON.stringify(aiFeedback, null, 2)}</pre>
    ` : ''}
  `;
}
