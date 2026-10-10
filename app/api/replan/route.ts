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