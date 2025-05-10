"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LogOut, User, Book, Trash, ExternalLink, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { API_URLS, LinksToServices } from "@/utils/apiUrls"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteAudiobook } from "@/hooks/use-delete-audiobook"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()

  // Check if user is authenticated and load profile data
  useEffect(() => {
    const checkAuth = () => {
      if (!auth.isAuthenticated) {
        // Not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      // Load user data from auth context
      const userProfile = auth.user?.profile
      setName(userProfile?.name || userProfile?.nickname || "User")
      setEmail(userProfile?.email || "")
      setIsLoading(false)
    }

    if (!auth.isLoading) {
      checkAuth()
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, router, toast])

  // Fetch user's uploaded books
  const fetchUserBooks = async () => {
    if (!auth.user?.profile.sub) return []

    try {
      const url = API_URLS.searchBooks
      const userId = auth.user.profile.sub

      const response = await axios.get(url, {
        params: {
          userId,
        },
      })

      // Parse the stringified `body`
      const parsedBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body

      // Make sure results is an array
      const results = parsedBody.results || []

      return results.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: LinksToServices.CloudFrontCover + book.imageUrl || "/placeholder.svg?height=300&width=300",
        description: book.description || "",
        audioUrl: LinksToServices.CloudFrontBook + book.audioUrl || "",
        pdfUrl: LinksToServices.CloudFrontBook + book.pdfUrl || "",
        duration: book.duration || "",
        uploadDate: book.uploadDate || "",
        userId: book.userId || "",
      }))
    } catch (error) {
      console.error("Error fetching user books:", error)
      return []
    }
  }

  const {
    data: userBooks = [],
    isLoading: isBooksLoading,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["userBooks", auth.user?.profile.sub],
    queryFn: fetchUserBooks,
    enabled: !!auth.user?.profile.sub,
  })

  // Use the delete audiobook hook
  const { isDeleteDialogOpen, isDeleting, bookToDelete, openDeleteDialog, closeDeleteDialog, confirmDelete } =
      useDeleteAudiobook({
        refetchFn: refetchBooks,
        delayBeforeRefetch: 3000,
      })

  const handleLogout = () => {
    // Sign out from OIDC context
    auth.removeUser()

    // Redirect to Cognito logout URL
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
    const logoutUri = typeof window !== "undefined" ? window.location.origin : ""
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN

    if (cognitoDomain && clientId) {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
    }

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })

    router.push("/")
  }

  if (auth.isLoading || isLoading) {
    return (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Loading profile...</h1>
        </div>
    )
  }

  // Calculate statistics
  const totalBooks = userBooks.length
  const completedBooks = 0 // This would come from your API
  const inProgressBooks = 0 // This would come from your API
  const listeningTime = "0h 0m" // This would come from your API

  return (
      <div className="max-w-4xl mx-auto">
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

        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile picture" />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{name}</CardTitle>
                    <CardDescription>{email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Name</p>
                  <p className="p-2 bg-muted rounded-md">{name}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="p-2 bg-muted rounded-md">{email}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardFooter>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Overview of your audiobook library usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Audiobooks</p>
                    <p className="text-2xl font-bold">{totalBooks}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Listening Time</p>
                    <p className="text-2xl font-bold">{listeningTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedBooks}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{inProgressBooks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Details Card */}
            {auth.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Details</CardTitle>
                    <CardDescription>Information about your current session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Authentication Provider</p>
                        <p className="font-medium">Amazon Cognito</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Session Status</p>
                        <p className="font-medium">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Active
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-medium truncate">{auth.user.profile.sub}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Expires</p>
                        <p className="font-medium">
                          {auth.user?.expires_at ? new Date(auth.user.expires_at * 1000).toLocaleString() : "Not available"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>

          {/* User's Uploaded Books */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Your Uploaded Books
                </CardTitle>
                <CardDescription>Books you've uploaded to the library</CardDescription>
              </CardHeader>
              <CardContent>
                {isBooksLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <div className="flex-1">
                              <Skeleton className="h-5 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-9 w-9 rounded-md" />
                          </div>
                      ))}
                    </div>
                ) : userBooks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't uploaded any books yet.</p>
                      <Button onClick={() => router.push("/")}>Go to Library</Button>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {userBooks.map((book:any) => (
                          <div
                              key={book.id}
                              className="flex gap-4 items-center border rounded-md p-3 hover:bg-accent/50 transition-colors"
                          >
                            <div className="relative h-16 w-16 overflow-hidden rounded-md">
                              <Image
                                  src={book.coverUrl || "/placeholder.svg"}
                                  alt={book.title}
                                  fill
                                  className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{book.title}</h3>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/audiobook/${book.id}`}>
                                <Button variant="ghost" size="icon" title="View Book">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(book)} title="Delete Book">
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
