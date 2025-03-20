"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, LogIn, Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Library",
      active: pathname === "/",
    },
    {
      href: "/upload",
      label: "Upload",
      active: pathname === "/upload",
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">AudioLib</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary text-foreground"
          >
            Library
          </Link>
        </nav>
        <div className="flex items-center ml-auto space-x-4">
          <ModeToggle />
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
            <Button size="sm">Register</Button>
          </div>
          <Link href="/profile" className="hidden md:block">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/">Library</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Login</DropdownMenuItem>
              <DropdownMenuItem>Register</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

