import './globals.css'

import type { ReactNode } from 'react'

import { getNextServerSession } from '@shape-kit/auth'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getNextServerSession()

  return (
    <html lang="en">
      <body>
        <header className="p-4 border-b border-gray-200 text-sm">
          {session.user ? (
            <span>Signed in as {session.user.email}</span>
          ) : (
            <span>Not signed in</span>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
