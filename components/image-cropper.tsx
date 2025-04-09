"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect, useRef } from "react"
import { ZoomIn, ZoomOut, Move } from "lucide-react"

interface ImageCropperProps {
    imageFile: File
    onCropComplete: (croppedFile: File) => void
    onCancel: () => void
}

export function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
    const [imageSrc, setImageSrc] = useState<string>("")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

    const cropSize = 500 // Fixed crop size of 500x500px
    const displaySize = 350 // Size to display the crop area

    useEffect(() => {
        if (!imageFile) return

        const reader = new FileReader()
        reader.onload = (e) => {
            if (e.target?.result) {
                setImageSrc(e.target.result as string)

                // Load image to get dimensions
                const img = new Image()
                img.onload = () => {
                    imageRef.current = img
                    setImageSize({ width: img.width, height: img.height })

                    // Calculate initial scale to fit the image
                    const scaleX = displaySize / img.width
                    const scaleY = displaySize / img.height
                    const initialScale = Math.min(scaleX, scaleY)

                    setScale(initialScale)

                    // Center the image
                    const scaledWidth = img.width * initialScale
                    const scaledHeight = img.height * initialScale

                    setPosition({
                        x: (displaySize - scaledWidth) / 2,
                        y: (displaySize - scaledHeight) / 2,
                    })
                }
                img.src = e.target.result as string
            }
        }
        reader.readAsDataURL(imageFile)
    }, [imageFile])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        setIsDragging(true)
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const deltaX = e.clientX - rect.left - dragStart.x
        const deltaY = e.clientY - rect.top - dragStart.y

        setPosition((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
        }))

        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleZoom = (newScale: number) => {
        if (newScale < 0.1) newScale = 0.1
        if (newScale > 3) newScale = 3

        // Calculate the center of the crop area
        const centerX = displaySize / 2
        const centerY = displaySize / 2

        // Calculate the point in the original image that's currently at the center of the crop area
        const originalCenterX = (centerX - position.x) / scale
        const originalCenterY = (centerY - position.y) / scale

        // Calculate the new position to keep that same point at the center after scaling
        const newX = centerX - originalCenterX * newScale
        const newY = centerY - originalCenterY * newScale

        setScale(newScale)
        setPosition({ x: newX, y: newY })
    }

    const handleCropComplete = () => {
        if (!imageRef.current) return

        // Create a canvas for the final 500x500 output
        const canvas = document.createElement("canvas")
        canvas.width = cropSize
        canvas.height = cropSize
        const ctx = canvas.getContext("2d")

        if (!ctx) return

        // Calculate the center of the crop area in the display
        const centerX = displaySize / 2
        const centerY = displaySize / 2

        // Calculate the point in the original image that corresponds to the top-left of the crop area
        const originalX = (centerX - position.x - displaySize / 2) / scale
        const originalY = (centerY - position.y - displaySize / 2) / scale

        // Calculate the size in the original image that corresponds to the crop area
        const originalWidth = displaySize / scale
        const originalHeight = displaySize / scale

        // Draw the cropped image to the canvas
        ctx.drawImage(imageRef.current, originalX, originalY, originalWidth, originalHeight, 0, 0, cropSize, cropSize)

        // Convert to blob
        canvas.toBlob(
            (blob) => {
                if (!blob) return

                // Create a new file from the blob
                const croppedFile = new File([blob], imageFile.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                })

                onCropComplete(croppedFile)
            },
            "image/jpeg",
            0.95,
        )
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-medium">Crop Image to 500x500px</h3>
                <p className="text-sm text-muted-foreground">Drag to position and use the slider to zoom</p>
            </div>

            <div className="flex flex-col items-center justify-center">
                {/* Main editing area */}
                <div
                    className="relative border rounded-md overflow-hidden bg-checkerboard mb-4"
                    style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
                >
                    {/* Image container */}
                    <div
                        ref={containerRef}
                        className="absolute inset-0 cursor-move overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* The image being cropped */}
                        {imageSrc && imageRef.current && (
                            <div
                                style={{
                                    position: "absolute",
                                    width: `${imageSize.width * scale}px`,
                                    height: `${imageSize.height * scale}px`,
                                    left: `${position.x}px`,
                                    top: `${position.y}px`,
                                    backgroundImage: `url(${imageSrc})`,
                                    backgroundSize: `${imageSize.width * scale}px ${imageSize.height * scale}px`,
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                }}
                            />
                        )}

                        {/* Crop overlay */}
                        <div
                            className="absolute border-2 border-white rounded-sm"
                            style={{
                                width: `${displaySize}px`,
                                height: `${displaySize}px`,
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                                pointerEvents: "none",
                            }}
                        >
                            {/* Grid lines for rule of thirds */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                <div className="border-r border-white/30 col-start-1 row-span-3"></div>
                                <div className="border-r border-white/30 col-start-2 row-span-3"></div>
                                <div className="border-b border-white/30 row-start-1 col-span-3"></div>
                                <div className="border-b border-white/30 row-start-2 col-span-3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zoom controls directly below the image */}
                <div className="w-full max-w-[350px] space-y-2 mb-2">
                    <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center">
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom <ZoomIn className="h-4 w-4 ml-1" />
            </span>
                        <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
                    </div>
                    <Slider
                        value={[scale * 100]}
                        min={10}
                        max={300}
                        step={1}
                        onValueChange={(value) => handleZoom(value[0] / 100)}
                    />
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Move className="h-4 w-4 mr-1" />
                    <span>Drag image to position</span>
                </div>
            </div>

            {/* Hidden canvas for final output */}
            <canvas ref={canvasRef} width={cropSize} height={cropSize} className="hidden" />

            <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleCropComplete}>Apply Crop</Button>
            </div>
        </div>
    )
}
