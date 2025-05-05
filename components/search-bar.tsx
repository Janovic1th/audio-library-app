"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface SearchBarProps {
    onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
        }
    }, [])

    // Add this useEffect after the existing cleanup useEffect
    useEffect(() => {
        // Trigger an initial search with empty query when component mounts
        triggerSearch("")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty dependency array ensures this runs only once on mount

    const handleClear = () => {
        setQuery("")
        triggerSearch("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Only trigger search if not already searching
        if (!isSearching) {
            triggerSearch(query)
        }
    }

    const triggerSearch = (searchQuery: string) => {
        // Set searching state to prevent multiple calls
        setIsSearching(true)

        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Call the search function
        onSearch(searchQuery)

        // Set a timeout to reset the searching state
        searchTimeoutRef.current = setTimeout(() => {
            setIsSearching(false)
        }, 300) // Debounce for 300ms to prevent rapid consecutive searches
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)

        // Clear any existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        // Set a new debounce timeout to trigger search after typing stops
        debounceTimeoutRef.current = setTimeout(() => {
            if (!isSearching) {
                triggerSearch(newQuery)
            }
        }, 300) // Wait 300ms after typing stops before searching
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search audiobooks by title or author..."
                className="pl-10 pr-10"
                value={query}
                onChange={handleInputChange}
            />
            {query && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleClear}
                    disabled={isSearching}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
            <Button type="submit" className="hidden" disabled={isSearching}>
                Search
            </Button>
        </form>
    )
}
