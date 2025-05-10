"use client"

import { AudiobookGrid } from "@/components/audiobook-grid"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { UploadModal } from "@/components/upload-modal"
import { LoginRequiredModal } from "@/components/login-required-modal"
import { Plus, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "react-oidc-context"
import axios from "axios"
import { API_URLS, LinksToServices } from "@/utils/apiUrls"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteAudiobook, type Audiobook } from "@/hooks/use-delete-audiobook"

export default function Home() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const auth = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    // Function to fetch audiobooks
    const fetchAudiobooks = async (query = "") => {
        const url = API_URLS.searchBooks

        const response = await axios.get(url, {
            params: {
                query,
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
    }

    // Use TanStack Query to fetch and cache audiobooks
    const {
        data: audiobooks = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["audiobooks", searchQuery],
        queryFn: () => fetchAudiobooks(searchQuery),
        enabled: !auth.isLoading, // Only run query when auth is loaded
    })

    // Use the delete audiobook hook
    const { isDeleteDialogOpen, isDeleting, bookToDelete, openDeleteDialog, closeDeleteDialog, confirmDelete } =
        useDeleteAudiobook({
            refetchFn: refetch,
            delayBeforeRefetch: 3000, // 3 second delay as per your original code
        })

    // Effect to refetch data when the component mounts or becomes visible
    useEffect(() => {
        // Refetch data when the component mounts
        // refetch()

        // Check if we need to refetch due to a redirect
        if (typeof window !== "undefined") {
            const shouldRefetch = sessionStorage.getItem("refetchAudiobooks") === "true"
            if (shouldRefetch) {
                // Clear the flag
                sessionStorage.removeItem("refetchAudiobooks")
                // Refetch with empty query
                setTimeout(() => {
                    // Reset search query and refetch
                    setSearchQuery("")
                    refetch()
                }, 500)
            } else {
                refetch()
            }
        }

        // Also refetch when the window regains focus (user returns to the tab)
        const handleFocus = () => {
            refetch()
        }

        window.addEventListener("focus", handleFocus)

        return () => {
            window.removeEventListener("focus", handleFocus)
        }
    }, [refetch, setSearchQuery])

    const handleAddBookClick = () => {
        if (auth.isAuthenticated) {
            setIsUploadModalOpen(true)
        } else {
            setIsLoginModalOpen(true)
        }
    }

    const updateSearchQuery = () => {
        queryClient.invalidateQueries({ queryKey: ["audiobooks"] })
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        // The query will automatically run due to the queryKey dependency
    }

    const handleRemoveBook = async (id: string) => {
        const bookToRemove = audiobooks.find((book: Audiobook) => book.id === id)
        if (bookToRemove) {
            openDeleteDialog(bookToRemove)
        }
    }

    // Function to handle successful upload
    const handleUploadSuccess = () => {
        // Invalidate the current query to refetch data
        refetch()
        setIsUploadModalOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "{bookToDelete?.title}" from library? This action cannot be undone.
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

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audiobook Library</h1>
                <Button onClick={handleAddBookClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Book
                </Button>
            </div>
            <SearchBar onSearch={handleSearch} />
            {error ? (
                <div className="p-8 text-center">
                    <p className="text-destructive mb-4">
                        {error instanceof Error ? error.message : "Failed to load audiobooks. Please try again later."}
                    </p>
                    <Button onClick={() => refetch()}>Try Again</Button>
                </div>
            ) : (
                <AudiobookGrid
                    audiobooks={audiobooks}
                    isLoading={isLoading}
                    onAddBook={handleAddBookClick}
                    searchQuery={searchQuery}
                    onRefresh={() => handleSearch("")}
                    onRemove={handleRemoveBook}
                />
            )}

            {/* Show upload modal only if authenticated */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />

            {/* Show login required modal if not authenticated */}
            <LoginRequiredModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    )
}
