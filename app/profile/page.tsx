'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLifePilot } from '@/lib/lifepilot-store'

export default function ProfilePage() {
  const { user, updateProfile } = useLifePilot()
  const router = useRouter()
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setName(user.name || '')
    setEmail(user.email || '')
  }, [user.name, user.email])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await updateProfile(name)
      setMessage('Profile updated.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <main className="container">
      <div className="eyebrow">Your account</div>
      <h1 className="h1">Profile</h1>
      <p className="muted">
        Manage the basic information LifePilot uses for your account.
      </p>

      <section className="card" style={{ marginTop: 20, maxWidth: 720 }}>
        <form className="stack" onSubmit={save}>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              readOnly
            />
            <p className="small muted" style={{ marginTop: 6 }}>
              Email is managed by your authentication account.
            </p>
          </div>

          {message && <div className="success">{message}</div>}
          {error && <div className="alert">{error}</div>}

          <button
            className="btn primary"
            disabled={saving}
          >
            {saving ? 'Savingâ€¦' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 16, maxWidth: 720 }}>
        <h2 className="h2">Account</h2>
        <p className="muted small">
          Sign out from this device.
        </p>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={logout}
        >
          Logout
        </button>
      </section>
    </main>
  )
}