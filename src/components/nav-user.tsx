"use client"

import {
  ChevronsUpDown,
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

import { useSession } from "next-auth/react"
import { navUsers } from "./nav-user-items/nav-user-list"
import LogoutOption from "./nav-user-items/logout-option"

export function NavUser() {
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
                { session && session.user && session.user.manager && navUsers.map(({ name, component: Component }) => (
                  <DropdownMenuItem asChild key={name}>
                    <Component session={{
                      user: {
                        name: session.user.name ?? "",
                        id: session.user.id ?? "",
                        manager: {
                          id: session.user.manager?.id ?? "",
                          entry_name: session.user.manager?.entry_name ?? "",
                          managerId: session.user.manager?.managerId ?? "",
                          userId: session.user.id ?? "",
                          player_first_name: session.user.manager?.player_first_name ?? "",
                          player_last_name: session.user.manager?.player_last_name ?? "",
                        }
                      }
                    }} />
                  </DropdownMenuItem>
                )) }
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutOption session={{
                      user: {
                        name: session.user.name ?? "",
                        id: session.user.id ?? "",
                        manager: {
                          id: session.user.manager?.id ?? "",
                          entry_name: session.user.manager?.entry_name ?? "",
                          managerId: session.user.manager?.managerId ?? "",
                          userId: session.user.id ?? "",
                          player_first_name: session.user.manager?.player_first_name ?? "",
                          player_last_name: session.user.manager?.player_last_name ?? "",
                        }
                      }
                    }} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
  )
}

