'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'
import Navigation from '@/components/Navigation'

interface Permission {
  id: number
  name: string
  description: string
}

interface StaffUser {
  id: number
  username: string
  role: string
  createdAt: string
  permissions: Array<{
    permission: Permission
    granted: boolean
  }>
}

export default function StaffPage() {
  const router = useRouter()
  const { user, hasPermission } = useUser()
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch staff and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!hasPermission('MANAGE_STAFF')) {
          router.push('/forbidden')
          return
        }

        const [staffRes, permRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/permissions')
        ])

        if (!staffRes.ok || !permRes.ok) {
          setError('Failed to load data')
          return
        }

        const staffData = await staffRes.json()
        const permData = await permRes.json()

        setStaff(staffData)
        setPermissions(permData)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hasPermission, router])

  // Handle create/update staff
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingUserId) {
        // Update permissions
        const res = await fetch(`/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: selectedPermissions })
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update')
        }

        setSuccess('Staff permissions updated!')
        setEditingUserId(null)
      } else {
        // Create new staff
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, permissions: selectedPermissions })
        })

        if (res.status === 403) {
          router.push('/forbidden')
          return
        }

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create')
        }

        setSuccess('Staff member created!')
        setFormData({ username: '', password: '' })
        setShowCreateForm(false)
      }

      // Refresh staff list
      const staffRes = await fetch('/api/users')
      const updatedStaff = await staffRes.json()
      setStaff(updatedStaff)
      setSelectedPermissions([])
    } catch (err) {
      setError(String(err))
    }
  }

  // Handle edit
  const handleEdit = (staffUser: StaffUser) => {
    setEditingUserId(staffUser.id)
    setSelectedPermissions(
      staffUser.permissions
        .filter((p) => p.granted)
        .map((p) => p.permission.id)
    )
    setShowCreateForm(true)
  }

  // Handle delete
  const handleDelete = async (staffUserId: number) => {
    if (!confirm('Deactivate this staff member?')) return

    try {
      const res = await fetch(`/api/users/${staffUserId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to deactivate')

      setSuccess('Staff member deactivated')
      setStaff(staff.filter((s) => s.id !== staffUserId))
    } catch (err) {
      setError(String(err))
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Navigation />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9' }}>Staff Management</h1>
            {!showCreateForm && (
              <button
                onClick={() => {
                  setShowCreateForm(true)
                  setEditingUserId(null)
                  setFormData({ username: '', password: '' })
                  setSelectedPermissions([])
                }}
                style={{ padding: '10px 16px', background: 'linear-gradient(to right, #10b981, #34d399)', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 700 }}
              >
                + Add Staff
              </button>
            )}
          </div>

          {error && <div style={{ padding: '12px', marginBottom: '12px', background: 'rgba(239,68,68,0.08)', color: '#fecaca', borderRadius: '8px' }}>{error}</div>}
          {success && <div style={{ padding: '12px', marginBottom: '12px', background: 'rgba(16,185,129,0.08)', color: '#bbf7d0', borderRadius: '8px' }}>{success}</div>}

          {showCreateForm && (
            <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(51,65,85,0.8) 100%)', border: '1px solid rgba(96,165,250,0.12)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' }}>
                {editingUserId ? 'Update Permissions' : 'Create New Staff'}
              </h2>

              <form onSubmit={handleSubmit}>
                {!editingUserId && (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.2)', background: 'rgba(255,255,255,0.03)', color: '#f1f5f9' }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.2)', background: 'rgba(255,255,255,0.03)', color: '#f1f5f9' }}
                        required
                      />
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {permissions.map((perm) => (
                      <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id])
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter((id) => id !== perm.id)
                              )
                            }
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700 }}>{perm.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{ padding: '10px 14px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', borderRadius: '8px', fontWeight: 700 }}
                  >
                    {editingUserId ? 'Update Permissions' : 'Create Staff'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingUserId(null)
                      setSelectedPermissions([])
                    }}
                    style={{ padding: '10px 14px', background: 'rgba(100,116,139,0.15)', color: '#cbd5e1', borderRadius: '8px', fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.06)', background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(51,65,85,0.8) 100%)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead style={{ background: 'rgba(51,65,85,0.9)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1' }}>Permissions</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1' }}>Created</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffUser) => (
                  <tr key={staffUser.id} style={{ borderBottom: '1px solid rgba(96,165,250,0.03)' }}>
                    <td style={{ padding: '10px 14px', color: '#f1f5f9' }}>{staffUser.username}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ padding: '4px 8px', background: 'rgba(59,130,246,0.12)', borderRadius: '6px', color: '#60a5fa', fontWeight: 700 }}>{staffUser.role}</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {staffUser.permissions.filter((p) => p.granted).map((p) => (
                          <span key={p.permission.id} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.08)', color: '#bbf7d0', borderRadius: '6px', fontSize: '12px' }}>{p.permission.name}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{new Date(staffUser.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(staffUser)} style={{ padding: '6px 10px', background: 'rgba(250,204,21,0.12)', color: '#f59e0b', borderRadius: '6px', fontWeight: 700 }}>Edit</button>
                        <button onClick={() => handleDelete(staffUser.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.12)', color: '#fb7185', borderRadius: '6px', fontWeight: 700 }}>Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {staff.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No staff members found</div>
          )}
        </div>
      </main>
    </div>
  )
}
