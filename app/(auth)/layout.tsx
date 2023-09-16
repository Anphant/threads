import {ClerkProvider} from "@clerk/nextjs"
import {Inter} from "next/font/google"
// import {shadesOfPurple} from "@clerk/themes"; // Clerk's purple theme
import {dark} from "@clerk/themes";

import '../globals.css';

export const metadata = {
    title: 'Threads',
    description: 'An inspired clone of Threads by Meta Platforms, based on Next.js.'
}

const inter = Inter({subsets: ["latin"]}) // Define the 'Inter' font from Google with the "latin" subset

export default function RootLayout({
        children // This is a prop, which represents child components passed to this component
    }: {
        children: React.ReactNode // Define the type for the children prop
    }) {
        return (
        // The <ClerkProvider /> component wraps the Next.js application.
        // This provides active session and user context to Clerk's hooks and other components.
            <ClerkProvider
                appearance={{
                    // baseTheme: shadesOfPurple,
                    baseTheme: dark,
                }}>
                <html lang="en">
                    <body className={`${inter.className} bg-dark-1 layout-background`}>
                        <div className="w-full flex flex-col justify-center items-center h-screen text-light-1">
                            {children}
                        </div>
                    </body>
                </html>
            </ClerkProvider>
        )
    }