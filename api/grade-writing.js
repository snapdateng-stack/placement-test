import { OpenAI } from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task1, task2 } = req.body;

  if (!task1 || !task2) {
    return res.status(400).json({ error: 'Both writing tasks are required' });
  }

  try {
    const assessment = await assessWriting(task1, task2);
    res.status(200).json(assessment);
  } catch (error) {
    console.error('AI assessment error:', error);
    res.status(500).json({ error: 'Failed to assess writing' });
  }
}

async function assessWriting(task1, task2) {
  const prompt = `You are an expert CELTA/DELTA-qualified ESL teacher...`; // Your existing prompt

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert ESL teacher. Respond only with valid JSON, no markdown.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  let content = response.choices[0].message.content;
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(content);
}
