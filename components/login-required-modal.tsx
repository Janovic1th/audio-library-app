"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LogIn } from "lucide-react"
import { useAuth } from "react-oidc-context"

interface LoginRequiredModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
    const auth = useAuth()

    const handleLogin = () => {
        onClose()
        auth.signinRedirect()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Authentication Required</DialogTitle>
                    <DialogDescription>You need to be logged in to upload books to your library.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-center text-muted-foreground mb-4">
                        Please log in to access all features of the audiobook library, including uploading your own books.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleLogin}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
