'use client'

import { useState, useEffect } from 'react'

interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

let toastId = 0
const listeners: Set<(toast: ToastMessage) => void> = new Set()

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
  const id = ++toastId
  const toast: ToastMessage = { id, type, message, duration }
  listeners.forEach(listener => listener(toast))
  
  if (duration) {
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }
}

export function dismissToast(id: number) {
  listeners.forEach(listener => listener({ id, type: 'info', message: '', duration: 0 }))
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      if (toast.message === '') {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      } else {
        setToasts(prev => {
          const exists = prev.find(t => t.id === toast.id)
          if (exists) return prev
          return [...prev, toast]
        })
      }
    }

    listeners.add(handleToast)
    return () => {
      listeners.delete(handleToast)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            marginBottom: '12px',
            padding: '16px 20px',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease-out',
            pointerEvents: 'auto',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            wordWrap: 'break-word',
            backgroundColor: 
              toast.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
              toast.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
              'rgba(59, 130, 246, 0.1)',
            borderColor:
              toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
              toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
              'rgba(59, 130, 246, 0.3)',
            color:
              toast.type === 'success' ? '#86efac' :
              toast.type === 'error' ? '#fca5a5' :
              '#93c5fd'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toast.type === 'success' && (
              <span style={{ fontSize: '18px' }}>✓</span>
            )}
            {toast.type === 'error' && (
              <span style={{ fontSize: '18px' }}>✕</span>
            )}
            {toast.type === 'info' && (
              <span style={{ fontSize: '18px' }}>ℹ</span>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
