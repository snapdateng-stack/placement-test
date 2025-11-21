import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { task1, task2 } = await request.json();
    
    if (!task1 || !task2) {
      return response.status(400).json({ error: 'Both writing tasks are required' });
    }

    console.log('Received writing tasks for assessment');
    
    const assessment = await assessWriting(task1, task2);
    return response.status(200).json(assessment);
  } catch (error) {
    console.error('AI assessment error:', error);
    return response.status(500).json({ error: 'Failed to assess writing: ' + error.message });
  }
}

async function assessWriting(task1, task2) {
  const prompt = `You are an expert CELTA/DELTA-qualified ESL teacher assessing student writing.\n\nTASK 1 (Daily Routine - 80-100 words expected):\n"${task1}"\n\nTASK 2 (Opinion Essay - 120-150 words expected):\n"${task2}"\n\nPlease assess both tasks and provide scores (0-5 for each task) based on:\n- Grammar accuracy\n- Vocabulary range\n- Task achievement\n- Coherence and organization\n- Spelling and punctuation\n\nRespond ONLY with valid JSON (no markdown, no backticks):\n{\n  "task1": {\n    "score": 0-5,\n    "grammar": "brief comment",\n    "vocabulary": "brief comment",\n    "taskAchievement": "brief comment",\n    "strengths": ["strength1", "strength2"],\n    "areasToImprove": ["area1", "area2"]\n  },\n  "task2": {\n    "score": 0-5,\n    "grammar": "brief comment",\n    "vocabulary": "brief comment",\n    "taskAchievement": "brief comment",\n    "coherence": "brief comment",\n    "strengths": ["strength1", "strength2"],\n    "areasToImprove": ["area1", "area2"]\n  },\n  "overallWritingLevel": "A1/A2/B1/B2/C1",\n  "recommendation": "brief overall recommendation in Russian"\n}`;

  const completion = await openai.chat.completions.create({
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
  
  let content = completion.choices[0].message.content;
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(content);
}
