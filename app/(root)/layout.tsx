import '../globals.css'
import type { Metadata } from 'next'
import {ClerkProvider} from "@clerk/nextjs"
import { Inter } from 'next/font/google'
import Topbar from '@/components/shared/Topbar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import RightSidebar from '@/components/shared/RightSidebar'
import Bottombar from '@/components/shared/Bottombar'

// Define the 'Inter' font from Google with the "latin" subset
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Barn - Threads Clone',
    description: 'An inspired clone of Threads by Meta Platforms, based on Next.js.'
}

// The RootLayout function is the root layout for the application.
// It wraps around the main content and provides a consistent layout structure.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    // The <ClerkProvider /> component wraps the Next.js application.
    // This provides active session and user context to Clerk's hooks and other components.
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
          <main className="flex flex-row">
            <LeftSidebar />
            <section className="main-container">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </section>
            <RightSidebar />
          </main>
          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  )
}
