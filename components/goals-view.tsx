'use client'
import Link from 'next/link'
import {goalProgress,useLifePilot} from '@/lib/lifepilot-store'
import {GoalComposer} from './goal-composer'
export function GoalsView(){
 const{goals}=useLifePilot()
 return <main className="container"><section className="hero"><div className="eyebrow" style={{color:'#c9c6ff'}}>{goals.length} active goal{goals.length===1?'':'s'}</div><h1 className="h1">Your goals</h1><p className="muted" style={{color:'rgba(255,255,255,.75)',maxWidth:680}}>Every goal has a living plan. LifePilot turns your goal into outcomes, milestones and actionable tasks — then adjusts when life changes.</p></section><div style={{marginTop:22}}>{goals.length?<div className="grid grid3">{goals.map(g=><Link key={g.id} href={`/goals/${g.id}`} style={{textDecoration:'none'}}><article className="card card-hover goal-card"><div className="row between"><span className="tag">{g.category}</span><span className="small muted">{goalProgress(g)}%</span></div><h2 className="h2" style={{marginTop:15}}>{g.title}</h2><p className="muted small">{g.description||'AI-generated living plan'}</p><div className="goal-bottom"><div className="progress" style={{marginTop:18}}><div style={{width:`${goalProgress(g)}%`}}/></div><p className="small muted">{g.tasks.filter(t=>t.done).length}/{g.tasks.length} tasks complete</p></div></article></Link>)}</div>:<div className="card empty">No goals yet. Create your first goal below.</div>}</div><GoalComposer/></main>
}
