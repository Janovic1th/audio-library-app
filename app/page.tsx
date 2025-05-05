"use client"

import { AudiobookGrid } from "@/components/audiobook-grid"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { UploadModal } from "@/components/upload-modal"
import { LoginRequiredModal } from "@/components/login-required-modal"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useAuth } from "react-oidc-context"
import axios from "axios"
import API_URLS from "@/utils/apiUrls"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"

// Define the audiobook type
export interface Audiobook {
    id: string
    title: string
    author: string
    coverUrl: string
    description?: string
    audioUrl?: string
    pdfUrl?: string
    duration?: string
    uploadDate?: string
    userId?: string
}

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
            coverUrl: book.imageUrl || book.coverUrl || "/placeholder.svg?height=300&width=300",
            description: book.description || "",
            audioUrl: book.audioUrl || "",
            pdfUrl: book.pdfUrl || "",
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

    const handleAddBookClick = () => {
        if (auth.isAuthenticated) {
            setIsUploadModalOpen(true)
        } else {
            setIsLoginModalOpen(true)
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        // The query will automatically run due to the queryKey dependency
    }

    const handleRemoveBook = async (id: string) => {
        // Implement book removal logic here when needed
        // You could use useMutation for this
    }

    // Function to handle successful upload
    const handleUploadSuccess = () => {
        // Invalidate the current query to refetch data
        queryClient.invalidateQueries({ queryKey: ["audiobooks"] })
        setIsUploadModalOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Your Audiobook Library</h1>
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
