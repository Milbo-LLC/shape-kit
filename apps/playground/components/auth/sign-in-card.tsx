'use client'

import { useState } from 'react'
import { LogIn, LogOut, Loader2 } from 'lucide-react'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function SignInCard() {
  const { data: session, isLoading: isSessionLoading } = authClient.useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoading = isSessionLoading || isSubmitting

  const handleSignIn = async () => {
    setIsSubmitting(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/'
      })
    } catch (error) {
      console.error('Failed to sign in with Google', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setIsSubmitting(true)
    try {
      await authClient.signOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-muted bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Welcome to Shape Kit</CardTitle>
        <CardDescription>
          {session?.user
            ? 'You are signed in and ready to explore the playground.'
            : 'Sign in to sync your CAD experiments across devices.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session?.user ? (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{session.user.name ?? 'Anonymous engineer'}</p>
            <p>{session.user.email ?? 'No email on record'}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Use your Google account to authenticate securely with Better Auth.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {session?.user ? (
          <Button onClick={handleSignOut} disabled={isLoading} className="w-full" variant="secondary">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign out
          </Button>
        ) : (
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
