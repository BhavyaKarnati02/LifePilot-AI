
export type PlannerTask = {
  title: string
  dueOffset: number
  duration: string
  purpose: string
  steps: string[]
  result: string
}

export type PlannerResult = {
  description: string
  category: string
  deadlineOffset: number
  outcomes: string[]
  milestones: string[]
  tasks: PlannerTask[]
}

function parsePlannerJson(text: string): PlannerResult {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start < 0 || end <= start) {
    throw new Error(
      'AI returned an invalid plan. Please try again.',
    )
  }

  let parsed: any

  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    throw new Error(
      'AI returned invalid JSON. Please try again.',
    )
  }

  if (
    !parsed ||
    !Array.isArray(parsed.tasks) ||
    parsed.tasks.length === 0
  ) {
    throw new Error(
      'AI returned an empty plan. Please try again.',
    )
  }

  return {
    description: String(parsed.description || ''),
    category: String(parsed.category || 'Personal'),
    deadlineOffset: Math.max(
      1,
      Number(parsed.deadlineOffset) || 30,
    ),
    outcomes: Array.isArray(parsed.outcomes)
      ? parsed.outcomes.map(String).slice(0, 6)
      : [],
    milestones: Array.isArray(parsed.milestones)
      ? parsed.milestones.map(String).slice(0, 8)
      : [],
    tasks: parsed.tasks
      .slice(0, 20)
      .map((task: any): PlannerTask => ({
        title: String(
          task?.title || 'Work on the goal',
        ),
        dueOffset: Math.max(
          1,
          Number(task?.dueOffset) || 1,
        ),
        duration: String(task?.duration || '30 min'),
        purpose: String(task?.purpose || ''),
        steps: Array.isArray(task?.steps)
          ? task.steps.map(String).slice(0, 8)
          : [],
        result: String(task?.result || ''),
      })),
  }
}

async function askAI(
  prompt: string,
): Promise<PlannerResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model =
    process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured.',
    )
  }

  let response: Response

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  'You are LifePilot, a practical goal-planning assistant. Follow the user prompt carefully. Return only one valid JSON object without Markdown fences or extra text.',
              },
            ],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.35,
            maxOutputTokens: 8192,
          },
        }),
        signal: AbortSignal.timeout(120000),
      },
    )
  } catch (error) {
    console.error('Gemini connection failed:', error)

    throw new Error(
      'Cannot connect to the AI service. Please try again.',
    )
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')

    console.error('Gemini API error:', response.status, JSON.stringify(detail, null, 2))

    throw new Error(
      `AI request failed (${response.status}). Check the API key, model, and quota.`,
    )
  }

  const data = await response.json()

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('')

  if (!text?.trim()) {
    throw new Error(
      'AI returned an empty response. Please try again.',
    )
  }

  return parsePlannerJson(text)
}

export async function generateGoalPlan(input: {
  title: string
  details: string
  memories: Array<{
    label: string
    value: string
    category?: string
  }>
}): Promise<PlannerResult> {
  const memoryText = input.memories
    .map(
      (m) =>
        `- ${m.category || 'context'}: ${m.label} = ${m.value}`,
    )
    .join('\n')

  return askAI(`
You are LifePilot's universal goal-planning engine.

Create a genuinely goal-specific plan for the user's exact goal.

Rules:
- Do NOT use a generic five-task template.
- Do NOT assume the goal is academic, fitness, career, travel, finance, or software unless the user says so.
- Derive outcomes, milestones, and tasks from the actual goal.
- Use the user's relevant memory and additional context.
- Make tasks concrete, actionable, and realistic.
- Order tasks logically from the first action to the final outcome.
- Use dueOffset as days from today.
- Create 8-14 meaningful tasks when appropriate.
- Each task must explain its purpose, steps, duration, and expected result.
- Return only valid JSON matching the requested structure.

Goal:
${input.title}

Additional context:
${input.details || 'None provided'}

Relevant user memory:
${memoryText || 'None provided'}

Return ONLY valid JSON with this exact structure:
{
  "description": "short personalized description",
  "category": "one concise category",
  "deadlineOffset": 30,
  "outcomes": ["specific outcome 1", "specific outcome 2"],
  "milestones": ["specific milestone 1", "specific milestone 2"],
  "tasks": [
    {
      "title": "specific actionable task",
      "dueOffset": 1,
      "duration": "45 min",
      "purpose": "why this task matters",
      "steps": ["step 1", "step 2"],
      "result": "what should exist or be achieved after this task"
    }
  ]
}
`)
}

export async function replanGoal(input: {
  goal: any
  tasks: any[]
  reason: string
  memories: Array<{
    label: string
    value: string
    category?: string
  }>
}): Promise<PlannerResult> {
  const memoryText = input.memories
    .map(
      (m) =>
        `- ${m.category || 'context'}: ${m.label} = ${m.value}`,
    )
    .join('\n')

  return askAI(`
You are LifePilot's adaptive replanning engine.

Replan ONLY the remaining work for the user's existing goal.

Rules:
- Preserve the original goal's intent.
- Respect completed work; do not ask the user to repeat completed tasks.
- Adapt task order, timing, scope, duration, and priorities to the new situation.
- Consider the user's reason for requesting a change.
- Use relevant memory where useful.
- Do not merely rewrite the old task list.
- Generate 5-12 meaningful remaining tasks when appropriate.
- Use dueOffset as days from today.
- Return only valid JSON matching the requested structure.

Existing goal:
${JSON.stringify(input.goal)}

Current tasks:
${JSON.stringify(input.tasks)}

What changed:
${input.reason}

Relevant memory:
${memoryText || 'None provided'}

Return ONLY valid JSON using this structure:
{
  "description": "updated personalized description",
  "category": "one concise category",
  "deadlineOffset": 30,
  "outcomes": ["specific outcome 1", "specific outcome 2"],
  "milestones": ["specific milestone 1", "specific milestone 2"],
  "tasks": [
    {
      "title": "specific actionable remaining task",
      "dueOffset": 1,
      "duration": "30 min",
      "purpose": "why this matters now",
      "steps": ["step 1", "step 2"],
      "result": "expected result"
    }
  ]
}
`)
}
