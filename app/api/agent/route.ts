
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = String(body.message || '').trim()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    const model =
      process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured.')

      return NextResponse.json(
        { error: 'The AI service is not configured.' },
        { status: 500 },
      )
    }

    const prompt = `
You are LifePilot, a concise goal-management agent.

Use the supplied goals, memories, and conversation.
Help the user act, track, and adapt goals.
Never invent completed work.
Be practical, supportive, concise, and actionable.
When useful, suggest a concrete next step based on the user's goals.

USER:
${message}

GOALS:
${JSON.stringify(body.goals || [])}

MEMORY:
${JSON.stringify(body.memory || [])}

HISTORY:
${JSON.stringify(body.history || [])}

Respond concisely and actionably.
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
        signal: AbortSignal.timeout(60000),
      },
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => '')

      console.error(
        'Gemini agent API error:',
        response.status,
        detail,
      )

      return NextResponse.json(
        {
          error:
            'The AI agent is temporarily unavailable. Please try again.',
        },
        { status: 502 },
      )
    }

    const result = await response.json()

    const answer = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim()

    if (!answer) {
      console.error(
        'Gemini returned no text.',
        result?.promptFeedback,
      )

      return NextResponse.json(
        {
          error:
            'The AI returned an empty response. Please try again.',
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ response: answer })
  } catch (error) {
    console.error('LifePilot Agent error:', error)

    return NextResponse.json(
      {
        error:
          'Could not reach the AI service. Please try again.',
      },
      { status: 503 },
    )
  }
}
