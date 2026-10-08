import Link from 'next/link'
export default function Page(){return <main className="auth"><div className="authbox card"><div className="eyebrow">LifePilot AI</div><h1 className="h1">Check your email</h1><p className="muted">Your account was created. Confirm your email, then sign in.</p><Link className="btn primary" href="/auth/login">Go to sign in</Link></div></main>}
