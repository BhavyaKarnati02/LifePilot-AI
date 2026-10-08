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
