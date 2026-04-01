import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Golf Charity Platform',
  description: 'Play golf. Win prizes. Change lives.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}