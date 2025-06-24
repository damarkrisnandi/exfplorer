"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DiscordIcon } from "./svg-icon"
import { useCallback, useState } from 'react';
// import { signIn } from "@/server/auth"
// import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signOut } from "next-auth/react"
import { Loader2 } from "lucide-react"


export function LogoutForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPendingSignOut, setIsPendingSignOut] = useState(false);
  // const router = useRouter();

  const handleSignIn = useCallback(async () => {
    setIsPendingSignOut(true);
    await signOut({ callbackUrl: '/' });

    toast(`Logout from Discord Account...`)
    setIsPendingSignOut(false)
    // router.push('/')
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="text-white">
        <CardHeader className="text-center">
            <CardTitle className="text-xl">Logout</CardTitle>
            <CardDescription>
            Are you sure you want to log out of your account?
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full bg-red/10 text-white" disabled={isPendingSignOut} onClick={handleSignIn}>
                  {!isPendingSignOut ? <DiscordIcon /> : <Loader2 className="mr-2 size-4 animate-spin" />}
                  {!isPendingSignOut ? "Logout" : "Processing..."}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
