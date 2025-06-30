"use client"

import * as React from "react"
import {
  ChartScatter,
  Home,
  Radio,
  ShieldHalfIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SessionProvider } from "next-auth/react"
import MiniBrand from "./mini-branch"
import { NavMainMenu } from "./nav-main-menu"

const mainMenu = [
      {
        name: "Home",
        url: "",
        icon: Home
      },
      {
        name: "DataVis.",
        url: "data-visualization",
        icon: ChartScatter
      },
      {
        name: "Live Event",
        url: "live-event",
        icon: Radio
      },
      {
        name: "My Team",
        url: "my-team",
        icon: ShieldHalfIcon
      },
    ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <SessionProvider>

      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu className="bg-white/10 dark:bg-gray/50">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <MiniBrand />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-white/10 dark:bg-gray/50">
          {/* <NavMain items={data.navMain} /> */}
          <NavMainMenu menuItems={mainMenu} />
          {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
        </SidebarContent>
        <SidebarFooter className="bg-white/10 dark:bg-gray/50">
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </SessionProvider>
  )
}
