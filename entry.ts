import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { invokeLLM } from '../../shared/llm.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, history } = body;
    if (!message) return Response.json({ error: 'A message is required' }, { status: 400 });

    const historyText = Array.isArray(history) && history.length > 0
      ? history.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : 'none';

    const prompt = `You are an AI workplace productivity assistant. You help professionals with their daily work: drafting communications, summarizing information, planning tasks, brainstorming, and answering work-related questions. Be concise, practical, and helpful.

Conversation so far:
${historyText}

User's new message: ${message}

Respond helpfully and directly. Use short paragraphs or bullet points where appropriate. Do not use markdown headings.`;

    const result = await invokeLLM(base44, prompt, null);
    const reply = typeof result === 'string' ? result : (result && result.reply) || JSON.stringify(result);
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
