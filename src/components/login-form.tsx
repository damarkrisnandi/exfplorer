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
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPendingSignIn, setIsPendingSignIn] = useState(false);
  // const router = useRouter();

  const handleSignIn = useCallback(async () => {
    setIsPendingSignIn(true);
    await signIn("discord", { callbackUrl: '/' });

    toast(`Redirecting to Discord...`)
    setIsPendingSignIn(false)
    // router.push('/')
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Discord account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full bg-white/10 text-white" disabled={isPendingSignIn} onClick={handleSignIn}>
                  {!isPendingSignIn ? <DiscordIcon /> : <Loader2 className="mr-2 size-4 animate-spin" />}
                  {!isPendingSignIn ? "Login with Discord" : "Redirecting..."}
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
