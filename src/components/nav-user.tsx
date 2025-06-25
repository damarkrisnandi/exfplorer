"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { data: session } = useSession();

  if (!session) {
    return
  }

  if (!session.user) {
    return
  }



  return (

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                {session.user.manager ?  <Avatar>
                  <AvatarImage src={`https://placehold.co/20x20?text=${session.user.manager.player_first_name[0]}${session.user.manager.player_last_name[0]}`} alt="player_first_name" />
                  <AvatarFallback>{session.user.manager.player_first_name[0]}{session.user.manager.player_last_name[0]}</AvatarFallback>
                </Avatar> : null}
                <Avatar>
                  <AvatarImage src={session?.user.image ?? `https://placehold.co/20x20?text=A`} alt={session?.user.name} />
                  <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{session.user.manager ? session.user.manager.entry_name : session.user.name }</span>
                  <span className="truncate text-xs">{session.user.manager ?
                  `${session.user.manager.player_first_name} ${session.user.manager.player_last_name} / @ ${session.user.name}` : ''}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutOption />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
  )
}

function LogoutOption() {
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
  }, [])

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
