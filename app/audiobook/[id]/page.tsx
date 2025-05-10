"use client"

import { AudioPlayer } from "@/components/audio-player"
import { AudioNotAvailable } from "@/components/audio-not-availible"
import { Button } from "@/components/ui/button"
import { PDFViewer } from "@/components/pdf-viewer"
import { useToast } from "@/hooks/use-toast"
import { Download, Play, Trash, LogIn, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { API_URLS, LinksToServices } from "@/utils/apiUrls"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "react-oidc-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteAudiobook } from "@/hooks/use-delete-audiobook"

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
  const contentRef = useRef<HTMLDivElement>(null)
  const auth = useAuth()

  // Use the delete audiobook hook
  const { isDeleteDialogOpen, isDeleting, bookToDelete, openDeleteDialog, closeDeleteDialog, confirmDelete } =
      useDeleteAudiobook({
        redirectPath: "/",
        redirectDelay: 2000, // 2 seconds delay before redirecting
        afterRedirect: () => {
          // This will be called after the redirect
          if (typeof window !== "undefined") {
            sessionStorage.setItem("refetchAudiobooks", "true")
          }
        },
      })


  const fetchAudiobookData = useCallback(async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const url = API_URLS.getBook(id as string)

      // Get user ID from auth context
      const userId = auth.user?.profile.sub || auth.user?.profile.email || "anonymous"

      const response = await axios.get(url, {
        params: {
          userId, // Use the authenticated user's ID
        },
      })
      if (response.status === 404) {
        setError("The audiobook you are looking for does not exist.")
        setIsLoading(false)
        return
      }

      const fetchedAudiobook: Audiobook = {
        id: response.data.id,
        userId: response.data.userId,
        title: response.data.title,
        author: response.data.author,
        description: response.data.description,
        pdfUrl: LinksToServices.CloudFrontBook + response.data.pdfUrl,
        coverUrl: LinksToServices.CloudFrontCover + response.data.imageUrl,
        audioUrl: response.data.audioUrl ? LinksToServices.CloudFrontBook + response.data.audioUrl : "",
        duration: formatDuration(Number(response.data.duration) || 0),
        uploadDate: response.data.uploadDate || "Unknown",
      }

      setAudiobook(fetchedAudiobook)
      setIsLoading(false)
      setError(null)
      if (fetchedAudiobook.audioUrl && fetchedAudiobook.audioUrl !== "#" && fetchedAudiobook.audioUrl !== "") {
        setShowPlayer(true)
      } else {
        setShowPlayer(false)
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setIsLoading(false)
        setAudiobook(null)
        setError(null)
      } else {
        setError("Failed to load audiobook. Please try again later.")
        setIsLoading(false)
      }
    }
  }, [id, auth.user])

  useEffect(() => {
    fetchAudiobookData()

    return () => {
      setShowPlayer(false)
    }
  }, [fetchAudiobookData, auth.user])

  // Add padding to the bottom of the content when player is visible
  useEffect(() => {
    if (contentRef.current) {
      if (showPlayer) {
        // Add padding based on screen size
        contentRef.current.style.paddingBottom = window.innerWidth < 768 ? "160px" : "80px"
      } else {
        contentRef.current.style.paddingBottom = "0"
      }
    }
  }, [showPlayer])

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
  }

  const handleDeleteClick = () => {
    if (audiobook) {
      openDeleteDialog(audiobook)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const checkIfAudioAvailable = async () => {
    if (!audiobook) return
    if (!auth.isAuthenticated || !auth.user?.id_token) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete audiobooks.",
        variant: "destructive",
      })
      return
    }
    try {
      // Get user ID from auth context
      const userId = auth.user?.profile.sub || auth.user?.profile.email || "anonymous"
      const token = auth.user.id_token
      const response = await axios.get(API_URLS.isAudioAvailable, {
        params: {
          id: audiobook.id,
          userId, // Use the authenticated user's ID
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const audioUrl = LinksToServices.CloudFrontBook + response.data?.body?.audioUrl

      if (audioUrl && audioUrl !== "") {
        setAudiobook((prev) => (prev ? { ...prev, audioUrl } : prev))
      }
      setShowPlayer(true)
    } catch (error) {
      console.error("Error checking audio availability:", error)
      toast({
        title: "Error",
        description: "Unable to check audio availability. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleLogin = () => {
    auth.signinRedirect()
  }

  const isAudioAvailable = audiobook?.audioUrl && audiobook.audioUrl !== ""

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

  // Not logged in state - show limited content and login prompt
  if (!auth.isAuthenticated) {
    return (
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

              <div>
                <h1 className="text-2xl font-bold">{audiobook.title}</h1>
                <p className="text-lg text-muted-foreground">by {audiobook.author}</p>
              </div>

              <p className="text-muted-foreground line-clamp-4">{audiobook.description}</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>
                    You need to be logged in to access the full content of this audiobook.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Please log in to enjoy the following features:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Listen to the audiobook</li>
                    <li>View the PDF content</li>
                    <li>Download the audiobook</li>
                    <li>Add books to your personal library</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleLogin} className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in to Access Content
                  </Button>
                </CardFooter>
              </Card>

              <div className="bg-muted/30 rounded-lg p-6 flex items-center justify-center h-[calc(100vh-450px)]">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">PDF content preview not available</p>
                  <Button variant="outline" onClick={handleLogin}>
                    Log in to View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Logged in state - show full content
  return (
      <>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove "{bookToDelete?.title}" from your library? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Removing..." : "Yes, Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show AudioPlayer only if audio is available */}
        {showPlayer && isAudioAvailable && (
            <AudioPlayer audiobook={audiobook} isPlaying={isPlaying} onPlayPause={handlePlay} />
        )}

        {/* Show AudioNotAvailable if audio is not available */}
        {!isAudioAvailable && <AudioNotAvailable bookTitle={audiobook.title} onRefresh={checkIfAudioAvailable} />}

        {isFullscreen && (
            <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col animate-in fade-in zoom-in duration-300">
              <PDFViewer pdfUrl={audiobook.pdfUrl} isFullscreen={true} onToggleFullscreen={toggleFullscreen} />
            </div>
        )}

        <div ref={contentRef} className="max-w-6xl mx-auto">
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
                <Button onClick={handlePlay} className="w-full" size="lg" disabled={!isAudioAvailable}>
                  {isPlaying ? "Pause" : "Play"}
                  {isPlaying ? null : <Play className="ml-2 h-4 w-4" />}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <a href={audiobook.audioUrl} download target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" disabled={!isAudioAvailable}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </a>

                  {/* Only show delete button if the user is the owner */}
                  {audiobook.userId === auth.user?.profile.sub && (
                      <Button variant="destructive" onClick={handleDeleteClick}>
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                  )}
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
