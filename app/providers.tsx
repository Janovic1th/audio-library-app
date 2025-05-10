"use client"

import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
    persistQueryClient,
} from '@tanstack/react-query-persist-client'
import {
    createSyncStoragePersister,
} from '@tanstack/query-sync-storage-persister'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            // staleTime: 1, // 5 minutes
            // gcTime: 1, // 30 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

// const localStoragePersister = createSyncStoragePersister({
//     storage: window.localStorage,
// })
//
// persistQueryClient({
//     queryClient,
//     persister: localStoragePersister,
//     maxAge: 1000 *  * 1 * 1, // 24 hours
// })


export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/*<ReactQueryDevtools initialIsOpen={false} />*/}
        </QueryClientProvider>
    )
}
