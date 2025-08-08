'use client'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import useReference from "@/hooks/fpl/use-reference"
import type { Reference } from "@/lib/reference-type"
// import { getStorage } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePathname } from "next/navigation"

const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const titleMapping = new Map<string, string>();
  titleMapping.set('', 'Home');
  titleMapping.set('/data-visualization', 'Data Visualization');
  titleMapping.set('/live-event', 'Live Event');
  titleMapping.set('/my-team', 'My Team');
  titleMapping.set('/player-stats', 'Player Statistics');
  // const refData = getStorage('reference') as Reference | undefined;

  // const reference = useReference(refData);


  return (
    <QueryClientProvider client={queryClient}>
      <div className={cn(
        'w-full',
      )}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="h-[95vh]">
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        exFPLorer
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{ titleMapping.get(pathname?.replace('/dashboard', '') ?? '') }</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className={cn(
              "flex flex-1 flex-col gap-4 p-4 pt-0",
              "bg-gray-100 dark:bg-gray-700",
              "overflow-y-auto"
              )}>
                 { children }
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

    </QueryClientProvider>
    )

}
