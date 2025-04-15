"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Save, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "react-oidc-context"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()

  // Check if user is authenticated and load profile data
  useEffect(() => {
    const checkAuth = () => {
      if (!auth.isAuthenticated) {
        // Not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      // Load user data from auth context
      const userProfile = auth.user?.profile
      setName(userProfile?.name || userProfile?.nickname || "User")
      setEmail(userProfile?.email || "")
      setIsLoading(false)
    }

    if (!auth.isLoading) {
      checkAuth()
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, router, toast])

  const handleSave = () => {
    setIsLoading(true)

    // Note: In a real app, you would update the user's profile in Cognito
    // For this demo, we'll just simulate a successful update
    setTimeout(() => {
      setIsEditing(false)
      setIsLoading(false)

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      })
    }, 1000)
  }

  const handleLogout = () => {
    // Sign out from OIDC context
    auth.removeUser()

    // Redirect to Cognito logout URL
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
    const logoutUri = typeof window !== "undefined" ? window.location.origin : ""
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN

    if (cognitoDomain && clientId) {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
    }

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })

    router.push("/")
  }

  if (auth.isLoading || isLoading) {
    return (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Loading profile...</h1>
        </div>
    )
  }

  return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile picture" />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{name}</CardTitle>
                  <CardDescription>{email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={true} // Email can't be changed in Cognito without verification
                />
                {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed directly. Please contact support.
                    </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        "Saving..."
                    ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                    )}
                  </Button>
              ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Overview of your audiobook library usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Audiobooks</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Listening Time</p>
                  <p className="text-2xl font-bold">24h 15m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {auth.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Details</CardTitle>
                  <CardDescription>Information about your current session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Authentication Provider</p>
                      <p className="font-medium">Amazon Cognito</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Session Status</p>
                      <p className="font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Active
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-medium truncate">{auth.user.profile.sub}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  )
}
