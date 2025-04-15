"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "react-oidc-context"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Configure Cognito OIDC
const cognitoAuthConfig = {
    authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
    response_type: "code",
    scope: "email openid profile",
    // onSigninCallback: () => {
    //     // Avoid redirects after sign in
    //     window.history.replaceState({}, document.title, window.location.pathname)
    // },
}

export default function ClientLayout({
                                         children,
                                     }: Readonly<{
    children: React.ReactNode
}>) {
    // This effect is needed to handle the auth callback properly in Next.js
    useEffect(() => {
        // Handle the auth callback if it exists in the URL
        if (window.location.search.includes("code=")) {
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get("code")

            if (code) {
                // The AuthProvider will handle the code exchange
                console.log("Auth code detected in URL")
            }
        }
    }, [])

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className, "min-h-screen bg-background")}>
        <AuthProvider {...cognitoAuthConfig}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 container py-6">{children}</main>
                </div>
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
