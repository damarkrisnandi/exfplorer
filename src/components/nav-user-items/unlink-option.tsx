"use client"
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Unlink } from "lucide-react";
import { api } from "@/trpc/react";

export default function UnlinkOption({ session }: {
  session: {
    user: {
      id: string,
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
  // const [isPendingSignOut, setIsPendingSignOut] = useState<boolean>(false);
  // const router = useRouter();

  const { mutateAsync: unlinkToFPL, isPending: isPendingUnlink } = api.manager.unlinkManager.useMutation({
      onSuccess: (data) => {
        console.log("Manager unmapped successfully:", data);
        toast.success(`Manager ${session.user.manager.entry_name} unmapped successfully!`);
        if (window !== undefined) {
          window.location.reload();
        }
      },
      onError: (error) => {
        console.error("Error unmapping manager:", error);
        toast.error("Failed to unmap manager. Please try again.");
      }
    });

const handleUnlinkToFPL = useCallback(async () => {
  if (!session) {
      toast.error("You must be logged in to link your FPL team.")
      return
    }

    if (!session.user) {
      return
    }

    if (!session.user.manager.id) {
      toast.error("Manager ID is required to unlink your FPL team.");
      return;
    }

    console.log(session.user);
    // Here you would typically redirect to the FPL linking page or perform the linking action
    toast(`Unlinking FPL team for ${session.user?.name}...`);
    await unlinkToFPL({
      userId: session.user.manager.userId,
      managerId: session.user.manager.id,
    },);

  }, [session, unlinkToFPL])

  return (
    <AlertDialog open={dialogOpen}>
      <AlertDialogTrigger className="w-full" asChild>
          <Button variant="outline" onClick={() => { setDialogOpen(true) }}>
            <Unlink />
            Unlink
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink </AlertDialogTitle>
          <AlertDialogDescription>
            Are you absolutely sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnlinkToFPL} disabled={isPendingUnlink}>
            {!isPendingUnlink ?  'Continue' : 'Unlinking...'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
