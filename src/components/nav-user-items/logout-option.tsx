"use client"
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export default function LogoutOption({ session }: {
  session: {
    user: {
      name: string,
      manager: {
        id: string,
        entry_name: string,
        managerId: string,
        userId: string,
        player_first_name: string,
        player_last_name: string,
      }
    }
  }
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isPendingSignOut, setIsPendingSignOut] = useState<boolean>(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    setIsPendingSignOut(true);
    await signOut({ callbackUrl: '/' });

    toast(`Logout from Discord Account...`)
    setIsPendingSignOut(false)
    setDialogOpen(false)
    router.push('/')
  }, [router])

  return (
    <AlertDialog open={dialogOpen}>
      <AlertDialogTrigger className="w-full" asChild>
          <Button variant="outline" onClick={() => { setDialogOpen(true) }}>
            <LogOut />
            Log out
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logout </AlertDialogTitle>
          <AlertDialogDescription>
            Are you absolutely sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut} disabled={isPendingSignOut}>
            {!isPendingSignOut ?  'Continue' : 'Logging out...'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
