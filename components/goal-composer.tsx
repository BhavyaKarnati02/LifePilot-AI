'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {useLifePilot} from '@/lib/lifepilot-store'
export function GoalComposer(){
  const[title,setTitle]=useState(''),[details,setDetails]=useState('');const{createGoal,isThinking}=useLifePilot();const router=useRouter()
  async function submit(e:React.FormEvent){e.preventDefault();if(!title.trim())return;try{const id=await createGoal(title.trim(),details.trim());setTitle('');setDetails('');router.push(`/goals/${id}`)}catch(e){alert(e instanceof Error?e.message:'Could not create goal.')}}
  return <section className="card" style={{marginTop:20}}><div className="section-title"><div><div className="eyebrow">AI planning</div><h2 className="h2">Create any goal</h2><p className="muted small">LifePilot adapts the plan to whatever you want to achieve, your constraints and your timeline.</p></div></div><form className="stack" onSubmit={submit}><div><label className="label">What do you want to achieve?</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Example: Prepare for GATE 2027"/></div><div><label className="label">Extra context <span className="muted">(optional)</span></label><textarea className="textarea" rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Time available, current level, deadline, constraints…"/></div><button className="btn primary" disabled={isThinking||!title.trim()}>{isThinking?'Building your plan…':'Create AI plan'}</button></form></section>
}
