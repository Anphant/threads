import {ClerkProvider} from "@clerk/nextjs"
import {Inter} from "next/font/google"

import '../globals.css';

export const metadata = {
    title: 'Threads',
    description: 'An inspired clone of Threads by Meta Platforms, based on Next.js.'
}

const inter = Inter({subsets: ["latin"]}) // Define 'Inter' font from Google

export default function RootLayout({
        children    // Props
    }: {
        children: React.ReactNode   // Types of the props
    }) {
        return (

        // The <ClerkProvider /> component wraps your Next.js application to provide
        // active session and user context to Clerk's hooks and other components.
            <ClerkProvider>
                <html lang="en">
                    <body className={`${inter.className} bg-dark-1`}>
                        {children}
                    </body>
                </html>
            </ClerkProvider>
        )
    }