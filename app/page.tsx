"use client"

import { AudiobookGrid } from "@/components/audiobook-grid"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { UploadModal } from "@/components/upload-modal"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Audiobook Library</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Audiobook
        </Button>
      </div>
      <SearchBar />
      <AudiobookGrid />
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  )
}

