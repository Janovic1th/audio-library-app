"use client"

import { useState } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { API_URLS } from "@/utils/apiUrls"
import { useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"

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

interface UseDeleteAudiobookOptions {
    onSuccess?: () => void
    redirectPath?: string
    refetchFn?: () => void
    delayBeforeRefetch?: number
    afterRedirect?: () => void
    redirectDelay?: number // New option for delay before redirect
}

export function useDeleteAudiobook(options: UseDeleteAudiobookOptions = {}) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [bookToDelete, setBookToDelete] = useState<Audiobook | null>(null)
    const { toast } = useToast()
    const router = useRouter()
    const auth = useAuth()

    const {
        onSuccess,
        redirectPath,
        refetchFn,
        delayBeforeRefetch = 1000,
        afterRedirect,
        redirectDelay = 1500, // Default to 1.5 seconds delay before redirect
    } = options

    const openDeleteDialog = (book: Audiobook) => {
        setBookToDelete(book)
        setIsDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setBookToDelete(null)
    }

    const confirmDelete = async () => {
        if (!bookToDelete) return

        // Check if user is authenticated
        if (!auth.isAuthenticated || !auth.user?.id_token) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to delete audiobooks.",
                variant: "destructive",
            })
            closeDeleteDialog()
            return
        }

        setIsDeleting(true)
        try {
            // Get the token from auth context
            const token = auth.user.id_token

            // Call API to delete the audiobook with authorization header
            await axios.delete(API_URLS.booksDelete, {
                data: {
                    id: bookToDelete.id,
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            toast({
                title: "Audiobook Removed",
                description: `"${bookToDelete.title}" has been removed from your library.`,
            })

            // Close the dialog first
            closeDeleteDialog()

            // Call the success callback if provided
            if (onSuccess) {
                onSuccess()
            }

            // Redirect if a path is provided, but with a delay
            if (redirectPath) {
                // Store a flag in sessionStorage to indicate we need to refetch
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("refetchAudiobooks", "true")
                }

                // Add a delay before redirecting to give the backend time to process
                setTimeout(() => {
                    router.push(redirectPath)

                    // Call the afterRedirect callback if provided
                    if (afterRedirect) {
                        afterRedirect()
                    }
                }, redirectDelay)

                return
            }

            // Refetch data if a refetch function is provided
            if (refetchFn) {
                // Add a delay before refetching to give the API time to process the deletion
                setTimeout(() => {
                    refetchFn()
                }, delayBeforeRefetch)
            }
        } catch (error) {
            console.error("Error deleting audiobook:", error)
            toast({
                title: "Error",
                description: "There was an error removing the audiobook. Please try again.",
                variant: "destructive",
            })
            setIsDeleting(false)
        }
    }

    return {
        isDeleteDialogOpen,
        isDeleting,
        bookToDelete,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    }
}
