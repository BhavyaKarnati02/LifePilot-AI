
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  profileFromAuthUser,
  type AuthProfile,
} from './auth-profile'

import { createClient } from './supabase/client'
import { addDays, TODAY } from './dates'

import type {
  Activity,
  ChatMessage,
  Goal,
  MemoryItem,
} from './types'

type Ctx = {
  user: AuthProfile
  goals: Goal[]
  memories: MemoryItem[]
  messages: ChatMessage[]
  activity: Activity[]
  isThinking: boolean
  createGoal: (title: string, details: string) => Promise<string>
  toggleTask: (goalId: string, taskId: string) => Promise<void>
  replanGoal: (goalId: string, reason: string) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  addMemory: (
    label: string,
    value: string,
    category: 'context' | 'preferences',
  ) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
}

const C = createContext<Ctx | null>(null)

const DEFAULT_USER: AuthProfile = {
  name: 'Pilot',
  email: '',
}

type ApiResponse = {
  error?: string
  response?: string
  description?: string
  tasks?: any[]
  [key: string]: any
}

/**
 * Safely reads API responses, including non-JSON error pages.
 * This avoids confusing JSON parsing errors when an API returns HTML.
 */
async function readApiResponse(
  response: Response,
  fallbackMessage: string,
): Promise<ApiResponse> {
  const text = await response.text()

  let body: ApiResponse

  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(
      response.ok
        ? 'The server returned an invalid response. Please try again.'
        : `${fallbackMessage} Server returned HTTP ${response.status}.`,
    )
  }

  if (!response.ok) {
    throw new Error(
      body.error ||
        `${fallbackMessage} HTTP ${response.status}.`,
    )
  }

  return body
}

export function goalProgress(goal: Goal) {
  if (goal.tasks.length === 0) {
    return 0
  }

  const completed = goal.tasks.filter((task) => task.done).length

  return Math.round((completed / goal.tasks.length) * 100)
}

function mapGoal(goal: any, tasks: any[]): Goal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description || '',
    deadline: goal.deadline || '',
    category: goal.category || 'Personal',
    outcomes: goal.outcomes || [],
    milestones: goal.milestones || [],
    tasks: tasks
      .filter((task) => task.goal_id === goal.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        due: task.due_date || '',
        duration: task.duration || '30 min',
        done: Boolean(task.done),
        adjusted: Boolean(task.adjusted),
        purpose: task.purpose || '',
        steps: task.steps || [],
        result: task.result || '',
      })),
  }
}

export function LifePilotProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<AuthProfile>(DEFAULT_USER)
  const [goals, setGoals] = useState<Goal[]>([])
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [isThinking, setThinking] = useState(false)

  const sbRef = useRef<ReturnType<typeof createClient> | null>(null)

  const getSb = useCallback(() => {
    if (typeof window === 'undefined') {
      throw new Error(
        'Supabase client can only be used in the browser.',
      )
    }

    if (!sbRef.current) {
      sbRef.current = createClient()
    }

    return sbRef.current
  }, [])

  const clearUserData = useCallback(() => {
    setUser(DEFAULT_USER)
    setGoals([])
    setMemories([])
    setMessages([])
    setActivity([])
  }, [])

  const refresh = useCallback(async () => {
    const sb = getSb()

    const {
      data: { user: authUser },
      error: authError,
    } = await sb.auth.getUser()

    if (authError) {
  if (authError.name === 'AuthSessionMissingError') {
    clearUserData()
    return
  }

  throw authError
}

if (!authUser) {
  clearUserData()
  return
}

    setUser(profileFromAuthUser(authUser))

    const [goalsResult, tasksResult, memoriesResult, messagesResult, activityResult] =
      await Promise.all([
        sb
          .from('goals')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),

        sb
          .from('tasks')
          .select('*')
          .eq('user_id', authUser.id)
          .order('due_date'),

        sb
          .from('memories')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),

        sb
          .from('agent_messages')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at'),

        sb
          .from('activity')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),
      ])

    if (goalsResult.error) throw goalsResult.error
    if (tasksResult.error) throw tasksResult.error
    if (memoriesResult.error) throw memoriesResult.error
    if (messagesResult.error) throw messagesResult.error
    if (activityResult.error) throw activityResult.error

    const taskRows = tasksResult.data || []

    setGoals(
      (goalsResult.data || []).map((goal) =>
        mapGoal(goal, taskRows),
      ),
    )

    setMemories(
      (memoriesResult.data || []).map((memory) => ({
        id: memory.id,
        category: memory.category,
        label: memory.label,
        value: memory.value,
        source: memory.source || 'LifePilot',
      })),
    )

    setMessages(
      (messagesResult.data || []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        time: message.created_at,
      })),
    )

    setActivity(
      (activityResult.data || []).map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        detail: item.detail || '',
        time: item.created_at,
      })),
    )
  }, [getSb, clearUserData])

  useEffect(() => {
    void refresh().catch((error) => {
      console.error('Could not load LifePilot data:', error)
    })
  }, [refresh])

  const createGoal = useCallback(
    async (title: string, details: string) => {
      setThinking(true)

      try {
        const sb = getSb()

        const {
          data: { user: authUser },
          error: authError,
        } = await sb.auth.getUser()

        if (authError || !authUser) {
          throw new Error(
            'Please sign in before creating a goal.',
          )
        }

        const response = await fetch('/api/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            details,
            memories,
          }),
        })

        const plan = await readApiResponse(
          response,
          'Could not create the plan.',
        )

        const { data: goal, error: goalError } = await sb
          .from('goals')
          .insert({
            user_id: authUser.id,
            title,
            description: plan.description || details,
            category: plan.category || 'Personal',
            deadline: addDays(
              TODAY,
              Math.max(1, Number(plan.deadlineOffset) || 30),
            ),
            outcomes: plan.outcomes || [],
            milestones: plan.milestones || [],
          })
          .select()
          .single()

        if (goalError) throw goalError

        const taskRows = (plan.tasks || []).map((task: any) => ({
          user_id: authUser.id,
          goal_id: goal.id,
          title: task.title,
          due_date: addDays(
            TODAY,
            Math.max(
              0,
              (Number(task.dueOffset ?? task.day) || 1) - 1,
            ),
          ),
          duration: task.duration || '30 min',
          done: false,
          adjusted: false,
          purpose: task.purpose || '',
          steps: Array.isArray(task.steps) ? task.steps : [],
          result: task.result || '',
        }))

        if (taskRows.length > 0) {
          const { error: taskError } = await sb
            .from('tasks')
            .insert(taskRows)

          if (taskError) {
            // Remove the goal if its tasks could not be saved.
            await sb
              .from('goals')
              .delete()
              .eq('id', goal.id)
              .eq('user_id', authUser.id)

            throw taskError
          }
        }

        const { error: activityError } = await sb
          .from('activity')
          .insert({
            user_id: authUser.id,
            kind: 'created',
            title: `Created goal: ${title}`,
            detail: `${taskRows.length} tasks generated.`,
          })

        if (activityError) {
          console.error(
            'Could not save goal activity:',
            activityError,
          )
        }

        await refresh()

        return goal.id
      } finally {
        setThinking(false)
      }
    },
    [getSb, refresh, memories],
  )

  const toggleTask = useCallback(
    async (goalId: string, taskId: string) => {
      const goal = goals.find((item) => item.id === goalId)
      const task = goal?.tasks.find((item) => item.id === taskId)

      if (!task) return

      const sb = getSb()

      const {
        data: { user: authUser },
        error: authError,
      } = await sb.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Please sign in again.')
      }

      const done = !task.done

      const { error } = await sb
        .from('tasks')
        .update({ done })
        .eq('id', taskId)
        .eq('user_id', authUser.id)

      if (error) throw error

      const { error: activityError } = await sb
        .from('activity')
        .insert({
          user_id: authUser.id,
          kind: 'completed',
          title: done
            ? `Completed: ${task.title}`
            : `Reopened: ${task.title}`,
          detail: goal?.title ?? '',
        })

      if (activityError) {
        console.error(
          'Could not save task activity:',
          activityError,
        )
      }

      await refresh()
    },
    [goals, getSb, refresh],
  )

  const replanGoal = useCallback(
    async (goalId: string, reason: string) => {
      const goal = goals.find((item) => item.id === goalId)

      if (!goal) {
        throw new Error('Goal not found.')
      }

      setThinking(true)

      try {
        const sb = getSb()

        const {
          data: { user: authUser },
          error: authError,
        } = await sb.auth.getUser()

        if (authError || !authUser) {
          throw new Error('Please sign in again.')
        }

        const response = await fetch('/api/replan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal,
            tasks: goal.tasks,
            reason,
          }),
        })

        const result = await readApiResponse(
          response,
          'Could not replan the goal.',
        )

        const completedTitles = new Set(
          goal.tasks
            .filter((task) => task.done)
            .map((task) => task.title.toLowerCase()),
        )

        const { error: deleteError } = await sb
          .from('tasks')
          .delete()
          .eq('goal_id', goalId)
          .eq('user_id', authUser.id)

        if (deleteError) throw deleteError

        const taskRows = (result.tasks || []).map((task: any) => ({
          user_id: authUser.id,
          goal_id: goalId,
          title: task.title,
          due_date: addDays(
            TODAY,
            Math.max(
              0,
              (Number(task.dueOffset ?? task.day) || 1) - 1,
            ),
          ),
          duration: task.duration || '30 min',
          done: completedTitles.has(
            String(task.title).toLowerCase(),
          ),
          adjusted: true,
          purpose: task.purpose || '',
          steps: Array.isArray(task.steps) ? task.steps : [],
          result: task.result || '',
        }))

        if (taskRows.length > 0) {
          const { error: insertError } = await sb
            .from('tasks')
            .insert(taskRows)

          if (insertError) throw insertError
        }

        const { error: activityError } = await sb
          .from('activity')
          .insert({
            user_id: authUser.id,
            kind: 'replanned',
            title: `Replanned: ${goal.title}`,
            detail: result.description || reason,
          })

        if (activityError) {
          console.error(
            'Could not save replan activity:',
            activityError,
          )
        }

        await refresh()
      } finally {
        setThinking(false)
      }
    },
    [goals, getSb, refresh],
  )

  const addMemory = useCallback(
    async (
      label: string,
      value: string,
      category: 'context' | 'preferences',
    ) => {
      const sb = getSb()

      const {
        data: { user: authUser },
        error: authError,
      } = await sb.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Please sign in again.')
      }

      const { error } = await sb.from('memories').insert({
        user_id: authUser.id,
        category,
        label,
        value,
        source: 'LifePilot',
      })

      if (error) throw error

      await refresh()
    },
    [getSb, refresh],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim()

      if (!clean) return

      setThinking(true)

      try {
        const sb = getSb()

        const {
          data: { user: authUser },
          error: authError,
        } = await sb.auth.getUser()

        if (authError || !authUser) {
          throw new Error('Please sign in again.')
        }

        const { error: userMessageError } = await sb
          .from('agent_messages')
          .insert({
            user_id: authUser.id,
            role: 'user',
            content: clean,
          })

        if (userMessageError) throw userMessageError

        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: clean,
            goals,
            memory: memories,
            history: messages.slice(-10),
          }),
        })

        const body = await readApiResponse(
          response,
          'LifePilot assistant is unavailable.',
        )

        if (!body.response) {
          throw new Error(
            'The assistant returned an empty response.',
          )
        }

        const { error: assistantMessageError } = await sb
          .from('agent_messages')
          .insert({
            user_id: authUser.id,
            role: 'assistant',
            content: body.response,
          })

        if (assistantMessageError) {
          throw assistantMessageError
        }

        await refresh()
      } finally {
        setThinking(false)
      }
    },
    [getSb, goals, memories, messages, refresh],
  )

  const updateProfile = useCallback(
    async (name: string) => {
      const cleanName = name.trim()

      if (!cleanName) {
        throw new Error('Name cannot be empty.')
      }

      const sb = getSb()

      const {
        data: { user: authUser },
        error: authError,
      } = await sb.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Please sign in again.')
      }

      const { data, error } = await sb.auth.updateUser({
        data: {
          full_name: cleanName,
        },
      })

      if (error) throw error

      if (data.user) {
        setUser(profileFromAuthUser(data.user))
      }
    },
    [getSb],
  )

  const deleteGoal = useCallback(
    async (goalId: string) => {
      const sb = getSb()

      const {
        data: { user: authUser },
        error: authError,
      } = await sb.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Please sign in again.')
      }

      const { error: taskError } = await sb
        .from('tasks')
        .delete()
        .eq('goal_id', goalId)
        .eq('user_id', authUser.id)

      if (taskError) throw taskError

      const { error: goalError } = await sb
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', authUser.id)

      if (goalError) throw goalError

      await refresh()
    },
    [getSb, refresh],
  )

  const value = useMemo<Ctx>(
    () => ({
      user,
      goals,
      memories,
      messages,
      activity,
      isThinking,
      createGoal,
      toggleTask,
      replanGoal,
      sendMessage,
      addMemory,
      updateProfile,
      deleteGoal,
    }),
    [
      user,
      goals,
      memories,
      messages,
      activity,
      isThinking,
      createGoal,
      toggleTask,
      replanGoal,
      sendMessage,
      addMemory,
      updateProfile,
      deleteGoal,
    ],
  )

  return (
    <C.Provider value={value}>
      {children}
    </C.Provider>
  )
}

export function useLifePilot() {
  const context = useContext(C)

  if (!context) {
    throw new Error('LifePilotProvider missing')
  }

  return context
}
