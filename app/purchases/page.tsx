"use client"
import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'
import Navigation from '@/components/Navigation'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [items, setItems] = useState<any[]>([{ productArtNo: '', quantity: 0, purchasePrice: 0 }])
  const [supplierId, setSupplierId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const [pu, p, su] = await Promise.all([
        fetch('/api/purchases').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json())
      ])
      setPurchases(pu)
      setProducts(p)
      setSuppliers(su)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createPurchase(e: any) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      if (items.filter(i => i.productArtNo).length === 0) {
        showToast('Please add at least one item to the purchase', 'error')
        setSubmitting(false)
        return
      }

      if (!invoiceNumber || invoiceNumber.trim() === '') {
        showToast('Invoice number is required', 'error')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplierId || undefined,
          invoiceNumber,
          items: items.filter(i => i.productArtNo)
        })
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(error.error || 'Failed to create purchase', 'error')
        return
      }

      showToast('Purchase recorded successfully!', 'success')
      setItems([{ productArtNo: '', quantity: 0, purchasePrice: 0 }])
      setSupplierId('')
      setInvoiceNumber('')
      setShowForm(false)
      setTimeout(() => load(), 500)
    } catch (error: any) {
      showToast(error.message || 'Failed to create purchase', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function deletePurchase(id: number) {
    if (confirm('Delete this purchase?')) {
      try {
        const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const error = await res.json()
          showToast(error.error || 'Failed to delete purchase', 'error')
          return
        }
        showToast('Purchase deleted successfully', 'success')
        load()
      } catch (error) {
        showToast('Failed to delete purchase', 'error')
        console.error('Failed to delete:', error)
      }
    }
  }

  function exportPurchasesCSV() {
    if (purchases.length === 0) {
      alert('No purchases to export!')
      return
    }
    const headers = ['Invoice', 'Purchase Date', 'Supplier', 'Total Amount']
    const rows = purchases.map(p => [
      p.invoiceNumber,
      new Date(p.purchaseDate).toLocaleDateString('en-IN'),
      suppliers.find(s => s.id === p.supplierId)?.name || '—',
      p.totalAmount.toFixed(2)
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const total = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.purchasePrice)), 0)

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
              Purchases 📦
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginTop: '8px' }}>Manage supplier purchases and inventory intake</p>
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
            + New Purchase
          </button>
          <button
            onClick={exportPurchasesCSV}
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
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Purchases</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', marginTop: '8px' }}>{purchases.length}</p>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Spent</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#f87171', marginTop: '8px' }}>₹{purchases.reduce((s, x) => s + x.totalAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Avg Purchase</p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7', marginTop: '8px' }}>₹{purchases.length > 0 ? (purchases.reduce((s, x) => s + x.totalAmount, 0) / purchases.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '24px' }}>📦 Create Purchase</h2>

            {message && (
              <div style={{ padding: '14px 16px', marginBottom: '24px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#86efac' : '#fca5a5', borderRadius: '8px', border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, fontSize: '14px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={createPurchase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <input
                  required
                  placeholder="Invoice Number"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                />
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '24px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '18px', color: '#cbd5e1', marginBottom: '16px' }}>📄 Purchase Items</h3>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <select
                      value={item.productArtNo}
                      onChange={e => {
                        const p = products.find(x => x.articleNumber === e.target.value)
                        const newItems = [...items]
                        newItems[idx] = { ...item, productArtNo: e.target.value, purchasePrice: p?.purchasePrice || 0 }
                        setItems(newItems)
                      }}
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.articleNumber} value={p.articleNumber}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...items]
                        newItems[idx].quantity = Number(e.target.value)
                        setItems(newItems)
                      }}
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      step="0.01"
                      value={item.purchasePrice}
                      onChange={e => {
                        const newItems = [...items]
                        newItems[idx].purchasePrice = Number(e.target.value)
                        setItems(newItems)
                      }}
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                    />
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#22c55e', display: 'flex', alignItems: 'center' }}>₹{(item.quantity * item.purchasePrice).toFixed(2)}</div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setItems([...items, { productArtNo: '', quantity: 0, purchasePrice: 0 }])}
                  style={{
                    color: '#60a5fa',
                    fontWeight: '600',
                    marginTop: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                >
                  + Add Item
                </button>
              </div>

              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                padding: '20px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                Total Amount: <span style={{ color: '#22c55e' }}>₹{total.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Create Purchase
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(148, 163, 184, 0.1)',
                    color: '#cbd5e1',
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'}
                >
                  Cancel
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
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Invoice</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Supplier</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1' }}>Total</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)'}
                  >
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontWeight: '500', color: '#cbd5e1' }}>{p.invoiceNumber}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{p.supplier?.name || '—'}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 'bold', color: '#22c55e' }}>₹{p.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button
                        onClick={() => deletePurchase(p.id)}
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
