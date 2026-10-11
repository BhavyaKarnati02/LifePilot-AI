
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || '').trim();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    const prompt = `
You are LifePilot, a concise goal-management agent.
Use the supplied goals, memories, and conversation.
Help the user act, track, and adapt goals.
Never invent completed work.

USER: ${message}
GOALS: ${JSON.stringify(body.goals || [])}
MEMORY: ${JSON.stringify(body.memory || [])}
HISTORY: ${JSON.stringify(body.history || [])}

Respond concisely and actionably.
`;

    const ollamaUrl =
      process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

    const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
      console.error('Ollama returned status:', response.status);

      return NextResponse.json(
        { error: 'The AI agent is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const result = await response.json();
    const answer = result.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: 'The AI returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error('LifePilot Agent error:', error);

    return NextResponse.json(
      { error: 'Could not reach the AI agent. Check that Ollama is running.' },
      { status: 503 }
    );
  }
}
