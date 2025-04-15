"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Pause, Play, Rewind, FastForward, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"

interface AudiobookType {
  id: string
  title: string
  author: string
  coverUrl: string
  audioUrl: string
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
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isVisible, setIsVisible] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) return

    // Set initial volume
    audioRef.current.volume = volume / 100

    // Set up event listeners
    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setCurrentTime(0)
      onPlayPause() // Toggle play state when audio ends
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [onPlayPause])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        onPlayPause() // Reset play state if there's an error
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, onPlayPause])

  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  // Animate the player in after a short delay
  useEffect(() => {
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

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipBackward = () => {
    if (!audioRef.current) return

    const newTime = Math.max(0, currentTime - 10)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipForward = () => {
    if (!audioRef.current) return

    const newTime = Math.min(duration, currentTime + 10)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
      <div
          className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background border-t transition-transform duration-300 transform",
              isVisible ? "translate-y-0" : "translate-y-full",
          )}
      >
        {/* Hidden audio element */}
        {/*<audio ref={audioRef} src={"/sigma.mp3"} preload="metadata" />*/}
        <audio ref={audioRef} src={audiobook.audioUrl} preload="metadata" />

        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden md:block">
          <div className="container flex items-center h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 overflow-hidden rounded">
                <Image
                    src={audiobook.coverUrl || "/placeholder.svg"}
                    alt={audiobook.title}
                    fill
                    className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{audiobook.title}</div>
                <div className="text-xs text-muted-foreground truncate">{audiobook.author}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={skipBackward}>
                <Rewind className="h-5 w-5" />
                <span className="sr-only">Back 10 seconds</span>
              </Button>

              <Button onClick={onPlayPause} variant="ghost" size="icon">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={skipForward}>
                <FastForward className="h-5 w-5" />
                <span className="sr-only">Forward 10 seconds</span>
              </Button>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="text-xs w-10 text-right">{formatTime(currentTime)}</div>
              <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
              />
              <div className="text-xs w-10">{formatTime(duration)}</div>
            </div>

            <div className="flex items-center gap-2 min-w-[140px]">
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

        {/* Mobile Layout - Hidden on desktop */}
        <div className="block md:hidden">
          <div className="container px-3 py-3">
            {/* Top row: Book info and play/pause */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 max-w-[60%]">
                <div className="relative h-10 w-10 overflow-hidden rounded flex-shrink-0">
                  <Image
                      src={audiobook.coverUrl || "/placeholder.svg"}
                      alt={audiobook.title}
                      fill
                      className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate text-sm">{audiobook.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{audiobook.author}</div>
                </div>
              </div>

              <Button onClick={onPlayPause} variant="ghost" size="sm" className="h-10 px-3">
                {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>

            {/* Middle row: Progress bar (full width) */}
            <div className="flex items-center gap-2 w-full mb-2">
              <div className="text-xs w-8 text-right">{formatTime(currentTime)}</div>
              <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
              />
              <div className="text-xs w-8">{formatTime(duration)}</div>
            </div>

            {/* Bottom row: Skip controls */}
            <div className="flex items-center justify-center gap-8">
              <Button variant="ghost" onClick={skipBackward} className="flex flex-col items-center h-auto py-1">
                <Rewind className="h-5 w-5 mb-1" />
                <span className="text-xs">-10s</span>
              </Button>

              <Button variant="ghost" onClick={toggleMute} className="flex flex-col items-center h-auto py-1">
                {isMuted ? <VolumeX className="h-5 w-5 mb-1" /> : <Volume2 className="h-5 w-5 mb-1" />}
                <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>

              <Button variant="ghost" onClick={skipForward} className="flex flex-col items-center h-auto py-1">
                <FastForward className="h-5 w-5 mb-1" />
                <span className="text-xs">+10s</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}
