"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FileAudio, FileUp, Upload, BookOpen } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Upload Successful",
        description: `"${title}" has been added to your library.`,
      })
      resetForm()
      onClose()
      router.push("/")
    }, 1500)
  }

  const resetForm = () => {
    setTitle("")
    setAuthor("")
    setDescription("")
    setCoverFile(null)
    setAudioFile(null)
    setPdfFile(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent, fileType: "cover" | "audio" | "pdf") => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      switch (fileType) {
        case "cover":
          if (file.type.startsWith("image/")) {
            setCoverFile(file)
          } else {
            toast({
              title: "Invalid file type",
              description: "Please upload an image file for the cover.",
              variant: "destructive",
            })
          }
          break
        case "audio":
          if (file.type.startsWith("audio/")) {
            setAudioFile(file)
          } else {
            toast({
              title: "Invalid file type",
              description: "Please upload an audio file.",
              variant: "destructive",
            })
          }
          break
        case "pdf":
          if (file.type === "application/pdf") {
            setPdfFile(file)
          } else {
            toast({
              title: "Invalid file type",
              description: "Please upload a PDF file.",
              variant: "destructive",
            })
          }
          break
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Audiobook</DialogTitle>
            <DialogDescription>
              Fill in the information about your audiobook and upload the necessary files.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter audiobook title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Enter author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image</Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "cover")}
              >
                {coverFile ? (
                  <div className="flex flex-col items-center">
                    <div className="h-40 w-40 rounded-md bg-muted flex items-center justify-center relative overflow-hidden mb-2">
                      <img
                        src={URL.createObjectURL(coverFile) || "/placeholder.svg"}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm">{coverFile.name}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCoverFile(null)} className="mt-2">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Drag & drop your cover image here</p>
                    <p className="text-xs text-muted-foreground mb-3">JPG, PNG or GIF, 500x500px recommended</p>
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && setCoverFile(e.target.files[0])}
                      className="hidden"
                    />
                    <Label htmlFor="cover" className="cursor-pointer">
                      <Button type="button" variant="secondary" size="sm">
                        Browse files
                      </Button>
                    </Label>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio">Audio File</Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "audio")}
              >
                {audioFile ? (
                  <div className="flex flex-col items-center">
                    <FileAudio className="h-10 w-10 text-primary mx-auto mb-2" />
                    <p className="text-sm">{audioFile.name}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAudioFile(null)} className="mt-2">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileAudio className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Drag & drop your audio file here</p>
                    <p className="text-xs text-muted-foreground mb-3">MP3, WAV, or M4A format</p>
                    <Input
                      id="audio"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files && setAudioFile(e.target.files[0])}
                      className="hidden"
                    />
                    <Label htmlFor="audio" className="cursor-pointer">
                      <Button type="button" variant="secondary" size="sm">
                        Browse files
                      </Button>
                    </Label>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf">PDF File</Label>
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "pdf")}
              >
                {pdfFile ? (
                  <div className="flex flex-col items-center">
                    <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
                    <p className="text-sm">{pdfFile.name}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPdfFile(null)} className="mt-2">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Drag & drop your PDF file here</p>
                    <p className="text-xs text-muted-foreground mb-3">PDF format only</p>
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                      className="hidden"
                    />
                    <Label htmlFor="pdf" className="cursor-pointer">
                      <Button type="button" variant="secondary" size="sm">
                        Browse files
                      </Button>
                    </Label>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !title || !author || !coverFile || !audioFile || !pdfFile}>
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audiobook
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

