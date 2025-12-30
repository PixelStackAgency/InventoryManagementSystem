"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const products = await fetch('/api/products').then(r => r.json())
        const sales = await fetch('/api/sales').then(r => r.json())
        const purchases = await fetch('/api/purchases').then(r => r.json())

        const totalProducts = products.length
        const totalStockValue = products.reduce((s: number, p: any) => s + ((p.purchasePrice || 0) * (p.quantity || 0)), 0)
        const totalRevenue = sales.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0)
        const weeklySales = sales.slice(0, 7).reduce((s: number, it: any) => s + (it.totalAmount || 0), 0)
        const lowStock = products.filter((p: any) => (p.quantity || 0) <= (p.minStock || 0))
        const topProducts = products.sort((a: any, b: any) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 5)

        setStats({
          totalProducts,
          totalStockValue,
          totalRevenue,
          weeklySales,
          lowStock,
          topProducts,
          totalSales: sales.length,
          totalPurchases: purchases.length
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid #dbeafe', borderTop: '4px solid #2563eb', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#4b5563' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Navigation />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '52px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px', letterSpacing: '-1px' }}>Dashboard</h1>
          <p style={{ color: '#cbd5e1', fontSize: '18px' }}>Real-time inventory and business metrics</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {/* Total Products */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(59, 130, 246, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</p>
                <p style={{ fontSize: '44px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '8px' }}>{stats?.totalProducts || 0}</p>
              </div>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>📦</div>
            </div>
          </div>

          {/* Stock Value */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(168, 85, 247, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Value</p>
                <p style={{ fontSize: '44px', fontWeight: '800', color: '#a855f7', marginTop: '8px' }}>₹{(stats?.totalStockValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>💰</div>
            </div>
          </div>

          {/* Total Sales */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(34, 197, 94, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</p>
                <p style={{ fontSize: '44px', fontWeight: '800', color: '#22c55e', marginTop: '8px' }}>{stats?.totalSales || 0}</p>
                {stats?.weeklySales > 0 && <p style={{ fontSize: '13px', color: '#86efac', fontWeight: '600', marginTop: '8px' }}>↑ ₹{stats.weeklySales.toFixed(0)} this week</p>}
              </div>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>📈</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(251, 146, 60, 0.3)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</p>
                <p style={{ fontSize: '44px', fontWeight: '800', color: '#fb9241', marginTop: '8px' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>💵</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '48px' }}>
          {/* Low Stock Alert */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(251, 146, 60, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9' }}>Low Stock Alert</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', background: 'rgba(251, 146, 60, 0.2)', border: '1px solid rgba(251, 146, 60, 0.4)', color: '#fb9241', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
                ⚠️ {stats?.lowStock?.length || 0} Items
              </span>
            </div>

            {stats?.lowStock && stats.lowStock.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.lowStock.slice(0, 5).map((p: any) => (
                  <div key={p.articleNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)', borderRadius: '12px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '15px' }}>{p.name}</p>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>Art. No: {p.articleNumber}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#f87171' }}>{p.quantity}</p>
                      <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Min: {p.minStock}</p>
                    </div>
                  </div>
                ))}
                {stats?.lowStock?.length > 5 && (
                  <Link href="/products" style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginTop: '8px' }}>
                    View all ({stats.lowStock.length} items) →
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#cbd5e1' }}>
                <p style={{ fontSize: '18px' }}>✓ All items are in good stock</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '24px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/products" style={{ display: 'block', padding: '16px 20px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', borderRadius: '12px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s', fontSize: '15px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                📦 Manage Products
              </Link>
              <Link href="/sales" style={{ display: 'block', padding: '16px 20px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: '12px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s', fontSize: '15px', border: '1px solid rgba(96, 165, 250, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)' }}>
                💳 New Sale
              </Link>
              <Link href="/purchases" style={{ display: 'block', padding: '16px 20px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: '12px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s', fontSize: '15px', border: '1px solid rgba(96, 165, 250, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)' }}>
                📥 New Purchase
              </Link>
              <Link href="/customers" style={{ display: 'block', padding: '16px 20px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', borderRadius: '12px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s', fontSize: '15px', border: '1px solid rgba(96, 165, 250, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)' }}>
                👥 Customers
              </Link>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {stats?.topProducts && stats.topProducts.length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '28px' }}>Top Products by Stock</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '15px', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(51, 65, 85, 0.8)', borderBottom: '2px solid rgba(96, 165, 250, 0.2)' }}>
                  <tr>
                    <th style={{ padding: '18px 20px', textAlign: 'left', color: '#cbd5e1', fontWeight: '700', fontSize: '13px' }}>Product</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', color: '#cbd5e1', fontWeight: '700', fontSize: '13px' }}>Article No</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', color: '#cbd5e1', fontWeight: '700', fontSize: '13px' }}>Quantity</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', color: '#cbd5e1', fontWeight: '700', fontSize: '13px' }}>Unit Price</th>
                    <th style={{ padding: '18px 20px', textAlign: 'right', color: '#cbd5e1', fontWeight: '700', fontSize: '13px' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p: any, idx: number) => (
                    <tr key={p.articleNumber} style={{ borderBottom: '1px solid rgba(96, 165, 250, 0.1)', background: idx % 2 === 0 ? 'transparent' : 'rgba(96, 165, 250, 0.05)' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '600', color: '#f1f5f9' }}>{p.name}</td>
                      <td style={{ padding: '18px 20px', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: '500' }}>{p.articleNumber}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                          {p.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#cbd5e1' }}>₹{p.sellingPrice.toFixed(2)}</td>
                      <td style={{ padding: '18px 20px', fontWeight: '700', color: '#a855f7', textAlign: 'right' }}>₹{(p.sellingPrice * p.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
