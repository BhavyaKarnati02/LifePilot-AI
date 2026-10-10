
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  createGoal: (t: string, d: string) => Promise<string>
  toggleTask: (g: string, t: string) => Promise<void>
  replanGoal: (g: string, r: string) => Promise<void>
  sendMessage: (t: string) => Promise<void>
  addMemory: (
    l: string,
    v: string,
    c: 'context' | 'preferences',
  ) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
}

const C = createContext<Ctx | null>(null)

const DEFAULT_USER: AuthProfile = {
  name: 'Pilot',
  email: '',
}

export function goalProgress(g: Goal) {
  return g.tasks.length
    ? Math.round(
        (g.tasks.filter((t) => t.done).length / g.tasks.length) * 100,
      )
    : 0
}

function mapGoal(g: any, tasks: any[]): Goal {
  return {
    id: g.id,
    title: g.title,
    description: g.description || '',
    deadline: g.deadline || '',
    category: g.category || 'Personal',
    outcomes: g.outcomes || [],
    milestones: g.milestones || [],
    tasks: tasks
      .filter((t) => t.goal_id === g.id)
      .map((t) => ({
        id: t.id,
        title: t.title,
        due: t.due_date || '',
        duration: t.duration || '30 min',
        done: !!t.done,
        adjusted: !!t.adjusted,
        purpose: t.purpose || '',
        steps: t.steps || [],
        result: t.result || '',
      })),
  }
}

export function LifePilotProvider({
  children,
}: {
  children: React.ReactNode
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
      throw new Error('Supabase client can only be used in the browser.')
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

    // No active session is a normal unauthenticated state.
    // Clear private data instead of throwing AuthSessionMissingError.
    if (!authUser) {
      clearUserData()
      return
    }

    if (authError) {
      throw authError
    }

    setUser(profileFromAuthUser(authUser))

    const [gs, ts, ms, cs, as] = await Promise.all([
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

    if (gs.error) throw gs.error
    if (ts.error) throw ts.error
    if (ms.error) throw ms.error
    if (cs.error) throw cs.error
    if (as.error) throw as.error

    setGoals(
      (gs.data || []).map((g) => mapGoal(g, ts.data || [])),
    )

    setMemories(
      (ms.data || []).map((m) => ({
        id: m.id,
        category: m.category,
        label: m.label,
        value: m.value,
        source: m.source || 'LifePilot',
      })),
    )

    setMessages(
      (cs.data || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        time: m.created_at,
      })),
    )

    setActivity(
      (as.data || []).map((a) => ({
        id: a.id,
        kind: a.kind,
        title: a.title,
        detail: a.detail || '',
        time: a.created_at,
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
          throw new Error('Please sign in before creating a goal.')
        }

        const r = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, details }),
        })

        const plan = await r.json()

        if (!r.ok) {
          throw new Error(plan.error || 'Could not create plan.')
        }

        const { data: g, error } = await sb
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

        if (error) throw error

        // Support both the newer dueOffset field and the older day field.
        const rows = (plan.tasks || []).map((t: any) => ({
          user_id: authUser.id,
          goal_id: g.id,
          title: t.title,
          due_date: addDays(
            TODAY,
            Math.max(
              0,
              (Number(t.dueOffset ?? t.day) || 1) - 1,
            ),
          ),
          duration: t.duration || '30 min',
          done: false,
          adjusted: false,
          purpose: t.purpose || '',
          steps: Array.isArray(t.steps) ? t.steps : [],
          result: t.result || '',
        }))

        if (rows.length > 0) {
          const { error: taskError } = await sb
            .from('tasks')
            .insert(rows)

          if (taskError) throw taskError
        }

        const { error: activityError } = await sb
          .from('activity')
          .insert({
            user_id: authUser.id,
            kind: 'created',
            title: `Created goal: ${title}`,
            detail: `${rows.length} tasks generated.`,
          })

        if (activityError) throw activityError

        await refresh()
        return g.id
      } finally {
        setThinking(false)
      }
    },
    [getSb, refresh],
  )

  const toggleTask = useCallback(
    async (goalId: string, taskId: string) => {
      const g = goals.find((x) => x.id === goalId)
      const t = g?.tasks.find((x) => x.id === taskId)

      if (!t) return

      const sb = getSb()
      const {
        data: { user: authUser },
        error: authError,
      } = await sb.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Please sign in again.')
      }

      const done = !t.done

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
      ? `Completed: ${t.title}`
      : `Reopened: ${t.title}`,
    detail: g?.title ?? '',
  })

      if (activityError) throw activityError

      await refresh()
    },
    [goals, getSb, refresh],
  )

  const replanGoal = useCallback(
    async (goalId: string, reason: string) => {
      const g = goals.find((x) => x.id === goalId)

      if (!g) {
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

        const r = await fetch('/api/replan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: g,
            tasks: g.tasks,
            reason,
          }),
        })

        const result = await r.json()

        if (!r.ok) {
          throw new Error(result.error || 'Could not replan.')
        }

        const completed = new Set(
          g.tasks
            .filter((t) => t.done)
            .map((t) => t.title.toLowerCase()),
        )

        const { error: deleteError } = await sb
          .from('tasks')
          .delete()
          .eq('goal_id', goalId)
          .eq('user_id', authUser.id)

        if (deleteError) throw deleteError

        const rows = (result.tasks || []).map((t: any) => ({
          user_id: authUser.id,
          goal_id: goalId,
          title: t.title,
          due_date: addDays(
            TODAY,
            Math.max(
              0,
              (Number(t.dueOffset ?? t.day) || 1) - 1,
            ),
          ),
          duration: t.duration || '30 min',
          done: completed.has(String(t.title).toLowerCase()),
          adjusted: true,
          purpose: t.purpose || '',
          steps: Array.isArray(t.steps) ? t.steps : [],
          result: t.result || '',
        }))

        if (rows.length > 0) {
          const { error: insertError } = await sb
            .from('tasks')
            .insert(rows)

          if (insertError) throw insertError
        }

        const { error: activityError } = await sb
          .from('activity')
          .insert({
            user_id: authUser.id,
            kind: 'replanned',
            title: `Replanned: ${g.title}`,
            detail: result.description || reason,
          })

        if (activityError) throw activityError

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

        const r = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: clean,
            goals,
            memory: memories,
            history: messages.slice(-10),
          }),
        })

        const body = await r.json()

        if (!r.ok) {
          throw new Error(body.error || 'Agent unavailable.')
        }

        const { error: assistantMessageError } = await sb
          .from('agent_messages')
          .insert({
            user_id: authUser.id,
            role: 'assistant',
            content: body.response,
          })

        if (assistantMessageError) throw assistantMessageError

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
        data: { full_name: cleanName },
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

  const value = useMemo(
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
  const v = useContext(C)

  if (!v) {
    throw new Error('LifePilotProvider missing')
  }

  return v
}