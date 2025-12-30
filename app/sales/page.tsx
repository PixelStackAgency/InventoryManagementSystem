"use client"
import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'
import Navigation from '@/components/Navigation'

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [items, setItems] = useState<any[]>([{ productArtNo: '', quantity: 0, sellingPrice: 0 }])
  const [customerId, setCustomerId] = useState('')
  const [paymentMode, setPaymentMode] = useState('CASH')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const [sl, p, c] = await Promise.all([
        fetch('/api/sales').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/customers').then(r => r.json())
      ])
      setSales(sl)
      setProducts(p)
      setCustomers(c)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createSale(e: any) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      if (items.filter(i => i.productArtNo).length === 0) {
        showToast('Please add at least one item to the sale', 'error')
        setSubmitting(false)
        return
      }

      const subtotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.sellingPrice)), 0)
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || undefined,
          paymentMode,
          subtotal,
          discount: Number(discount),
          items: items.filter(i => i.productArtNo)
        })
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(error.error || 'Failed to create sale', 'error')
        return
      }

      showToast('Sale recorded successfully!', 'success')
      setItems([{ productArtNo: '', quantity: 0, sellingPrice: 0 }])
      setCustomerId('')
      setPaymentMode('CASH')
      setDiscount(0)
      setShowForm(false)
      setTimeout(() => load(), 500)
    } catch (error: any) {
      showToast(error.message || 'Failed to create sale', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteSale(id: number) {
    if (confirm('Delete this sale?')) {
      try {
        const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const error = await res.json()
          showToast(error.error || 'Failed to delete sale', 'error')
          return
        }
        showToast('Sale deleted successfully', 'success')
        load()
      } catch (error) {
        showToast('Failed to delete sale', 'error')
        console.error('Failed to delete:', error)
      }
    }
  }

  function exportSalesCSV() {
    if (sales.length === 0) {
      alert('No sales to export!')
      return
    }
    const headers = ['Invoice #', 'Date', 'Customer', 'Payment Mode', 'Subtotal', 'Discount', 'Total']
    const rows = sales.map(s => [
      s.id,
      new Date(s.saleDate).toLocaleDateString('en-IN'),
      customers.find(c => c.id === s.customerId)?.name || 'Walk-in',
      s.paymentMode,
      s.subtotal.toFixed(2),
      s.discount.toFixed(2),
      s.totalAmount.toFixed(2)
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.sellingPrice)), 0)
  const total = subtotal - Number(discount)

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', minHeight: '100vh' }}>
      <Navigation />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px'
            }}>
              Sales 💰
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Process sales transactions and track revenue</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              transform: showForm ? 'scale(0.98)' : 'scale(1)',
              marginRight: '12px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}
          >
            + New Sale
          </button>
          <button
            onClick={exportSalesCSV}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Sales</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', marginTop: '8px' }}>{sales.length}</p>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#22c55e', marginTop: '8px' }}>₹{sales.reduce((s, x) => s + x.totalAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Avg Sale Value</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7', marginTop: '8px' }}>₹{sales.length > 0 ? (sales.reduce((s, x) => s + x.totalAmount, 0) / sales.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '48px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '24px' }}>
              💰 Create New Sale
            </h2>

            {message && (
              <div style={{ padding: '14px 16px', marginBottom: '24px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#86efac' : '#fca5a5', borderRadius: '8px', border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '14px' }}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={createSale} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Customer & Payment Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Customer & Payment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Customer (Optional)</label>
                    <select
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <option value="">Select Customer or Walk-in</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>For tracking repeat customers</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Payment Mode 💳</label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <option value="CASH">💵 Cash</option>
                      <option value="CARD">💳 Card</option>
                      <option value="UPI">📱 UPI</option>
                      <option value="CHECK">📄 Check</option>
                      <option value="CREDIT">📋 Credit</option>
                    </select>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>How customer will pay</p>
                  </div>
                </div>
              </div>

              {/* Sale Items Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Sale Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 120px 120px 140px auto', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>Product</label>
                        <select
                          value={item.productArtNo}
                          onChange={e => {
                            const p = products.find(x => x.articleNumber === e.target.value)
                            const newItems = [...items]
                            newItems[idx] = { ...item, productArtNo: e.target.value, sellingPrice: p?.sellingPrice || 0 }
                            setItems(newItems)
                          }}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.8)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <option value="">Select</option>
                          {products.map(p => (
                            <option key={p.articleNumber} value={p.articleNumber}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>Qty</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={item.quantity}
                          onChange={e => {
                            const newItems = [...items]
                            newItems[idx].quantity = Number(e.target.value)
                            setItems(newItems)
                          }}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.8)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>Price ₹</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={e => {
                            const newItems = [...items]
                            newItems[idx].sellingPrice = Number(e.target.value)
                            setItems(newItems)
                          }}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.8)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                        />
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px 12px', border: '2px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', fontWeight: '600', color: '#86efac', fontSize: '13px' }}>
                        ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setItems([...items, { productArtNo: '', quantity: 0, sellingPrice: 0 }])}
                    style={{ color: '#60a5fa', fontWeight: '600', marginTop: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'color 0.3s ease', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                  >
                    + Add Another Item
                  </button>
                </div>
              </div>

              {/* Bill Summary Section */}
              <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💹 Bill Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Subtotal</p>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#22c55e' }}>₹{subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Discount (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Final deduction from total</p>
                  </div>
                  <div>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Final Total 🎯</p>
                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#60a5fa' }}>₹{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '16px 28px',
                    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  ✅ Complete Sale
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

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '4px solid rgba(59, 130, 246, 0.3)',
              borderTop: '4px solid #60a5fa',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            overflow: 'auto'
          }}>
            <table style={{ width: '100%', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '2px solid rgba(148, 163, 184, 0.2)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Invoice #</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Customer</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Payment</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1' }}>Subtotal</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1' }}>Discount</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1' }}>Total</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s, idx) => (
                  <tr
                    key={s.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)'}
                  >
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontWeight: '600', color: '#60a5fa', fontSize: '12px' }}>{s.invoiceNumber}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{s.customer?.name || 'Walk-in'}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1', fontSize: '12px' }}>{s.paymentMode || 'CASH'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', color: '#cbd5e1' }}>₹{s.subtotal?.toFixed(2) || s.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', color: '#fb923c' }}>₹{(s.discount || 0).toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>₹{s.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteSale(s.id)}
                        style={{
                          color: '#f87171',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#f87171'}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
