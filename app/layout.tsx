import type React from "react"
import ClientLayout from "./client-layout"
import { Providers } from "./providers"

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Providers>
            <ClientLayout>{children}</ClientLayout>
        </Providers>
    )
}
