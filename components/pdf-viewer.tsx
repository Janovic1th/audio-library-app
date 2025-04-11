"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Expand, Minimize } from "lucide-react"

interface PDFViewerProps {
    pdfUrl: string
    isFullscreen: boolean
    onToggleFullscreen: () => void
}

export function PDFViewer({ pdfUrl, isFullscreen, onToggleFullscreen }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // This effect handles the iframe loading
    useEffect(() => {
        const handleIframeLoad = () => {
            setIsLoading(false)
        }

        const iframe = iframeRef.current
        if (iframe) {
            iframe.addEventListener("load", handleIframeLoad)
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener("load", handleIframeLoad)
            }
        }
    }, [])

    return (
        <div className={`flex flex-col ${isFullscreen ? "h-full" : "h-[calc(100vh-250px)]"}`}>
            <div className="flex justify-between items-center mb-2 p-2 bg-muted/30 rounded-md">
                <div className="flex items-center gap-1">
                    <span className="text-sm">PDF Document</span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 border rounded-md overflow-hidden bg-muted/10">
                <iframe
                    ref={iframeRef}
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Viewer"
                />
            </div>
        </div>
    )
}
