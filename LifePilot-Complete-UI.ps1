$ErrorActionPreference = "Stop"
Set-Location "B:\amazon developer hackathon"

@'
:root {
  color-scheme: light;
  --bg: #f5f7fb;
  --surface: #ffffff;
  --surface-2: #f8f9fd;
  --text: #151a2d;
  --muted: #687089;
  --line: #e5e8f0;
  --primary: #635bff;
  --primary-dark: #5148e5;
  --primary-soft: #eeecff;
  --success: #17834d;
  --success-soft: #eaf8f0;
  --danger: #c93636;
  --danger-soft: #fff0f0;
  --shadow: 0 12px 35px rgba(21, 26, 45, .07);
}
* { box-sizing: border-box; }
html { background: var(--bg); }
body { margin: 0; background: radial-gradient(circle at 15% 0%, rgba(99,91,255,.08), transparent 28rem), var(--bg); color: var(--text); font-family: Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
button,input,textarea,select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; }
a { color: inherit; }
.shell { min-height: 100vh; }
.nav { height:68px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.92); backdrop-filter:blur(16px); display:flex; align-items:center; justify-content:space-between; padding:0 28px; position:sticky; top:0; z-index:40; }
.brand { font-weight:850; font-size:18px; text-decoration:none; letter-spacing:-.02em; }
.brand span { color:var(--primary); }
.navlinks { display:flex; gap:5px; align-items:center; }
.navlinks a,.navlinks button { border:0; background:transparent; padding:9px 12px; border-radius:10px; color:var(--muted); text-decoration:none; font-size:14px; font-weight:600; }
.navlinks a:hover,.navlinks button:hover { background:#f1f2f7; color:var(--text); }
.container { max-width:1120px; margin:auto; padding:42px 22px 70px; }
.grid { display:grid; gap:16px; }
.grid2 { grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }
.grid3 { grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); }
.card { background:rgba(255,255,255,.94); border:1px solid var(--line); border-radius:20px; padding:22px; box-shadow:var(--shadow); }
.card-hover { transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }
.card-hover:hover { transform:translateY(-2px); border-color:#cbc8ff; box-shadow:0 16px 42px rgba(21,26,45,.10); }
.muted { color:var(--muted); }
.eyebrow { font-size:12px; text-transform:uppercase; letter-spacing:.09em; color:var(--primary); font-weight:800; }
.h1 { font-size:clamp(30px,4vw,42px); line-height:1.1; letter-spacing:-.035em; margin:6px 0 10px; }
.h2 { font-size:21px; letter-spacing:-.02em; margin:0 0 8px; }
.small { font-size:13px; }
.btn { border:1px solid var(--line); background:#fff; color:var(--text); border-radius:12px; padding:10px 15px; font-weight:700; transition:.15s ease; }
.btn:hover { background:#f4f5f9; }
.btn.primary { background:var(--primary); color:#fff; border-color:var(--primary); box-shadow:0 7px 18px rgba(99,91,255,.22); }
.btn.primary:hover { background:var(--primary-dark); }
.btn.danger { color:var(--danger); }
.input,.textarea { width:100%; border:1px solid var(--line); border-radius:12px; background:#fff; padding:12px 14px; outline:none; color:var(--text); }
.input:focus,.textarea:focus { border-color:var(--primary); box-shadow:0 0 0 4px rgba(99,91,255,.11); }
.textarea { resize:vertical; }
.label { font-size:13px; font-weight:750; margin:0 0 7px; display:block; }
.stack { display:flex; flex-direction:column; gap:14px; }
.row { display:flex; align-items:center; gap:10px; }
.between { justify-content:space-between; }
.progress { height:9px; border-radius:99px; background:#e9eaf1; overflow:hidden; }
.progress>div { height:100%; background:linear-gradient(90deg,var(--primary),#8a84ff); border-radius:99px; transition:width .25s ease; }
.tag { font-size:11px; padding:5px 9px; border-radius:999px; background:var(--primary-soft); color:var(--primary); font-weight:800; }
.modal { position:fixed; inset:0; background:rgba(15,20,35,.45); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:100; }
.modalbox { max-width:680px; width:100%; max-height:88vh; overflow:auto; background:#fff; border-radius:22px; padding:24px; box-shadow:0 25px 70px rgba(0,0,0,.18); }
.auth { min-height:calc(100vh - 68px); display:grid; place-items:center; padding:35px 20px; }
.authbox { width:100%; max-width:440px; }
.authbox .card { padding:30px; }
.alert { padding:11px 13px; border-radius:11px; background:var(--danger-soft); color:var(--danger); font-size:14px; }
.success { padding:11px 13px; border-radius:11px; background:var(--success-soft); color:var(--success); font-size:14px; }
.link { color:var(--primary); text-decoration:none; font-weight:650; }
.link:hover { text-decoration:underline; }
.empty { padding:48px 20px; text-align:center; color:var(--muted); }
.hero { padding:30px; border-radius:24px; color:#fff; background:linear-gradient(135deg,#171b31,#302a75 55%,#635bff); box-shadow:0 20px 55px rgba(52,43,150,.18); }
.stat { padding:20px; }
.stat-number { display:block; font-size:30px; font-weight:850; letter-spacing:-.03em; margin-top:5px; }
.section-title { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; margin-bottom:15px; }
.goal-card { min-height:205px; display:flex; flex-direction:column; }
.goal-card .goal-bottom { margin-top:auto; }
.detail-shell { max-width:1080px; margin:auto; padding:34px 22px 70px; }
.detail-hero { padding:28px; border-radius:24px; background:#fff; border:1px solid var(--line); box-shadow:var(--shadow); }
.detail-progress { min-width:105px; padding:12px 15px; border:1px solid var(--line); border-radius:15px; text-align:center; background:var(--surface-2); }
.detail-progress strong { display:block; font-size:25px; }
.detail-section { background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px; box-shadow:var(--shadow); }
.task-row { display:flex; width:100%; align-items:center; gap:13px; padding:15px; border:1px solid var(--line); border-radius:15px; background:#fff; text-align:left; transition:.15s ease; }
.task-row:hover { border-color:#c7c3ff; background:#fcfcff; transform:translateY(-1px); }
.task-row-title { display:block; font-size:14px; font-weight:750; }
.task-row-title.done { text-decoration:line-through; color:var(--muted); }
.task-meta { display:flex; flex-wrap:wrap; gap:12px; margin-top:5px; font-size:12px; color:var(--muted); }
.check { width:29px; height:29px; border-radius:50%; border:1px solid var(--line); display:grid; place-items:center; flex:none; }
.check.done { background:var(--primary); color:#fff; border-color:var(--primary); }
.icon-button { border:0; background:transparent; border-radius:9px; padding:7px; color:var(--muted); }
.icon-button:hover { background:#f0f1f5; color:var(--text); }
.chat { min-height:540px; display:flex; flex-direction:column; }
.chat-body { flex:1; overflow:auto; padding:4px 2px; }
.chat-message { max-width:78%; padding:13px 15px; border-radius:16px; margin-bottom:10px; white-space:pre-wrap; line-height:1.55; }
.chat-user { margin-left:auto; background:var(--primary-soft); }
.chat-assistant { background:#f3f4f7; }
.memory-card { min-height:145px; }
@media(max-width:700px){ .nav{height:60px;padding:0 13px}.navlinks a:nth-child(2),.navlinks a:nth-child(3),.navlinks a:nth-child(4){display:none}.container,.detail-shell{padding:26px 14px 55px}.h1{font-size:30px}.card{padding:18px;border-radius:17px}.auth{min-height:calc(100vh - 60px);padding:20px 14px}.authbox .card{padding:22px}.detail-hero{padding:20px}.detail-progress{min-width:85px}.chat-message{max-width:90%} }
'@ | Set-Content app\globals.css

@'
'use client'
import Link from 'next/link'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'

function AuthFrame({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){
  return <main className="auth"><div className="authbox"><div className="card"><div className="eyebrow">LifePilot AI</div><h1 className="h1">{title}</h1><p className="muted">{subtitle}</p>{children}</div></div></main>
}
export function LoginBox(){
  const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);const router=useRouter()
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');const{error}=await createClient().auth.signInWithPassword({email,password});if(error)setError(error.message);else{router.replace('/goals');router.refresh()}setLoading(false)}
  return <AuthFrame title="Welcome back" subtitle="Sign in to continue your living goal plan."><form className="stack" onSubmit={submit}><div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div><label className="label">Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{error&&<div className="alert">{error}</div>}<button className="btn primary" disabled={loading}>{loading?'Signing in…':'Sign in'}</button><div className="row between small"><Link className="link" href="/auth/forgot-password">Forgot password?</Link><Link className="link" href="/auth/sign-up">Create account</Link></div></form></AuthFrame>
}
export function SignUpBox(){
  const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);const router=useRouter()
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');const{data,error}=await createClient().auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${window.location.origin}/auth/callback`}});if(error)setError(error.message);else if(data.session)router.replace('/goals');else router.replace('/auth/sign-up-success');setLoading(false)}
  return <AuthFrame title="Create your LifePilot" subtitle="One account for goals, plans, memory and progress."><form className="stack" onSubmit={submit}><div><label className="label">Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div><div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div><label className="label">Password</label><input className="input" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/></div>{error&&<div className="alert">{error}</div>}<button className="btn primary" disabled={loading}>{loading?'Creating…':'Create account'}</button><div className="small">Already have an account? <Link className="link" href="/auth/login">Sign in</Link></div></form></AuthFrame>
}
export function ForgotBox(){
  const[email,setEmail]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false)
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');const{error}=await createClient().auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/reset-password`});if(error)setError(error.message);else setMessage('If an account exists for that email, a password reset link has been sent.');setLoading(false)}
  return <AuthFrame title="Forgot password" subtitle="We’ll send a secure reset link to your email."><form className="stack" onSubmit={submit}><div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>{error&&<div className="alert">{error}</div>}{message&&<div className="success">{message}</div>}<button className="btn primary" disabled={loading}>{loading?'Sending…':'Send reset link'}</button><Link className="link small" href="/auth/login">Back to sign in</Link></form></AuthFrame>
}
export function ResetBox(){
  const[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false),[loading,setLoading]=useState(false);const router=useRouter()
  async function submit(e:React.FormEvent){e.preventDefault();if(password!==confirm){setError('Passwords do not match.');return}setLoading(true);setError('');const{error}=await createClient().auth.updateUser({password});if(error)setError(error.message);else{setDone(true);setTimeout(()=>router.replace('/goals'),700)}setLoading(false)}
  return <AuthFrame title="Set a new password" subtitle="Choose a new password for your LifePilot account.">{done?<div className="success">Password updated. Redirecting…</div>:<form className="stack" onSubmit={submit}><div><label className="label">New password</label><input className="input" type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></div><div><label className="label">Confirm password</label><input className="input" type="password" minLength={6} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>{error&&<div className="alert">{error}</div>}<button className="btn primary" disabled={loading}>{loading?'Updating…':'Update password'}</button></form>}</AuthFrame>
}
'@ | Set-Content components\auth-box.tsx

@'
'use client'
import Link from 'next/link'
import {usePathname,useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'
export function Nav(){
  const pathname=usePathname();const router=useRouter();if(pathname.startsWith('/auth/'))return null
  const logout=async()=>{await createClient().auth.signOut();router.replace('/auth/login');router.refresh()}
  return <nav className="nav"><Link className="brand" href="/goals">LifePilot<span> AI</span></Link><div className="navlinks"><Link href="/goals">Goals</Link><Link href="/progress">Progress</Link><Link href="/memory">Memory</Link><Link href="/agent">Agent</Link><button onClick={logout}>Logout</button></div></nav>
}
'@ | Set-Content components\nav.tsx

@'
'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {useLifePilot} from '@/lib/lifepilot-store'
export function GoalComposer(){
  const[title,setTitle]=useState(''),[details,setDetails]=useState('');const{createGoal,isThinking}=useLifePilot();const router=useRouter()
  async function submit(e:React.FormEvent){e.preventDefault();if(!title.trim())return;try{const id=await createGoal(title.trim(),details.trim());setTitle('');setDetails('');router.push(`/goals/${id}`)}catch(e){alert(e instanceof Error?e.message:'Could not create goal.')}}
  return <section className="card" style={{marginTop:20}}><div className="section-title"><div><div className="eyebrow">AI planning</div><h2 className="h2">Create any goal</h2><p className="muted small">LifePilot adapts the plan to whatever you want to achieve, your constraints and your timeline.</p></div></div><form className="stack" onSubmit={submit}><div><label className="label">What do you want to achieve?</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Example: Prepare for GATE 2027"/></div><div><label className="label">Extra context <span className="muted">(optional)</span></label><textarea className="textarea" rows={3} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Time available, current level, deadline, constraints…"/></div><button className="btn primary" disabled={isThinking||!title.trim()}>{isThinking?'Building your plan…':'Create AI plan'}</button></form></section>
}
'@ | Set-Content components\goal-composer.tsx

@'
'use client'
import Link from 'next/link'
import {goalProgress,useLifePilot} from '@/lib/lifepilot-store'
import {GoalComposer} from './goal-composer'
export function GoalsView(){
 const{goals}=useLifePilot()
 return <main className="container"><section className="hero"><div className="eyebrow" style={{color:'#c9c6ff'}}>{goals.length} active goal{goals.length===1?'':'s'}</div><h1 className="h1">Your goals</h1><p className="muted" style={{color:'rgba(255,255,255,.75)',maxWidth:680}}>Every goal has a living plan. LifePilot turns your goal into outcomes, milestones and actionable tasks — then adjusts when life changes.</p></section><div style={{marginTop:22}}>{goals.length?<div className="grid grid3">{goals.map(g=><Link key={g.id} href={`/goals/${g.id}`} style={{textDecoration:'none'}}><article className="card card-hover goal-card"><div className="row between"><span className="tag">{g.category}</span><span className="small muted">{goalProgress(g)}%</span></div><h2 className="h2" style={{marginTop:15}}>{g.title}</h2><p className="muted small">{g.description||'AI-generated living plan'}</p><div className="goal-bottom"><div className="progress" style={{marginTop:18}}><div style={{width:`${goalProgress(g)}%`}}/></div><p className="small muted">{g.tasks.filter(t=>t.done).length}/{g.tasks.length} tasks complete</p></div></article></Link>)}</div>:<div className="card empty">No goals yet. Create your first goal below.</div>}</div><GoalComposer/></main>
}
'@ | Set-Content components\goals-view.tsx

@'
'use client'
import {useState} from 'react'
import {useLifePilot} from '@/lib/lifepilot-store'
export default function Page(){
 const{messages,sendMessage,isThinking}=useLifePilot();const[text,setText]=useState('')
 async function submit(e:React.FormEvent){e.preventDefault();if(!text.trim())return;const v=text;setText('');try{await sendMessage(v)}catch(e){alert(e instanceof Error?e.message:'Agent unavailable.')}}
 return <main className="container"><div className="eyebrow">Agentic assistant</div><h1 className="h1">LifePilot Agent</h1><p className="muted">Ask about your goals, progress, constraints or what to work on next.</p><section className="card chat" style={{marginTop:20}}><div className="chat-body">{messages.length?<div>{messages.map(m=><div key={m.id} className={`chat-message ${m.role==='user'?'chat-user':'chat-assistant'}`}><div className="small muted">{m.role==='user'?'You':'LifePilot'}</div><div style={{marginTop:5}}>{m.content}</div></div>)}</div>:<div className="empty">Try: “What should I work on today?”</div>}</div><form className="row" style={{marginTop:16}} onSubmit={submit}><input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Ask LifePilot…"/><button className="btn primary" disabled={isThinking||!text.trim()}>{isThinking?'…':'Send'}</button></form></section></main>
}
'@ | Set-Content app\agent\page.tsx

@'
'use client'
import {useState} from 'react'
import {useLifePilot} from '@/lib/lifepilot-store'
export default function Page(){
 const{memories,addMemory}=useLifePilot();const[label,setLabel]=useState(''),[value,setValue]=useState(''),[category,setCategory]=useState<'context'|'preferences'>('context')
 return <main className="container"><div className="eyebrow">Persistent context</div><h1 className="h1">Memory</h1><p className="muted">Facts and preferences LifePilot can use when planning and chatting.</p><section className="card" style={{marginTop:20}}><div className="section-title"><div><h2 className="h2">Add memory</h2><p className="small muted">Give LifePilot useful context once instead of repeating it.</p></div></div><form className="grid grid2" onSubmit={async e=>{e.preventDefault();if(!label.trim()||!value.trim())return;await addMemory(label.trim(),value.trim(),category);setLabel('');setValue('')}}><div><label className="label">Label</label><input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Available study time"/></div><div><label className="label">Category</label><select className="input" value={category} onChange={e=>setCategory(e.target.value as 'context'|'preferences')}><option value="context">Context</option><option value="preferences">Preference</option></select></div><div style={{gridColumn:'1/-1'}}><label className="label">Value</label><input className="input" value={value} onChange={e=>setValue(e.target.value)} placeholder="2 hours on weekdays"/></div><button className="btn primary">Save memory</button></form></section><div className="grid grid2" style={{marginTop:20}}>{memories.map(m=><div className="card memory-card" key={m.id}><span className="tag">{m.category}</span><h3>{m.label}</h3><p className="muted">{m.value}</p></div>)}</div></main>
}
'@ | Set-Content app\memory\page.tsx

@'
'use client'
import {goalProgress,useLifePilot} from '@/lib/lifepilot-store'
export default function Page(){
 const{goals,activity}=useLifePilot();const total=goals.reduce((n,g)=>n+g.tasks.length,0),done=goals.reduce((n,g)=>n+g.tasks.filter(t=>t.done).length,0)
 return <main className="container"><div className="eyebrow">Living progress</div><h1 className="h1">Progress</h1><p className="muted">See whether your plans are turning into completed actions.</p><div className="grid grid3" style={{marginTop:20}}><div className="card stat"><div className="muted small">Goals</div><strong className="stat-number">{goals.length}</strong></div><div className="card stat"><div className="muted small">Tasks completed</div><strong className="stat-number">{done}/{total}</strong></div><div className="card stat"><div className="muted small">Overall completion</div><strong className="stat-number">{total?Math.round(done/total*100):0}%</strong></div></div><section className="card" style={{marginTop:20}}><div className="section-title"><div><h2 className="h2">Goal progress</h2><p className="small muted">Your current completion across every plan.</p></div></div>{goals.map(g=><div key={g.id} style={{marginTop:18}}><div className="row between"><strong>{g.title}</strong><span className="small muted">{goalProgress(g)}%</span></div><div className="progress" style={{marginTop:8}}><div style={{width:`${goalProgress(g)}%`}}/></div></div>)}</section><section className="card" style={{marginTop:20}}><h2 className="h2">Recent activity</h2>{activity.length?activity.slice(0,15).map(a=><div key={a.id} style={{padding:'13px 0',borderBottom:'1px solid var(--line)'}}><strong>{a.title}</strong><div className="small muted">{a.detail}</div></div>):<p className="muted">No activity yet.</p>}</section></main>
}
'@ | Set-Content app\progress\page.tsx

@'
'use client'
import {useParams,useRouter} from 'next/navigation'
import {useState} from 'react'
import {Check,Clock3,Sparkles,Target} from 'lucide-react'
import {useLifePilot,goalProgress} from '@/lib/lifepilot-store'
import type {Task} from '@/lib/types'
export default function GoalDetailPage(){
 const params=useParams<{id:string}>(),router=useRouter();const{goals,toggleTask,replanGoal,isThinking}=useLifePilot();const goal=goals.find(g=>g.id===params.id)
 const[selected,setSelected]=useState<Task|null>(null),[reason,setReason]=useState(''),[showReplan,setShowReplan]=useState(false),[error,setError]=useState('')
 if(!goal)return <main className="detail-shell"><button className="btn" onClick={()=>router.push('/goals')}>← Back to goals</button><div className="card empty" style={{marginTop:18}}>Goal not found.</div></main>
 const progress=goalProgress(goal)
 const runReplan=async()=>{if(!reason.trim())return;setError('');try{await replanGoal(goal.id,reason.trim());setReason('');setShowReplan(false);setSelected(null)}catch(e){setError(e instanceof Error?e.message:'Could not replan.')}}
 return <main className="detail-shell"><button onClick={()=>router.push('/goals')} className="btn" style={{marginBottom:18}}>← Back to goals</button><section className="detail-hero"><div className="row between" style={{alignItems:'flex-start'}}><div><div className="eyebrow">LifePilot plan</div><h1 className="h1">{goal.title}</h1><p className="muted" style={{maxWidth:720}}>{goal.description}</p></div><div className="detail-progress"><strong>{progress}%</strong><span className="small muted">complete</span></div></div><div className="progress" style={{marginTop:22}}><div style={{width:`${progress}%`}}/></div></section>{(goal.outcomes.length>0||goal.milestones.length>0)&&<section className="grid grid2" style={{marginTop:18}}>{goal.outcomes.length>0&&<div className="detail-section"><div className="row"><Target size={17} color="var(--primary)"/><strong>Outcomes</strong></div><ul style={{padding:0,listStyle:'none',margin:'14px 0 0'}}>{goal.outcomes.map((x,i)=><li key={i} style={{padding:'11px 13px',background:'var(--surface-2)',borderRadius:11,marginTop:8,fontSize:14}}>{x}</li>)}</ul></div>}{goal.milestones.length>0&&<div className="detail-section"><div className="row"><Sparkles size={17} color="var(--primary)"/><strong>Milestones</strong></div><ol style={{padding:0,listStyle:'none',margin:'14px 0 0'}}>{goal.milestones.map((x,i)=><li key={i} style={{padding:'11px 13px',background:'var(--surface-2)',borderRadius:11,marginTop:8,fontSize:14}}><b style={{color:'var(--primary)',marginRight:8}}>{i+1}.</b>{x}</li>)}</ol></div>}</section>}<section className="detail-section" style={{marginTop:18}}><div className="section-title"><div><h2 className="h2">Your tasks</h2><p className="small muted">Click a task to see its complete instructions.</p></div><button onClick={()=>setShowReplan(v=>!v)} className="btn">{showReplan?'Close':'Adjust plan'}</button></div>{showReplan&&<div style={{marginTop:15,padding:16,border:'1px solid var(--line)',borderRadius:15,background:'var(--surface-2)'}}><label className="label">What changed?</label><textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Example: I only have 20 minutes this week." className="textarea"/><div className="row" style={{marginTop:11}}><button disabled={isThinking||!reason.trim()} onClick={runReplan} className="btn primary">{isThinking?'Replanning…':'Replan with AI'}</button>{error&&<span className="small" style={{color:'var(--danger)'}}>{error}</span>}</div></div>}<div className="stack" style={{marginTop:17}}>{goal.tasks.map(task=><button key={task.id} onClick={()=>setSelected(task)} className="task-row"><span onClick={e=>{e.stopPropagation();void toggleTask(goal.id,task.id)}} className={`check ${task.done?'done':''}`}>{task.done&&<Check size={15}/>}</span><span style={{minWidth:0,flex:1}}><span className={`task-row-title ${task.done?'done':''}`}>{task.title}</span><span className="task-meta"><span>{task.due}</span><span className="row" style={{gap:4}}><Clock3 size={12}/>{task.duration}</span>{task.adjusted&&<span style={{color:'var(--primary)'}}>Adjusted by AI</span>}</span></span><span className="small muted">View →</span></button>)}</div></section>{selected&&<div className="modal" onClick={()=>setSelected(null)}><div className="modalbox" onClick={e=>e.stopPropagation()}><div className="row between" style={{alignItems:'flex-start'}}><div><div className="eyebrow">Task details</div><h2 className="h2" style={{fontSize:25,marginTop:5}}>{selected.title}</h2></div><button className="icon-button" onClick={()=>setSelected(null)}>✕</button></div><div className="grid grid2" style={{marginTop:18}}><div className="card" style={{boxShadow:'none',padding:15}}><p className="small muted">Due</p><strong>{selected.due}</strong></div><div className="card" style={{boxShadow:'none',padding:15}}><p className="small muted">Estimated time</p><strong>{selected.duration}</strong></div></div>{selected.purpose&&<div style={{marginTop:18}}><h3>Why this matters</h3><p className="muted" style={{lineHeight:1.65}}>{selected.purpose}</p></div>}{selected.steps?.length?<div style={{marginTop:18}}><h3>What to do</h3><ol style={{padding:0,listStyle:'none',margin:0}}>{selected.steps.map((s,i)=><li key={i} style={{display:'flex',gap:12,padding:12,border:'1px solid var(--line)',borderRadius:11,marginTop:8,fontSize:14}}><b style={{color:'var(--primary)'}}>{i+1}</b><span>{s}</span></li>)}</ol></div>:null}{selected.result&&<div style={{marginTop:18}}><h3>Expected result</h3><p style={{background:'var(--surface-2)',padding:14,borderRadius:12,fontSize:14}}>{selected.result}</p></div>}<button onClick={()=>{void toggleTask(goal.id,selected.id);setSelected({...selected,done:!selected.done})}} className="btn primary" style={{marginTop:20,width:'100%'}}>{selected.done?'Mark incomplete':'Mark complete'} <Check size={15} style={{verticalAlign:'middle'}}/></button></div></div>}</main>
}
'@ | Set-Content -LiteralPath 'app\goals\[id]\page.tsx'

Write-Host ""
Write-Host "LifePilot complete UI replacement applied." -ForegroundColor Green
Write-Host "Next: npm run build" -ForegroundColor Cyan


