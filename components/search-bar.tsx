"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState } from "react"

export function SearchBar() {
  const [query, setQuery] = useState("")

  const handleClear = () => {
    setQuery("")
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search audiobooks by title or author..."
        className="pl-10 pr-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleClear}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}

