"use client"
import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'
import Navigation from '@/components/Navigation'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({ name: '', phone: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await fetch('/api/customers').then(r => r.json())
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submit(e: any) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      if (!form.name || form.name.trim() === '') {
        showToast('Customer name is required', 'error')
        setSubmitting(false)
        return
      }
      
      const url = editingId ? `/api/customers/${editingId}` : '/api/customers'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(error.error || 'Failed to save customer', 'error')
        return
      }

      showToast(editingId ? 'Customer updated successfully!' : 'Customer added successfully!', 'success')
      setForm({ name: '', phone: '', address: '' })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => load(), 500)
    } catch (error: any) {
      showToast(error.message || 'Failed to save customer', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(customer: any) {
    setForm(customer)
    setEditingId(customer.id)
    setShowForm(true)
  }

  async function deleteCustomer(id: number) {
    if (confirm('Delete this customer?')) {
      try {
        const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const error = await res.json()
          showToast(error.error || 'Failed to delete customer', 'error')
          return
        }
        showToast('Customer deleted successfully', 'success')
        load()
      } catch (error) {
        showToast('Failed to delete customer', 'error')
        console.error('Failed to delete:', error)
      }
    }
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', minHeight: '100vh' }}>
      <Navigation />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px'
            }}>
              Customers 👥
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Manage your customer list and details</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setForm({ name: '', phone: '', address: '' })
            }}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
              transform: showForm ? 'scale(0.98)' : 'scale(1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            + Add Customer
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Customers</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#f97316', marginTop: '8px' }}>{customers.length}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '48px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '24px' }}>
              {editingId ? '✏️ Edit Customer' : '➕ Add New Customer'}
            </h2>

            {message && (
              <div style={{ padding: '14px 16px', marginBottom: '24px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#86efac' : '#fca5a5', borderRadius: '8px', border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '14px' }}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Personal Information Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fb923c', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Full Name *</label>
                    <input
                      required
                      placeholder="e.g., Rajesh Kumar"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Customer's full name</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Phone Number 📱</label>
                    <input
                      placeholder="e.g., +91 9999888877"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>For quick contact and order updates</p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#06b6d4', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Address Details</h3>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Complete Address</label>
                  <textarea
                    placeholder="e.g., 123 Main Street, Apartment 4B, New York, NY 10001"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Street address, city, state, and postal code for delivery</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '16px 28px',
                    background: 'linear-gradient(to right, #f97316, #fb923c)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)'
                  }}
                >
                  {editingId ? '✅ Update Customer' : '✨ Save Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '16px 28px',
                    background: 'rgba(100, 116, 139, 0.2)',
                    color: '#cbd5e1',
                    borderRadius: '12px',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(100, 116, 139, 0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cards View */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '4px solid rgba(249, 115, 22, 0.3)',
              borderTop: '4px solid #fb923c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>No customers yet. Add one to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {customers.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  {c.name}
                </h3>
                {c.phone && (
                  <p style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>
                    📱 {c.phone}
                  </p>
                )}
                {c.address && (
                  <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '13px', lineHeight: '1.5' }}>
                    📍 {c.address}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                  <button
                    onClick={() => handleEdit(c)}
                    style={{
                      flex: 1,
                      color: '#60a5fa',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    style={{
                      flex: 1,
                      color: '#f87171',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#f87171'}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
