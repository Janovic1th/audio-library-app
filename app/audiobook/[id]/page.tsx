"use client"

import { AudioPlayer } from "@/components/audio-player"
import { Button } from "@/components/ui/button"
import { PDFViewer } from "@/components/pdf-viewer"
import { useToast } from "@/hooks/use-toast"
import { Download, Play, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import API_URLS from "../../../utils/apiUrls"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for the audiobooks
const mockAudiobooks = [
  {
    id: "1",
    userId: "user1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
        "A novel about the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.",
    coverUrl: "/placeholder.svg?height=500&width=500",
    audioUrl: "#",
    pdfUrl: "/paper.pdf",
    duration: "4h 32m",
    uploadDate: "March 15, 2023",
  },
  {
    id: "2",
    userId: "user1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description:
        "The story of racial injustice and the loss of innocence in the American South during the Great Depression.",
    coverUrl: "/placeholder.svg?height=500&width=500",
    audioUrl: "#",
    pdfUrl: "/paper.pdf",
    duration: "5h 15m",
    uploadDate: "February 10, 2023",
  },
  {
    id: "3",
    userId: "user1",
    title: "1984",
    author: "George Orwell",
    description:
        "A dystopian social science fiction novel that examines the consequences of totalitarianism, mass surveillance, and repressive regimentation.",
    coverUrl: "/placeholder.svg?height=500&width=500",
    audioUrl: "#",
    pdfUrl: "/paper.pdf",
    duration: "6h 45m",
    uploadDate: "January 5, 2023",
  },
]

interface Audiobook {
  id: string
  userId: string
  title: string
  author: string
  description: string
  audioUrl: string
  pdfUrl: string
  coverUrl: string
  duration: string
  uploadDate: string
}

export default function AudiobookPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Show the audio player when this page is loaded
  useEffect(() => {
    console.log(id)
    setShowPlayer(true)

    // Cleanup when navigating away
    return () => {
      setShowPlayer(false)
    }
  }, [])

  useEffect(() => {
    const fetchAudiobookData = async () => {
      if (id) {
        try {
          setIsLoading(true)
          const url = API_URLS.getBook(id as string)
          const response = await axios.get(url)

          const fetchedAudiobook: Audiobook = {
            id: response.data.id,
            userId: response.data.userId,
            title: response.data.title,
            author: response.data.author,
            description: response.data.description,
            pdfUrl: response.data.pdfUrl, // Assuming pdfKey is part of the response
            coverUrl: response.data.imageUrl, // Assuming imageUrl is part of the response
            audioUrl: response.data.audioUrl || "#", // Assuming you get audioUrl or have a default
            duration: formatDuration(Number(response.data.duration) || 0), // Handle duration (may need to extract from response)
            uploadDate: response.data.uploadDate || "Unknown", // Handle upload date (may need to extract)
          }
          console.log(fetchedAudiobook)
          setAudiobook(fetchedAudiobook) // Set the audiobook data
          setIsLoading(false)
          setError(null)
        } catch (error) {
          console.error("Error fetching audiobook data:", error)
          setError("Failed to load audiobook. Please try again later.")
          setIsLoading(false)
        }
      }
    }

    fetchAudiobookData()
  }, [id])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return "Less than a minute"
  }

  const handlePlay = () => {
    if (!audiobook) return

    setIsPlaying(!isPlaying)

    // This would normally update the global audio player state
    toast({
      title: isPlaying ? "Paused" : "Now Playing",
      description: `${audiobook.title} by ${audiobook.author}`,
    })
  }

  const handleDelete = () => {
    if (!audiobook) return

    toast({
      title: "Audiobook Removed",
      description: `"${audiobook.title}" has been removed from your library.`,
    })
    router.push("/")
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Loading state
  if (isLoading) {
    return (
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-[calc(100vh-250px)] w-full rounded-lg" />
            </div>
          </div>
        </div>
    )
  }

  // Error state
  if (error) {
    return (
        <div className="max-w-6xl mx-auto">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Audiobook</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/")}>Return to Library</Button>
          </div>
        </div>
    )
  }

  // If no audiobook data is available after loading
  if (!audiobook) {
    return (
        <div className="max-w-6xl mx-auto">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Audiobook Not Found</h2>
            <p className="text-muted-foreground mb-6">The audiobook you're looking for could not be found.</p>
            <Button onClick={() => router.push("/")}>Return to Library</Button>
          </div>
        </div>
    )
  }

  return (
      <>
        {showPlayer && <AudioPlayer audiobook={audiobook} isPlaying={isPlaying} onPlayPause={handlePlay} />}

        {isFullscreen && (
            <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col animate-in fade-in zoom-in duration-300">
              <PDFViewer pdfUrl={audiobook.pdfUrl} isFullscreen={true} onToggleFullscreen={toggleFullscreen} />
            </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                    src={audiobook.coverUrl || "/placeholder.svg"}
                    alt={audiobook.title}
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
                <h1 className="text-2xl font-bold">{audiobook.title}</h1>
                <p className="text-lg text-muted-foreground">by {audiobook.author}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>Duration: {audiobook.duration}</div>
                <div>Added: {audiobook.uploadDate}</div>
              </div>

              <p className="text-muted-foreground">{audiobook.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold">PDF Content</h2>
              {!isFullscreen && (
                  <PDFViewer pdfUrl={audiobook.pdfUrl} isFullscreen={false} onToggleFullscreen={toggleFullscreen} />
              )}
            </div>
          </div>
        </div>
      </>
  )
}
