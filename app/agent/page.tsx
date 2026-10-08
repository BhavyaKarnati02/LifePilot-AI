'use client'
import {useState} from 'react'
import {useLifePilot} from '@/lib/lifepilot-store'
export default function Page(){
 const{messages,sendMessage,isThinking}=useLifePilot();const[text,setText]=useState('')
 async function submit(e:React.FormEvent){e.preventDefault();if(!text.trim())return;const v=text;setText('');try{await sendMessage(v)}catch(e){alert(e instanceof Error?e.message:'Agent unavailable.')}}
 return <main className="container"><div className="eyebrow">Agentic assistant</div><h1 className="h1">LifePilot Agent</h1><p className="muted">Ask about your goals, progress, constraints or what to work on next.</p><section className="card chat" style={{marginTop:20}}><div className="chat-body">{messages.length?<div>{messages.map(m=><div key={m.id} className={`chat-message ${m.role==='user'?'chat-user':'chat-assistant'}`}><div className="small muted">{m.role==='user'?'You':'LifePilot'}</div><div style={{marginTop:5}}>{m.content}</div></div>)}</div>:<div className="empty">Try: “What should I work on today?”</div>}</div><form className="row" style={{marginTop:16}} onSubmit={submit}><input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Ask LifePilot…"/><button className="btn primary" disabled={isThinking||!text.trim()}>{isThinking?'…':'Send'}</button></form></section></main>
}
