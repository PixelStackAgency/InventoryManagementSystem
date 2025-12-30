'use client'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'

type Product = any

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({
    articleNumber: '',
    name: '',
    category: '',
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStock: 0,
    unit: 'pcs'
  })

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const filtered = products.filter(p =>
      p.articleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  async function load() {
    try {
      setLoading(true)
      const data = await fetch('/api/products').then(r => r.json())
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submit(e: any) {
    e.preventDefault()
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Product saved successfully:', data)
      
      setForm({
        articleNumber: '',
        name: '',
        category: '',
        brand: '',
        purchasePrice: 0,
        sellingPrice: 0,
        quantity: 0,
        minStock: 0,
        unit: 'pcs'
      })
      setEditingId(null)
      setShowForm(false)
      load()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function handleEdit(product: Product) {
    setForm(product)
    setEditingId(product.articleNumber)
    setShowForm(true)
  }

  async function deleteProduct(articleNumber: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${articleNumber}`, { method: 'DELETE' })
        load()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  function exportToCSV() {
    if (filteredProducts.length === 0) {
      alert('No products to export!')
      return
    }
    const headers = ['Article #', 'Product Name', 'Category', 'Brand', 'Buy Price', 'Sell Price', 'Profit/Unit', 'Quantity', 'Min Stock', 'Stock Value', 'Status']
    const rows = filteredProducts.map(p => {
      const profit_per_unit = p.sellingPrice - p.purchasePrice
      const isLowStock = p.quantity <= p.minStock
      return [
        p.articleNumber,
        p.name,
        p.category || '',
        p.brand || '',
        p.purchasePrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        profit_per_unit.toFixed(2),
        p.quantity,
        p.minStock,
        (p.sellingPrice * p.quantity).toFixed(2),
        isLowStock ? 'Low Stock' : 'OK'
      ]
    })
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const profit = filteredProducts.reduce((sum, p) => sum + ((p.sellingPrice - p.purchasePrice) * p.quantity), 0)
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Navigation />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>Products 📦</h1>
            <p style={{ color: '#cbd5e1', fontSize: '16px' }}>Manage your complete inventory with all product details</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                width: '250px',
                transition: 'all 0.3s'
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
            />
            <button
              onClick={exportToCSV}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(to right, #10b981, #34d399)',
                color: 'white',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setForm({
                  articleNumber: '',
                  name: '',
                  category: '',
                  brand: '',
                  purchasePrice: 0,
                  sellingPrice: 0,
                  quantity: 0,
                  minStock: 0,
                  unit: 'pcs'
                })
              }}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                color: 'white',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.4)'
              }}
            >
              + New Product
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Total Products</p>
            <p style={{ fontSize: '40px', fontWeight: '800', color: '#60a5fa', marginTop: '12px' }}>{filteredProducts.length}</p>
            <div style={{ height: '4px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: '2px', marginTop: '12px' }}></div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Total Inventory Value</p>
            <p style={{ fontSize: '40px', fontWeight: '800', color: '#a855f7', marginTop: '12px' }}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div style={{ height: '4px', background: 'linear-gradient(to right, #a855f7, #8b5cf6)', borderRadius: '2px', marginTop: '12px' }}></div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Potential Profit</p>
            <p style={{ fontSize: '40px', fontWeight: '800', color: '#22c55e', marginTop: '12px' }}>₹{profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div style={{ height: '4px', background: 'linear-gradient(to right, #22c55e, #16a34a)', borderRadius: '2px', marginTop: '12px' }}></div>
          </div>
        </div>

        {showForm && (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '16px', padding: '32px', marginBottom: '48px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '32px' }}>
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Basic Info Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Article Number *</label>
                    <input
                      required
                      placeholder="e.g., ART-001"
                      value={form.articleNumber}
                      onChange={e => setForm({ ...form, articleNumber: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s', fontFamily: 'monospace' }}
                      disabled={editingId !== null}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>🔒 Cannot change after creation</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Product Name *</label>
                    <input
                      required
                      placeholder="e.g., Laptop Pro"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>The name shown in tables and reports</p>
                  </div>
                </div>
              </div>

              {/* Classification Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏷️ Classification</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Category</label>
                    <input
                      placeholder="e.g., Electronics, Clothing"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Organize products by type</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Brand</label>
                    <input
                      placeholder="e.g., Samsung, Nike"
                      value={form.brand}
                      onChange={e => setForm({ ...form, brand: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Manufacturer or brand name</p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f97316', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Pricing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Purchase Price (Cost Price) * ₹</label>
                    <input
                      required
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.purchasePrice}
                      onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })}
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
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>What you paid to get this product</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Selling Price (MRP) * ₹</label>
                    <input
                      required
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.sellingPrice}
                      onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Price at which you sell (customer sees this)</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Profit/Unit 💚</label>
                    <div style={{ padding: '12px 14px', border: (form.sellingPrice - form.purchasePrice) >= 0 ? '2px solid rgba(34, 197, 94, 0.5)' : '2px solid rgba(248, 113, 113, 0.5)', borderRadius: '10px', background: (form.sellingPrice - form.purchasePrice) >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: (form.sellingPrice - form.purchasePrice) >= 0 ? '#86efac' : '#fca5a5', fontWeight: '600', fontSize: '16px' }}>
                      ₹{(form.sellingPrice - form.purchasePrice).toFixed(2)}
                    </div>
                    <p style={{ fontSize: '12px', color: (form.sellingPrice - form.purchasePrice) >= 0 ? '#94a3b8' : '#fca5a5', marginTop: '4px' }}>
                      Automatically calculated: Selling - Purchase
                      {(form.sellingPrice - form.purchasePrice) < 0 && ' (Negative = Loss per unit)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#06b6d4', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Inventory</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Current Quantity * (Units in Stock)</label>
                    <input
                      required
                      placeholder="0"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>How many you have right now</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Minimum Stock Level * (Reorder Point)</label>
                    <input
                      required
                      placeholder="0"
                      type="number"
                      min="0"
                      value={form.minStock}
                      onChange={e => setForm({ ...form, minStock: Number(e.target.value) })}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9', transition: 'all 0.3s' }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Alert when stock falls below this</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Stock Value 💜</label>
                    <div style={{ padding: '12px 14px', border: '2px solid rgba(168, 85, 247, 0.5)', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#d8b4fe', fontWeight: '600', fontSize: '16px' }}>
                      ₹{(form.sellingPrice * form.quantity).toFixed(2)}
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Total value of inventory: Price × Qty</p>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '600' }}>Stock Status Preview:</p>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginTop: '8px',
                      background: form.quantity <= form.minStock ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                      color: form.quantity <= form.minStock ? '#fca5a5' : '#86efac',
                      border: form.quantity <= form.minStock ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)'
                    }}>
                      {form.quantity <= form.minStock ? '⚠️ LOW STOCK' : '✓ GOOD STOCK'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '13px' }}>
                    <p>Current: <span style={{ color: '#60a5fa', fontWeight: '700' }}>{form.quantity}</span></p>
                    <p>Minimum: <span style={{ color: '#f97316', fontWeight: '700' }}>{form.minStock}</span></p>
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
                    background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
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
                  {editingId ? '✅ Update Product' : '✨ Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
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

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '14px', padding: '24px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Products</p>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', marginTop: '8px' }}>{filteredProducts.length}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '24px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Value</p>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7', marginTop: '8px' }}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '14px', padding: '24px', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Profit Potential</p>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#22c55e', marginTop: '8px' }}>₹{profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: '56px', height: '56px', border: '4px solid rgba(96, 165, 250, 0.2)', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#cbd5e1', fontSize: '16px' }}>Loading products...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '14px', padding: '48px 24px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
            <p style={{ color: '#cbd5e1', fontSize: '16px' }}>No products found. Start by adding one!</p>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '14px', overflowX: 'auto', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead style={{ background: 'rgba(51, 65, 85, 0.8)', borderBottom: '2px solid rgba(96, 165, 250, 0.3)', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '16px 14px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Article #</th>
                  <th style={{ padding: '16px 14px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1' }}>Product Name</th>
                  <th style={{ padding: '16px 14px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Category</th>
                  <th style={{ padding: '16px 14px', textAlign: 'left', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Brand</th>
                  <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Buy Price</th>
                  <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Sell Price</th>
                  <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Profit/Unit</th>
                  <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Qty</th>
                  <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Min Stock</th>
                  <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Stock Value</th>
                  <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '600', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => {
                  const profit_per_unit = p.sellingPrice - p.purchasePrice
                  const isLowStock = p.quantity <= p.minStock
                  return (
                  <tr key={p.articleNumber} style={{ borderBottom: '1px solid rgba(96, 165, 250, 0.1)', background: idx % 2 === 0 ? 'transparent' : 'rgba(96, 165, 250, 0.05)', transition: 'all 0.2s' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(96, 165, 250, 0.15)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(96, 165, 250, 0.05)'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '600', fontSize: '11px', color: '#60a5fa' }}>{p.articleNumber}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '500', color: '#f1f5f9', fontSize: '13px' }}>{p.name}</td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1', fontSize: '12px' }}>{p.category ? <span style={{ background: 'rgba(96, 165, 250, 0.2)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{p.category}</span> : '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1', fontSize: '12px' }}>{p.brand ? <span style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{p.brand}</span> : '—'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>₹{p.purchasePrice.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>₹{p.sellingPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: profit_per_unit > 0 ? '#22c55e' : '#f87171', fontWeight: '700', fontSize: '12px' }}>₹{profit_per_unit.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: isLowStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: isLowStock ? '#fca5a5' : '#86efac', fontWeight: '600', borderRadius: '6px', fontSize: '12px' }}>
                      {p.quantity}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#cbd5e1', fontSize: '12px' }}>{p.minStock}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#a855f7', fontWeight: '700', fontSize: '12px' }}>₹{(p.sellingPrice * p.quantity).toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: isLowStock ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                        color: isLowStock ? '#fca5a5' : '#86efac',
                        border: isLowStock ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                        whiteSpace: 'nowrap'
                      }}>
                        {isLowStock ? '⚠️ Low' : '✓ OK'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: '600', fontSize: '11px', border: 'none', padding: '3px 8px', borderRadius: '4px', transition: 'all 0.2s', background: 'rgba(96, 165, 250, 0.1)' }}
                        title="Edit"
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(96, 165, 250, 0.25)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteProduct(p.articleNumber)}
                        style={{ color: '#f87171', cursor: 'pointer', fontWeight: '600', fontSize: '11px', border: 'none', padding: '3px 8px', borderRadius: '4px', transition: 'all 0.2s', background: 'rgba(248, 113, 113, 0.1)' }}
                        title="Delete"
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.25)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
