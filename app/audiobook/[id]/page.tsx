"use client"

import { AudioPlayer } from "@/components/audio-player"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Download, Expand, Minimize, Play, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Mock data for the audiobook
const mockAudiobook = {
  id: "1",
  title: "The Great Gatsby",
  author: "F. Scott. Fitzgerald",
  description:
    "A novel about the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.",
  coverUrl: "/placeholder.svg?height=500&width=500",
  audioUrl: "#",
  pdfUrl: "#",
  duration: "4h 32m",
  uploadDate: "March 15, 2023",
}

export default function AudiobookPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Show the audio player when this page is loaded
  useEffect(() => {
    setShowPlayer(true)

    // Cleanup when navigating away
    return () => {
      setShowPlayer(false)
    }
  }, [])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)

    // This would normally update the global audio player state
    toast({
      title: isPlaying ? "Paused" : "Now Playing",
      description: `${mockAudiobook.title} by ${mockAudiobook.author}`,
    })
  }

  const handleDelete = () => {
    toast({
      title: "Audiobook Removed",
      description: `"${mockAudiobook.title}" has been removed from your library.`,
    })
    router.push("/")
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <>
      {showPlayer && <AudioPlayer audiobook={mockAudiobook} isPlaying={isPlaying} onPlayPause={handlePlay} />}

      <div className="max-w-6xl mx-auto">
        {isFullscreen ? (
          <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{mockAudiobook.title} - PDF Content</h2>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                <Minimize className="h-4 w-4" />
                <span className="sr-only">Exit Fullscreen</span>
              </Button>
            </div>
            <div className="flex-1 border-2 border-dashed rounded-lg overflow-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-medium">PDF Viewer (Fullscreen)</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    This is where the PDF content would be displayed in fullscreen mode. In a real application, this
                    would use a PDF viewer library to render the document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={mockAudiobook.coverUrl || "/placeholder.svg"}
                  alt={mockAudiobook.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handlePlay} className="w-full" size="lg">
                  {isPlaying ? "Pause" : "Play"}
                  {isPlaying ? null : <Play className="ml-2 h-4 w-4" />}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold">{mockAudiobook.title}</h1>
                <p className="text-lg text-muted-foreground">by {mockAudiobook.author}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>Duration: {mockAudiobook.duration}</div>
                <div>Added: {mockAudiobook.uploadDate}</div>
              </div>

              <p className="text-muted-foreground">{mockAudiobook.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">PDF Content</h2>
                <Button variant="outline" onClick={toggleFullscreen}>
                  <Expand className="mr-2 h-4 w-4" />
                  Fullscreen
                </Button>
              </div>

              <Card className="p-4 h-[calc(100vh-250px)] overflow-y-auto">
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                  <div className="text-center p-6">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium">PDF Viewer</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      This is where the PDF content would be displayed. In a real application, this would use a PDF
                      viewer library to render the document.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

