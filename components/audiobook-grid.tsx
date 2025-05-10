"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Grid, List, Trash, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "react-oidc-context"
import { Skeleton } from "@/components/ui/skeleton"
import type { Audiobook } from "@/hooks/use-delete-audiobook"

interface AudiobookGridProps {
    audiobooks: Audiobook[]
    isLoading: boolean
    onAddBook: () => void
    searchQuery: string
    onRefresh: () => void
    onRemove: (id: string) => void
}

export function AudiobookGrid({
                                  audiobooks,
                                  isLoading,
                                  onAddBook,
                                  searchQuery,
                                  onRefresh,
                                  onRemove,
                              }: AudiobookGridProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const auth = useAuth()

    const handleRemove = (id: string) => {
        // Call the onRemove function passed from parent
        onRemove(id)
    }

    // Loading state
    if (isLoading) {
        return (
            <div>
                <div className="flex justify-end mb-4">
                    <div className="flex border rounded-md overflow-hidden">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="h-4 w-4 mr-2" />
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4 mr-2" />
                            List
                        </Button>
                    </div>
                </div>

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="relative aspect-square">
                                    <Skeleton className="h-full w-full" />
                                </div>
                                <CardContent className="p-4">
                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex justify-between">
                                    <Skeleton className="h-9 w-24" />
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center border rounded-md p-3">
                                <Skeleton className="h-16 w-16 rounded-md mr-4" />
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-9 w-16" />
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Empty state
    if (audiobooks.length === 0) {
        return (
            <div className="text-center py-12">
                {searchQuery ? (
                    <>
                        <h2 className="text-xl font-semibold mb-2">No results found</h2>
                        <p className="text-muted-foreground mb-6">
                            No audiobooks matching "{searchQuery}" were found in your library
                        </p>
                        <Button onClick={onRefresh} variant="outline" className="mr-2">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Show All Books
                        </Button>
                        <Button onClick={onAddBook}>Add Audiobook</Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-2">Library is empty</h2>
                        <p className="text-muted-foreground mb-6">No audiobooks yet — you can be the first to upload one!</p>
                        <Button onClick={onAddBook}>Add Audiobook</Button>
                    </>
                )}
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <div className="flex border rounded-md overflow-hidden">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid className="h-4 w-4 mr-2" />
                        Grid
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4 mr-2" />
                        List
                    </Button>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {audiobooks.map((book) => (
                        <Card key={book.id} className="overflow-hidden">
                            <Link href={`/audiobook/${book.id}`}>
                                <div className="relative aspect-square">
                                    <Image
                                        src={book.coverUrl || "/placeholder.svg"}
                                        alt={book.title}
                                        fill
                                        className="object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                            </Link>
                            <CardContent className="p-4">
                                <Link href={`/audiobook/${book.id}`} className="hover:underline">
                                    <h3 className="font-medium line-clamp-1">{book.title}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                                <Link href={`/audiobook/${book.id}`}>
                                    <Button variant="secondary" size="sm">
                                        View Details
                                    </Button>
                                </Link>
                                {/* Only show delete button if the user is the owner */}
                                {book.userId === auth.user?.profile.sub && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(book.id)}>
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {audiobooks.map((book) => (
                        <div key={book.id} className="flex items-center border rounded-md p-3 hover:bg-accent/50 transition-colors">
                            <div className="relative h-16 w-16 overflow-hidden rounded-md mr-4">
                                <Image src={book.coverUrl || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/audiobook/${book.id}`} className="hover:underline">
                                    <h3 className="font-medium">{book.title}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/audiobook/${book.id}`}>
                                    <Button variant="secondary" size="sm">
                                        View
                                    </Button>
                                </Link>
                                {/* Only show delete button if the user is the owner */}
                                {book.userId === auth.user?.profile.sub && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(book.id)}>
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
