import './globals.css'
import { UserProvider } from '@/lib/UserContext'
import { Toast } from '@/components/Toast'

export const metadata = {
  title: 'InventoryPro - Stock Management System',
  description: 'Modern inventory and stock management system'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-50 to-slate-100">
        <UserProvider>
          {children}
          <Toast />
        </UserProvider>
      </body>
    </html>
  )
}

