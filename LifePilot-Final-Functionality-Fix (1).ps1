$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
if (-not (Test-Path (Join-Path $root "package.json"))) {
  throw "Run this script from B:\amazon developer hackathon"
}

function Write-Text([string]$Path, [string]$Text) {
  $full = Join-Path $root $Path
  $dir = Split-Path -Parent $full
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  [System.IO.File]::WriteAllText($full, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

Write-Host "1/6 Checking Bedrock SDK..."
$pkg = Get-Content (Join-Path $root "package.json") -Raw
if ($pkg -notmatch '@aws-sdk/client-bedrock-runtime') {
  npm install @aws-sdk/client-bedrock-runtime
}

Write-Host "2/6 Writing universal AI planner..."

Write-Text "lib\ai-planner.ts" @'
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'

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

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
})

const modelId =
  process.env.BEDROCK_MODEL_ID ||
  'amazon.nova-lite-v1:0'

function extractText(result: any): string {
  return (
    result?.output?.message?.content
      ?.map((item: any) => item?.text || '')
      .join('') || ''
  )
}

function parsePlannerJson(text: string): PlannerResult {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start < 0 || end <= start) {
    throw new Error('AI returned an invalid plan.')
  }

  const parsed = JSON.parse(
    cleaned.slice(start, end + 1),
  ) as PlannerResult

  if (
    !parsed ||
    !Array.isArray(parsed.tasks) ||
    parsed.tasks.length === 0
  ) {
    throw new Error('AI returned an empty plan.')
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
    tasks: parsed.tasks.slice(0, 20).map((task) => ({
      title: String(task.title || 'Work on the goal'),
      dueOffset: Math.max(
        1,
        Number(task.dueOffset) || 1,
      ),
      duration: String(
        task.duration || '30 min',
      ),
      purpose: String(task.purpose || ''),
      steps: Array.isArray(task.steps)
        ? task.steps.map(String).slice(0, 8)
        : [],
      result: String(task.result || ''),
    })),
  }
}

async function askBedrock(prompt: string) {
  const command = new ConverseCommand({
    modelId,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 5000,
      temperature: 0.35,
    },
  })

  const response = await client.send(command)
  return parsePlannerJson(extractText(response))
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

  return askBedrock(`
You are LifePilot's universal goal-planning engine.

Create a genuinely goal-specific plan for the user's exact goal.
Do NOT use a generic five-task template.
Do NOT assume the goal is academic, fitness, career, travel, finance, or software unless the user says so.
The planning framework is universal, but the actual outcomes, milestones and tasks must be derived from the goal.

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
      "result": "what should exist/be achieved after this task"
    }
  ]
}

Create 8-14 meaningful tasks when appropriate. Use dueOffset as days from today.
Make tasks concrete enough that a person can actually execute them.
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

  return askBedrock(`
You are LifePilot's adaptive replanning engine.

Replan ONLY the remaining work for the user's existing goal.
Keep the original goal's intent and completed work.
Use the user's new constraint/change to intelligently adjust scope, order, timing, duration and priorities.
Do not merely rewrite the old task list.
Do not use a generic template.

Existing goal:
${JSON.stringify(input.goal)}

Current tasks:
${JSON.stringify(input.tasks)}

What changed:
${input.reason}

Relevant memory:
${memoryText || 'None provided'}

Return ONLY valid JSON using the same structure:
{
  "description": "updated personalized description",
  "category": "one concise category",
  "deadlineOffset": 30,
  "outcomes": ["..."],
  "milestones": ["..."],
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

Generate 5-12 remaining tasks appropriate to the changed situation.
`)
}
'@

Write-Host "3/6 Writing API routes..."

Write-Text "app\api\plan\route.ts" @'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateGoalPlan } from '@/lib/ai-planner'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const title = String(body.title || '').trim()
    const details = String(body.details || '').trim()
    const memories = Array.isArray(body.memories)
      ? body.memories
      : []

    if (!title) {
      return NextResponse.json(
        { error: 'Goal title is required.' },
        { status: 400 },
      )
    }

    const plan = await generateGoalPlan({
      title,
      details,
      memories,
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Plan API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not generate AI plan.',
      },
      { status: 500 },
    )
  }
}
'@

Write-Text "app\api\replan\route.ts" @'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { replanGoal } from '@/lib/ai-planner'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = await request.json()

    if (!body.goal?.id || !String(body.reason || '').trim()) {
      return NextResponse.json(
        { error: 'Goal and change reason are required.' },
        { status: 400 },
      )
    }

    const { data: ownedGoal, error: goalError } =
      await supabase
        .from('goals')
        .select('*')
        .eq('id', body.goal.id)
        .eq('user_id', user.id)
        .single()

    if (goalError || !ownedGoal) {
      return NextResponse.json(
        { error: 'Goal not found.' },
        { status: 404 },
      )
    }

    const { data: currentTasks } =
      await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', ownedGoal.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    const { data: memories } =
      await supabase
        .from('memories')
        .select('label,value,category')
        .eq('user_id', user.id)

    const plan = await replanGoal({
      goal: ownedGoal,
      tasks: currentTasks || [],
      reason: String(body.reason).trim(),
      memories: memories || [],
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Replan API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not replan with AI.',
      },
      { status: 500 },
    )
  }
}
'@

Write-Host "4/6 Patching LifePilot store..."

$storePath = Join-Path $root "lib\lifepilot-store.tsx"
$store = [System.IO.File]::ReadAllText($storePath)

$statePattern = '(?s)type LifePilotState = \{.*?\n\}'
$stateReplacement = @'
type LifePilotState = {
  user: AuthProfile
  goals: Goal[]
  messages: ChatMessage[]
  activity: Activity[]
  memory: MemoryItem[]
  replanApplied: boolean
  isThinking: boolean
  totalTasksCompleted: number
  currentStreak: number
  toggleTask: (goalId: string, taskId: string) => void
  replanGoal: (goalId: string, reason: string) => Promise<void>
  createGoal: (title: string, details: string) => Promise<string>
  deleteGoal: (goalId: string) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  sendMessage: (text: string) => void
  forgetMemory: (id: string) => void
}
'@
$store = [regex]::Replace($store, $statePattern, $stateReplacement, 1)

$logicPattern = '(?s)  const applyReplan.*?  /\* ---------------------------------------------------------------------- \*/\r?\n  /\* AGENT CHAT'
$logicReplacement = @'
  const replanGoal = useCallback(
    async (goalId: string, reason: string) => {
      const goal = goals.find((item) => item.id === goalId)
      if (!goal || !userId) {
        throw new Error('Goal not found or user is not signed in.')
      }

      setIsThinking(true)

      try {
        const response = await fetch('/api/replan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal,
            tasks: goal.tasks,
            reason,
            memories: memory,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'AI replanning failed.')
        }

        const deadline = addDays(
          TODAY,
          Math.max(1, Number(payload.deadlineOffset) || 30),
        )

        const remainingTasks = goal.tasks.filter((task) => task.done)

        const newTaskRows = (payload.tasks || []).map((task: any) => ({
          id: crypto.randomUUID(),
          user_id: userId,
          goal_id: goalId,
          title: String(task.title || 'Next action'),
          due_date: addDays(
            TODAY,
            Math.max(1, Number(task.dueOffset) || 1),
          ),
          duration: String(task.duration || '30 min'),
          done: false,
          adjusted: true,
          purpose: String(task.purpose || ''),
          steps: Array.isArray(task.steps)
            ? task.steps.map(String)
            : [],
          result: String(task.result || ''),
        }))

        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('goal_id', goalId)
          .eq('user_id', userId)
          .eq('done', false)

        if (deleteError) {
          throw deleteError
        }

        const { error: insertError } = await supabase
          .from('tasks')
          .insert(newTaskRows)

        if (insertError) {
          throw insertError
        }

        const { error: goalUpdateError } = await supabase
          .from('goals')
          .update({
            description: String(
              payload.description || goal.description,
            ),
            category: String(
              payload.category || goal.category,
            ),
            deadline,
            outcomes: Array.isArray(payload.outcomes)
              ? payload.outcomes.map(String)
              : goal.outcomes,
            milestones: Array.isArray(payload.milestones)
              ? payload.milestones.map(String)
              : goal.milestones,
          })
          .eq('id', goalId)
          .eq('user_id', userId)

        if (goalUpdateError) {
          throw goalUpdateError
        }

        const completed = remainingTasks.map((task) => ({
          ...task,
        }))

        const generated = newTaskRows.map((task: any) => ({
          id: task.id,
          title: task.title,
          due: task.due_date,
          duration: task.duration,
          done: false,
          adjusted: true,
          purpose: task.purpose,
          steps: task.steps,
          result: task.result,
        }))

        setGoals((prev) =>
          prev.map((item) =>
            item.id === goalId
              ? {
                  ...item,
                  description:
                    payload.description || item.description,
                  category:
                    payload.category || item.category,
                  deadline,
                  outcomes:
                    Array.isArray(payload.outcomes)
                      ? payload.outcomes
                      : item.outcomes,
                  milestones:
                    Array.isArray(payload.milestones)
                      ? payload.milestones
                      : item.milestones,
                  tasks: [...completed, ...generated],
                }
              : item,
          ),
        )

        setReplanApplied(true)

        await logActivity({
          kind: 'adjusted',
          title: `AI replanned: ${goal.title}`,
          detail: reason,
        })
      } finally {
        setIsThinking(false)
      }
    },
    [goals, memory, userId, supabase, logActivity],
  )

  const createGoal = useCallback(
    async (title: string, details: string) => {
      if (!userId) {
        throw new Error('Please sign in before creating a goal.')
      }

      setIsThinking(true)

      try {
        const response = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            details,
            memories: memory,
          }),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(
            payload.error || 'AI planning failed.',
          )
        }

        const goalId = crypto.randomUUID()
        const deadline = addDays(
          TODAY,
          Math.max(1, Number(payload.deadlineOffset) || 30),
        )

        const { error: goalError } = await supabase
          .from('goals')
          .insert({
            id: goalId,
            user_id: userId,
            title: title.trim(),
            description: String(
              payload.description || details || 'AI-generated plan.',
            ),
            category: String(
              payload.category || 'Personal',
            ),
            deadline,
            outcomes: Array.isArray(payload.outcomes)
              ? payload.outcomes.map(String)
              : [],
            milestones: Array.isArray(payload.milestones)
              ? payload.milestones.map(String)
              : [],
          })

        if (goalError) {
          throw goalError
        }

        const taskRows = (payload.tasks || []).map(
          (task: any) => ({
            id: crypto.randomUUID(),
            user_id: userId,
            goal_id: goalId,
            title: String(task.title || 'Next action'),
            due_date: addDays(
              TODAY,
              Math.max(
                1,
                Number(task.dueOffset) || 1,
              ),
            ),
            duration: String(
              task.duration || '30 min',
            ),
            done: false,
            adjusted: false,
            purpose: String(task.purpose || ''),
            steps: Array.isArray(task.steps)
              ? task.steps.map(String)
              : [],
            result: String(task.result || ''),
          }),
        )

        if (!taskRows.length) {
          throw new Error(
            'AI returned no actionable tasks.',
          )
        }

        const { error: taskError } =
          await supabase
            .from('tasks')
            .insert(taskRows)

        if (taskError) {
          await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .eq('user_id', userId)
          throw taskError
        }

        const newGoal: Goal = {
          id: goalId,
          title: title.trim(),
          description: String(
            payload.description || details || '',
          ),
          deadline,
          category: String(
            payload.category || 'Personal',
          ),
          outcomes: Array.isArray(payload.outcomes)
            ? payload.outcomes.map(String)
            : [],
          milestones: Array.isArray(payload.milestones)
            ? payload.milestones.map(String)
            : [],
          tasks: taskRows.map((task: any) => ({
            id: task.id,
            title: task.title,
            due: task.due_date,
            duration: task.duration,
            done: false,
            adjusted: false,
            purpose: task.purpose,
            steps: task.steps,
            result: task.result,
          })),
        }

        setGoals((prev) => [newGoal, ...prev])

        await logActivity({
          kind: 'created',
          title: `New AI goal: ${title.trim()}`,
          detail: `${taskRows.length} personalized tasks created`,
        })

        return goalId
      } finally {
        setIsThinking(false)
      }
    },
    [memory, userId, supabase, logActivity],
  )

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!userId) {
        throw new Error('Please sign in first.')
      }

      const goal = goals.find((item) => item.id === goalId)

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      setGoals((prev) =>
        prev.filter((item) => item.id !== goalId),
      )

      if (goal) {
        await logActivity({
          kind: 'deleted',
          title: `Deleted goal: ${goal.title}`,
          detail: 'Goal and its tasks were removed.',
        })
      }
    },
    [goals, userId, supabase, logActivity],
  )

  const updateProfile = useCallback(
    async (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error('Name cannot be empty.')
      }

      const { data, error } =
        await supabase.auth.updateUser({
          data: { full_name: trimmed },
        })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(profileFromAuthUser(data.user))
      }
    },
    [supabase],
  )

  /* ---------------------------------------------------------------------- */
  /* AGENT CHAT
'@
$store = [regex]::Replace($store, $logicPattern, $logicReplacement, 1)

# Ensure loaded goals include the new planner fields.
$oldLoad = @'
        id: goal.id,
        title: goal.title,
        description: goal.description ?? '',
        deadline: goal.deadline ?? '',
        category: goal.category ?? 'Personal',
        tasks: (taskRows ?? [])
'@
$newLoad = @'
        id: goal.id,
        title: goal.title,
        description: goal.description ?? '',
        deadline: goal.deadline ?? '',
        category: goal.category ?? 'Personal',
        outcomes: Array.isArray(goal.outcomes)
          ? goal.outcomes
          : [],
        milestones: Array.isArray(goal.milestones)
          ? goal.milestones
          : [],
        tasks: (taskRows ?? [])
'@
$store = $store.Replace($oldLoad, $newLoad)

$oldTask = @'
            adjusted: task.adjusted ?? false,
          })),
'@
$newTask = @'
            adjusted: task.adjusted ?? false,
            purpose: task.purpose ?? '',
            steps: Array.isArray(task.steps)
              ? task.steps
              : [],
            result: task.result ?? '',
          })),
'@
$store = $store.Replace($oldTask, $newTask)

# Replace the context value methods.
$store = $store.Replace(
'        applyReplan,
        createGoal,
        sendMessage,
        forgetMemory,',
'        replanGoal,
        createGoal,
        deleteGoal,
        updateProfile,
        sendMessage,
        forgetMemory,'
)
$store = $store.Replace(
'        applyReplan,
        createGoal,
        sendMessage,
        forgetMemory,
      ],',
'        replanGoal,
        createGoal,
        deleteGoal,
        updateProfile,
        sendMessage,
        forgetMemory,
      ],'
)

[System.IO.File]::WriteAllText(
  $storePath,
  $store,
  (New-Object System.Text.UTF8Encoding($false))
)

Write-Host "5/6 Adding profile and delete controls..."

Write-Text "app\profile\page.tsx" @'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLifePilot } from '@/lib/lifepilot-store'

export default function ProfilePage() {
  const { user, updateProfile } = useLifePilot()
  const router = useRouter()
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setName(user.name || '')
    setEmail(user.email || '')
  }, [user.name, user.email])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await updateProfile(name)
      setMessage('Profile updated.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <main className="container">
      <div className="eyebrow">Your account</div>
      <h1 className="h1">Profile</h1>
      <p className="muted">
        Manage the basic information LifePilot uses for your account.
      </p>

      <section className="card" style={{ marginTop: 20, maxWidth: 720 }}>
        <form className="stack" onSubmit={save}>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              readOnly
            />
            <p className="small muted" style={{ marginTop: 6 }}>
              Email is managed by your authentication account.
            </p>
          </div>

          {message && <div className="success">{message}</div>}
          {error && <div className="alert">{error}</div>}

          <button
            className="btn primary"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 16, maxWidth: 720 }}>
        <h2 className="h2">Account</h2>
        <p className="muted small">
          Sign out from this device.
        </p>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={logout}
        >
          Logout
        </button>
      </section>
    </main>
  )
}
'@

# Replace nav with profile link while preserving current visual style.
Write-Text "components\nav.tsx" @'
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.startsWith('/auth/')) return null

  const logout = async () => {
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <nav className="nav">
      <Link className="brand" href="/goals">
        LifePilot<span> AI</span>
      </Link>

      <div className="navlinks">
        <Link href="/goals">Goals</Link>
        <Link href="/progress">Progress</Link>
        <Link href="/memory">Memory</Link>
        <Link href="/agent">Agent</Link>
        <Link href="/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
'@

# Patch goal detail: delete action and current replan API already wired by the store.
$goalPath = Join-Path $root "app\goals\[id]\page.tsx"
$goalPage = [System.IO.File]::ReadAllText($goalPath)

$goalPage = $goalPage.Replace(
'const {goals,toggleTask,replanGoal,isThinking}=useLifePilot()',
'const {goals,toggleTask,replanGoal,deleteGoal,isThinking}=useLifePilot()'
)

$goalPage = $goalPage.Replace(
'const progress=goalProgress(goal)',
@'
const progress=goalProgress(goal)
  const runDelete=async()=>{
    const confirmed=window.confirm(`Delete "${goal.title}"? This will also delete its tasks.`)
    if(!confirmed)return
    try{
      await deleteGoal(goal.id)
      router.replace('/goals')
    }catch(e){
      setError(e instanceof Error?e.message:'Could not delete goal.')
    }
  }
'@
)

$goalPage = $goalPage.Replace(
'<button onClick={()=>router.push(''/goals'')} className="btn" style={{marginBottom:18}}>← Back to goals</button>',
'<div className="row between" style={{marginBottom:18}}><button onClick={()=>router.push(''/goals'')} className="btn">← Back to goals</button><button onClick={runDelete} className="btn" style={{color:''var(--danger)''}}>Delete goal</button></div>'
)

# If the exact styled Back button above did not match due to quote formatting,
# insert a delete button before the main task section as a fallback.
if ($goalPage -notmatch 'Delete goal') {
  $goalPage = $goalPage.Replace(
    '<section className="rounded-2xl border bg-card p-5 md:p-6">',
    '<div style={{display:''flex'',justifyContent:''flex-end'',marginBottom:12}}><button onClick={runDelete} className="btn" style={{color:''var(--danger)''}}>Delete goal</button></div><section className="rounded-2xl border bg-card p-5 md:p-6">'
  )
}

[System.IO.File]::WriteAllText(
  $goalPath,
  $goalPage,
  (New-Object System.Text.UTF8Encoding($false))
)

Write-Host "6/6 Verifying..."
npm run build

Write-Host ""
Write-Host "DONE. AI planning, real AI replan, Profile, and Delete Goal are patched."
Write-Host "If the build above succeeded, run:"
Write-Host "  git status"
Write-Host "  git add ."
Write-Host "  git commit -m ""Fix AI planning, replan, profile and goal deletion"""
Write-Host "  git push origin main"
