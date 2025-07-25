"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCallback, useState } from 'react';

import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Link, Loader2, Unlink2 } from "lucide-react"
import { api } from "@/trpc/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type ManagerCardProps = {
  className?: string;
  id?: string;
  managerId: string;
  name: string;
  alias?: string; // user name
  player_first_name: string;
  player_last_name: string;
  showButtonLink?: boolean;
  showButtonUnlink?: boolean;
}


export function ManagerCard({
  className,
  id,
  managerId,
  name,
  alias, // user name
  player_first_name,
  player_last_name,
  showButtonLink = true,
  showButtonUnlink = false,
}: ManagerCardProps) {
  const { data: session } = useSession();

  const [] = useState<typeof session>(session);

  const { mutateAsync: linkToFPL, isPending: isPendingLink } = api.manager.linkManager.useMutation({
    onSuccess: (data) => {
      console.log("Manager mapped successfully:", data);
      toast.success(`Manager ${name} mapped successfully!`);
      if (window !== undefined) {
        window.location.reload();
      }
    },
    onError: (error) => {
      console.error("Error mapping manager:", error);
      toast.error("Failed to map manager. Please try again.");
    }
  });

  const { mutateAsync: unlinkToFPL, isPending: isPendingUnlink } = api.manager.unlinkManager.useMutation({
    onSuccess: (data) => {
      console.log("Manager unmapped successfully:", data);
      toast.success(`Manager ${name} unmapped successfully!`);
      if (window !== undefined) {
        window.location.reload();
      }
    },
    onError: (error) => {
      console.error("Error unmapping manager:", error);
      toast.error("Failed to unmap manager. Please try again.");
    }
  });


  const handleLinkToFPL = useCallback(async () => {
    if (!session) {
      toast.error("You must be logged in to link your FPL team.")
      return
    }
    console.log(session.user);
    // Here you would typically redirect to the FPL linking page or perform the linking action
    toast(`Linking FPL team for ${session.user?.name}...`);
    await linkToFPL({
      entry_name: name,
      managerId: managerId,
      userId: session.user.id,
      player_first_name: player_first_name,
      player_last_name: player_last_name,
    });

  }, [session, managerId, name, player_first_name, player_last_name, linkToFPL])

  const handleUnlinkToFPL = useCallback(async () => {
    if (!session) {
      toast.error("You must be logged in to link your FPL team.")
      return
    }

    if (!session.user) {
      return
    }

    if (!id) {
      toast.error("Manager ID is required to unlink your FPL team.");
      return;
    }

    console.log(session.user);
    // Here you would typically redirect to the FPL linking page or perform the linking action
    toast(`Unlinking FPL team for ${session.user?.name}...`);
    await unlinkToFPL({
      userId: session.user.id,
      managerId: id,
    },);

  }, [session, id, unlinkToFPL])

  return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Card className="text-white ">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/20x20?text=${player_first_name[0]}${player_last_name[0]}`} alt="player_first_name" />
                    <AvatarFallback>{player_first_name[0]}{player_last_name[0]}</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src={session?.user.image ?? `https://placehold.co/20x20?text=A`} alt={session?.user.name} />
                    <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="text-xl">{ name }</CardTitle>
                  <CardDescription>
                    { player_first_name } { player_last_name } { alias ? `/ @${alias}` : "" }
                  </CardDescription>

                </div>
              </div>

              <div className="flex flex-col gap-4">
              {showButtonLink &&
                <Button variant="outline" className="w-full bg-white/10 text-white" disabled={isPendingLink} onClick={handleLinkToFPL}>
                  {!isPendingLink ? <Link /> : <Loader2 className="mr-2 size-4 animate-spin" />}
                  Link to FPL Team
                </Button>
              }
              {showButtonUnlink &&
                <Button variant="outline" className="w-full bg-white/10 text-white" disabled={isPendingUnlink} onClick={handleUnlinkToFPL}>
                  {!isPendingUnlink ? <Unlink2 /> : <Loader2 className="mr-2 size-4 animate-spin" />}
                  Unlink
                </Button>
              }
              </div>
            </div>
          </CardHeader>


        </Card>

      </div>

  )
}
