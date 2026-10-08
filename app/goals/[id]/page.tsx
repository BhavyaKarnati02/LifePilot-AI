'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Clock3, Sparkles, Target } from 'lucide-react'
import { useLifePilot, goalProgress } from '@/lib/lifepilot-store'
import type { Task } from '@/lib/types'

export default function GoalDetailPage() {
  const params=useParams<{id:string}>()
  const router=useRouter()
  const {goals,toggleTask,replanGoal,isThinking}=useLifePilot()
  const goal=goals.find(g=>g.id===params.id)
  const [selected,setSelected]=useState<Task|null>(null)
  const [reason,setReason]=useState('')
  const [showReplan,setShowReplan]=useState(false)
  const [error,setError]=useState('')

  if(!goal)return <main className="mx-auto max-w-4xl p-8"><button onClick={()=>router.push('/goals')} className="mb-6 text-sm text-muted-foreground">← Back to goals</button><div className="rounded-2xl border p-8">Goal not found.</div></main>

  const progress=goalProgress(goal)
  const runReplan=async()=>{if(!reason.trim())return;setError('');try{await replanGoal(goal.id,reason.trim());setReason('');setShowReplan(false);setSelected(null)}catch(e){setError(e instanceof Error?e.message:'Could not replan.')}}

  return <main className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
    <button onClick={()=>router.push('/goals')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"> Back to goals</button>
    <section className="rounded-2xl border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">LifePilot plan</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{goal.title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{goal.description}</p></div>
        <div className="rounded-xl border px-4 py-3 text-right"><div className="text-2xl font-semibold">{progress}%</div><div className="text-xs text-muted-foreground">complete</div></div>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${progress}%`}}/></div>
    </section>

    {(goal.outcomes.length>0||goal.milestones.length>0)&&<section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border p-5"><div className="flex items-center gap-2 font-semibold"><Target className="size-4 text-primary"/> Outcomes</div><ul className="mt-4 space-y-2 text-sm">{goal.outcomes.map((x,i)=><li key={i} className="rounded-lg bg-muted/50 p-3">{x}</li>)}</ul></div>
      <div className="rounded-2xl border p-5"><div className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary"/> Milestones</div><ol className="mt-4 space-y-2 text-sm">{goal.milestones.map((x,i)=><li key={i} className="rounded-lg bg-muted/50 p-3"><span className="mr-2 font-medium">{i+1}.</span>{x}</li>)}</ol></div>
    </section>}

    <section className="rounded-2xl border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Your tasks</h2><p className="text-sm text-muted-foreground">Click a task to see its complete instructions.</p></div><button onClick={()=>setShowReplan(v=>!v)} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">{showReplan?'Close':'Adjust plan'}</button></div>
      {showReplan&&<div className="mt-5 rounded-xl border bg-muted/30 p-4"><p className="text-sm font-medium">What changed?</p><textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Example: I only have 20 minutes this week." className="mt-2 w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"/><div className="mt-3 flex items-center gap-3"><button disabled={isThinking||!reason.trim()} onClick={runReplan} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{isThinking?'Replanning…':'Replan with AI'}</button>{error&&<span className="text-sm text-destructive">{error}</span>}</div></div>}
      <div className="mt-5 space-y-3">{goal.tasks.map(task=><button key={task.id} onClick={()=>setSelected(task)} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition hover:border-primary/40 hover:bg-muted/30">
        <span onClick={e=>{e.stopPropagation();void toggleTask(goal.id,task.id)}} className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${task.done?'bg-primary text-primary-foreground':'bg-background'}`}>{task.done&&<Check className="size-4"/>}</span>
        <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${task.done?'line-through text-muted-foreground':''}`}>{task.title}</span><span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span>{task.due}</span><span className="inline-flex items-center gap-1"><Clock3 className="size-3"/>{task.duration}</span>{task.adjusted&&<span className="text-primary">Adjusted by AI</span>}</span></span><span className="text-xs text-muted-foreground">View →</span>
      </button>)}</div>
    </section>

    {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center" onClick={()=>setSelected(null)}><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-primary">Task details</p><h2 className="mt-1 text-2xl font-semibold">{selected.title}</h2></div><button onClick={()=>setSelected(null)} className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted">✕</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Due</p><p className="mt-1 text-sm font-medium">{selected.due}</p></div><div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Estimated time</p><p className="mt-1 text-sm font-medium">{selected.duration}</p></div></div>
      {selected.purpose&&<div className="mt-5"><h3 className="font-semibold">Why this matters</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.purpose}</p></div>}
      {selected.steps?.length?<div className="mt-5"><h3 className="font-semibold">What to do</h3><ol className="mt-3 space-y-2">{selected.steps.map((s,i)=><li key={i} className="flex gap-3 rounded-lg border p-3 text-sm"><span className="font-semibold text-primary">{i+1}</span><span>{s}</span></li>)}</ol></div>:null}
      {selected.result&&<div className="mt-5"><h3 className="font-semibold">Expected result</h3><p className="mt-2 rounded-xl bg-muted/50 p-4 text-sm">{selected.result}</p></div>}
      <button onClick={()=>{void toggleTask(goal.id,selected.id);setSelected({...selected,done:!selected.done})}} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">{selected.done?'Mark incomplete':'Mark complete'}<Check className="size-4"/></button>
    </div></div>}
  </main>
}
