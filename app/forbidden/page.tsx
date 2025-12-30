'use client'
import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', padding: '16px' }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div style={{ fontSize: '120px', marginBottom: '24px' }}>🔐</div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(to right, #ef4444, #f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>403 - Access Denied</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '32px' }}>You don't have permission to access this resource.</p>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '40px' }}>Only Super Admin or authorized staff can perform this action.</p>
        <Link href="/" style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
