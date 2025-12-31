"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: any) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)', marginBottom: '24px' }}>
            <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', letterSpacing: '-1px' }}>InventoryPro</h1>
          <p style={{ color: '#cbd5e1', fontSize: '16px' }}>Professional Inventory Management System</p>
        </div>

        {/* Login Card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)', padding: '48px 32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '32px', textAlign: 'center' }}>Welcome Back</h2>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#cbd5e1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{ width: '100%', padding: '14px 18px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '12px', fontSize: '15px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#cbd5e1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: '100%', padding: '14px 18px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '12px', fontSize: '15px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px' }}>
                <p style={{ fontSize: '14px', color: '#f87171', fontWeight: '600' }}>⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '16px 20px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)', marginTop: '10px' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.5)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)')}
            >
              {loading ? '🔄 Signing in...' : '✓ Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(96, 165, 250, 0.2)' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '12px' }}>
              � Secure Authentication
            </p>
            <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>
              <p>This application is fully secured with:</p>
              <p>✓ JWT Authentication • ✓ Role-Based Access • ✓ Encrypted Passwords</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Professional Inventory Management System © 2025
          </p>
        </div>
      </div>
    </div>
  )
}

