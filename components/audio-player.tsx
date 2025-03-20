"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

interface AudiobookType {
  id: string
  title: string
  author: string
  coverUrl: string
  duration: string | number
}

interface AudioPlayerProps {
  audiobook: AudiobookType
  isPlaying: boolean
  onPlayPause: () => void
}

export function AudioPlayer({ audiobook, isPlaying, onPlayPause }: AudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isVisible, setIsVisible] = useState(false)

  // Convert string duration to seconds if needed
  const totalDuration =
    typeof audiobook.duration === "string"
      ? 272 // Default duration in seconds
      : audiobook.duration

  useEffect(() => {
    // Animate the player in after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const toggleMute = () => setIsMuted(!isMuted)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t transition-transform duration-300 transform",
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container flex items-center h-16 gap-4">
        <Link href={`/audiobook/${audiobook.id}`} className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 overflow-hidden rounded">
            <Image src={audiobook.coverUrl || "/placeholder.svg"} alt={audiobook.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{audiobook.title}</div>
            <div className="text-xs text-muted-foreground truncate">{audiobook.author}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <SkipBack className="h-5 w-5" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button onClick={onPlayPause} variant="ghost" size="icon">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <SkipForward className="h-5 w-5" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="text-xs w-10 text-right">{formatTime(currentTime)}</div>
          <Slider
            value={[currentTime]}
            max={totalDuration}
            step={1}
            onValueChange={(value) => setCurrentTime(value[0])}
            className="flex-1"
          />
          <div className="text-xs w-10">{formatTime(totalDuration)}</div>
        </div>

        <div className="hidden md:flex items-center gap-2 min-w-[140px]">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
            className="w-24"
            disabled={isMuted}
          />
        </div>
      </div>
    </div>
  )
}

