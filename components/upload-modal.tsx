"use client"

import type React from "react"
import axios from "axios"
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
import { ImageCropper } from "@/components/image-cropper"
import { useToast } from "@/hooks/use-toast"
import { FileUp, Upload, BookOpen } from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import API_URLS from "@/utils/apiUrls"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<File | null>(null)

  // Refs for file inputs
  const coverInputRef = useRef<HTMLInputElement>(null!)
  const pdfInputRef = useRef<HTMLInputElement>(null!)

  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      if (coverFile) {
        const base64Image = await convertToBase64(coverFile)

        const presignedUrlForUpload = await axios.post(API_URLS.getPresignedUrl, {
          userId: "user1",
          title,
          author,
          description,
          coverFile: base64Image,
          coverType: coverFile.type,
          // Replace with actual user ID from Cognito/Auth
        })

        const { uploadUrl, id } = presignedUrlForUpload.data.body

        await axios.put(uploadUrl, pdfFile, {
          headers: {
            "Content-Type": "application/pdf",
          },
        })

        // Show success toast
        toast({
          title: "Upload Successful",
          description: `"${title}" has been added to your library.`,
        })

        // Reset form and close modal
        resetForm()
        onClose()

        // Redirect to the audiobook page with the new ID
        router.push(`/audiobook/${id}`)
      }
    } catch (error) {
      console.error("Error uploading audiobook:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your audiobook. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1] // Remove the header (e.g., "data:image/png;base64,")
          resolve(base64String)
        } else {
          reject("Failed to convert file to base64")
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const resetForm = () => {
    setTitle("")
    setAuthor("")
    setDescription("")
    setCoverFile(null)
    setPdfFile(null)
    setImageToCrop(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent, fileType: "cover" | "pdf") => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      switch (fileType) {
        case "cover":
          if (file.type.startsWith("image/")) {
            handleCoverImageSelected(file)
          } else {
            toast({
              title: "Invalid file type",
              description: "Please upload an image file for the cover.",
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

  // Trigger file input click
  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  // Handle cover image selection
  const handleCoverImageSelected = (file: File) => {
    // Check if we need to crop (we'll check dimensions when the image loads)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)

      // If image is already 500x500, use it directly
      if (img.width === 500 && img.height === 500) {
        setCoverFile(file)
      } else {
        // Otherwise, show the cropper
        setImageToCrop(file)
      }
    }
    img.src = URL.createObjectURL(file)
  }

  // Handle cover file input change
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCoverImageSelected(e.target.files[0])
    }
  }

  // Handle cropped image
  const handleCropComplete = (croppedFile: File) => {
    setCoverFile(croppedFile)
    const sizeInMB = croppedFile.size / (1024 * 1024)
    console.log(`File size: ${sizeInMB.toFixed(2)} MB`)
    console.log(croppedFile)
    setImageToCrop(null)
  }

  // Cancel cropping
  const handleCropCancel = () => {
    setImageToCrop(null)
  }

  // If we're in cropping mode, show the cropper
  if (imageToCrop) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[600px]">
            <ImageCropper imageFile={imageToCrop} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
          </DialogContent>
        </Dialog>
    )
  }

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Fill in the information about your Book and upload the necessary files.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Enter Book title"
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
                <Label>Cover Image (500x500px)</Label>
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
                        <p className="text-xs text-muted-foreground mb-3">
                          JPG, PNG or GIF. Will be cropped to 500x500px if needed.
                        </p>
                        <Input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileChange}
                            className="hidden"
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => triggerFileInput(coverInputRef)}>
                          Browse files
                        </Button>
                      </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>PDF File</Label>
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
                            ref={pdfInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                            className="hidden"
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => triggerFileInput(pdfInputRef)}>
                          Browse files
                        </Button>
                      </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !title || !author || !coverFile || !pdfFile}>
                {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Book
                    </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}
