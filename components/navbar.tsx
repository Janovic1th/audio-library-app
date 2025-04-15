"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, LogIn, LogOut, Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "react-oidc-context"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const auth = useAuth()
  const { toast } = useToast()

  // Get user info from auth context
  const userEmail = auth.user?.profile.email
  const userName = auth.user?.profile.name || auth.user?.profile.nickname || "User"
  const isAuthenticated = auth.isAuthenticated

  const handleSignIn = () => {
    auth.signinRedirect()
  }

  const handleSignOut = () => {
    // Sign out from OIDC context
    auth.removeUser()

    // Redirect to Cognito logout URL
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
    const logoutUri = typeof window !== "undefined" ? window.location.origin : ""
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN
    console.log(`${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`)


    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const routes = [
    {
      href: "/",
      label: "Library",
      active: pathname === "/",
    },
  ]

  // Show loading state while auth is initializing
  if (auth.isLoading) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">AudioLib</span>
            </Link>
            <div className="flex items-center ml-auto">
              <div className="animate-pulse h-8 w-24 bg-muted rounded-md"></div>
            </div>
          </div>
        </header>
    )
  }

  // Show error state if auth fails
  if (auth.error) {
    console.error("Auth error:", auth.error)
  }

  return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">AudioLib</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ml-6">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        route.active ? "text-foreground" : "text-muted-foreground",
                    )}
                >
                  {route.label}
                </Link>
            ))}
          </nav>
          <div className="flex items-center ml-auto space-x-4">
            <ModeToggle />

            {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm font-medium">{userName}</span>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Profile</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
            ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSignIn}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </Button>
                </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {routes.map((route) => (
                    <DropdownMenuItem key={route.href} asChild>
                      <Link href={route.href}>{route.label}</Link>
                    </DropdownMenuItem>
                ))}

                {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem onClick={handleSignIn}>Log in</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
  )
}
