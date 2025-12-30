'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'
import Navigation from '@/components/Navigation'

interface SystemSettings {
  id: number
  businessName: string
  businessType: string
  enableShelfLocation: boolean
  enableWarehouseMode: boolean
  currencySymbol: string
  enableBulkImport: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { hasPermission } = useUser()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error('Failed to load settings')
        const data = await res.json()
        setSettings(data)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasPermission('MANAGE_SETTINGS')) {
      router.push('/forbidden')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.status === 403) {
        router.push('/forbidden')
        return
      }

      if (!res.ok) throw new Error('Failed to save settings')

      const updated = await res.json()
      setSettings(updated)
      setSuccess('Settings saved successfully!')
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!settings) return <div className="p-8 text-red-600">Failed to load settings</div>

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Navigation />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '18px', background: 'linear-gradient(to right, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Settings</h1>

          {error && <div style={{ padding: '12px', marginBottom: '12px', background: 'rgba(239,68,68,0.08)', color: '#fecaca', borderRadius: '8px' }}>{error}</div>}
          {success && <div style={{ padding: '12px', marginBottom: '12px', background: 'rgba(16,185,129,0.08)', color: '#bbf7d0', borderRadius: '8px' }}>{success}</div>}

          <form onSubmit={handleSave} style={{ display: 'block', gap: '18px', padding: '28px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(51,65,85,0.8) 100%)', border: '1px solid rgba(96,165,250,0.15)', backdropFilter: 'blur(6px)' }}>
        {/* Business Information */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f1f5f9', borderBottom: '1px solid rgba(96,165,250,0.2)', paddingBottom: '12px' }}>Business Information</h2>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', transition: 'all 0.2s' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Business Type</label>
            <select
              value={settings.businessType}
              onChange={(e) => setSettings({ ...settings, businessType: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', transition: 'all 0.2s' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              <option value="RETAILER">Retailer (Direct to Customer)</option>
              <option value="WHOLESALER">Wholesaler (Bulk Sales)</option>
              <option value="WAREHOUSE">Warehouse (Distribution Center)</option>
            </select>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              {settings.businessType === 'RETAILER' && 'Optimized for direct customer sales with single unit orders'}
              {settings.businessType === 'WHOLESALER' && 'Optimized for bulk orders to resellers and businesses'}
              {settings.businessType === 'WAREHOUSE' && 'Optimized for inventory distribution across multiple locations'}
            </p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              maxLength={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', transition: 'all 0.2s' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            />
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f1f5f9', borderBottom: '1px solid rgba(96,165,250,0.2)', paddingBottom: '12px' }}>Features</h2>

          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', padding: '12px', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <input
              type="checkbox"
              checked={settings.enableShelfLocation}
              onChange={(e) => setSettings({ ...settings, enableShelfLocation: e.target.checked })}
              style={{ marginRight: '12px', width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Enable Shelf/Storage Location</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Track physical shelf or storage location for each product
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', padding: '12px', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <input
              type="checkbox"
              checked={settings.enableWarehouseMode}
              onChange={(e) => setSettings({ ...settings, enableWarehouseMode: e.target.checked })}
              style={{ marginRight: '12px', width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Enable Warehouse Mode</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Support for multiple warehouses and inter-warehouse transfers
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', padding: '12px', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <input
              type="checkbox"
              checked={settings.enableBulkImport}
              onChange={(e) => setSettings({ ...settings, enableBulkImport: e.target.checked })}
              style={{ marginRight: '12px', width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Enable Bulk Import</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Allow importing products from CSV/Excel files
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', background: saving ? '#64748b' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: '10px 24px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#64748b'}
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </main>
  </div>
  )
}
