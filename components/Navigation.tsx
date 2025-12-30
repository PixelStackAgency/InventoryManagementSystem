"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { hasPermission, user } = useUser()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/sales', label: 'Sales', icon: '💳' },
    { href: '/purchases', label: 'Purchases', icon: '📥' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/suppliers', label: 'Suppliers', icon: '🚚' },
  ]

  const adminLinks = [
    { href: '/staff', label: 'Staff Management', icon: '👤', permission: 'MANAGE_STAFF' },
    { href: '/settings', label: 'Settings', icon: '⚙️', permission: 'MANAGE_SETTINGS' },
  ]

  return (
    <>
      {/* Top Navigation */}
      <nav style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        borderBottom: '1px solid rgba(96, 165, 250, 0.2)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                }}>
                  <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>InventoryPro</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Inventory Management</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    color: '#cbd5e1',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    fontSize: '14px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.15)'
                    e.currentTarget.style.color = '#60a5fa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#cbd5e1'
                  }}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}

              {/* Admin Links */}
              {adminLinks.map((link) => (
                hasPermission(link.permission) && (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      color: '#fbbf24',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      fontSize: '14px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)'
                      e.currentTarget.style.color = '#fcd34d'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#fbbf24'
                    }}
                  >
                    <span>{link.icon}</span> {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={logout}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                  e.currentTarget.style.color = '#f87171'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                  e.currentTarget.style.color = '#cbd5e1'
                }}
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  borderRadius: '10px',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)', borderTop: '1px solid rgba(96, 165, 250, 0.2)', padding: '16px 32px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    color: '#cbd5e1',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    textDecoration: 'none',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.15)'
                    e.currentTarget.style.color = '#60a5fa'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#cbd5e1'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}

              {/* Admin Links Mobile */}
              {adminLinks.map((link) => (
                hasPermission(link.permission) && (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'flex',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      color: '#fbbf24',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      textDecoration: 'none',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)'
                      e.currentTarget.style.color = '#fcd34d'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#fbbf24'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.icon}</span> {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

