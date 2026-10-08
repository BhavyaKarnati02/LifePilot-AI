import Link from 'next/link'
export default function Page(){return <main className="auth"><div className="authbox card"><h1 className="h1">Authentication error</h1><p className="muted">The authentication link could not be completed. Please try again.</p><Link className="btn primary" href="/auth/login">Back to sign in</Link></div></main>}
