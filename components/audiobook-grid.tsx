"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { UploadModal } from "@/components/upload-modal"
import { Grid, List, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

// Mock data for audiobooks
const mockAudiobooks = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "6",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "/placeholder.svg?height=300&width=300",
  },
]

export function AudiobookGrid() {
  const [audiobooks, setAudiobooks] = useState(mockAudiobooks)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleRemove = (id: string) => {
    setAudiobooks(audiobooks.filter((book) => book.id !== id))
  }

  if (audiobooks.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-muted-foreground mb-6">Add your first audiobook to get started</p>
          <Button onClick={() => setIsUploadModalOpen(true)}>Add Audiobook</Button>
        </div>
        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      </>
    )
  }

  return (
    <>
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
                <Button variant="ghost" size="icon" onClick={() => handleRemove(book.id)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
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
                <Button variant="ghost" size="icon" onClick={() => handleRemove(book.id)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </>
  )
}

