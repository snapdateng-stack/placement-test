import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentInfo, results, placement, writingAnswers, aiFeedback } = await request.json();
    
    console.log('Sending email for:', studentInfo?.name);
    
    await sendEmail(studentInfo, results, placement, writingAnswers, aiFeedback);
    return response.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return response.status(500).json({ error: 'Failed to send email' });
  }
}

async function sendEmail(studentInfo, results, placement, writingAnswers, aiFeedback) {
  const emailHtml = `
    <h2>New English Test Result</h2>
    <p><strong>Student:</strong> ${studentInfo.name} (${studentInfo.email})</p>
    <p><strong>Score:</strong> ${results.totalScore}/${results.maxScore} (${results.percentage}%)</p>
    <p><strong>Level:</strong> ${placement.level}</p>
    <p><strong>Writing 1:</strong> ${writingAnswers.writing1?.substring(0, 200)}...</p>
    <p><strong>Writing 2:</strong> ${writingAnswers.writing2?.substring(0, 200)}...</p>
  `;
  
  await resend.emails.send({
    from: 'English Test <onboarding@resend.dev>',
    to: 'snapdateng@gmail.com',
    subject: `Test Results - ${studentInfo.name}`,
    html: emailHtml,
  });
}
