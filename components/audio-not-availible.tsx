"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useState } from "react"

interface AudioNotAvailableProps {
    bookTitle: string
    onRefresh: () => Promise<void>
}

export function AudioNotAvailable({ bookTitle, onRefresh }: AudioNotAvailableProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await onRefresh()
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
            <div className="container flex items-center h-16 gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div>
                        <p className="font-medium">Audio not available</p>
                        <p className="text-xs text-muted-foreground">
                            The audio for "{bookTitle}" has not been generated yet.
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check again
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
