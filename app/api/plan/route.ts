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