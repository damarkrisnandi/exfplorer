/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

'use client'

import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useCallback, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import type { ManagerFromAPI } from "@/server/api/routers/manager";
import { ManagerCard } from "./manager-card";
import { Loader2, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { SessionProvider } from "next-auth/react";

const managerSchema = z.object({ managerId: z.string() });
type ManagerSchemaType = z.infer<typeof managerSchema>;

export function ManagerForm({
  className,
  session,
  ...props
}: React.ComponentProps<"div"> & { session: { user: { name: string, manager: { id: string, managerId: string, entry_name: string, player_first_name: string, player_last_name: string } } } }) {
  const [manager, setManager] = useState<ManagerFromAPI | null>(null);

  const form = useForm<ManagerSchemaType>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      managerId: "",
    }
  });

  const { mutate: fetchManagerFromAPI, isPending: isPendingFetchManagerFromAPI } = api.manager.fetchManagerFromAPI.useMutation({
    onSuccess: (data: ManagerFromAPI ) => {
      console.log("Fetched manager data:", data);
      setManager(data);
      toast.success(`Manager ${data.name} fetched successfully!`);
      // Handle the fetched manager data here, e.g., update state or UI
    },
    onError: (error) => {
      console.error("Error fetching manager data:", error);
      // Handle the error, e.g., show a toast notification
    }
  });


  const onSubmit = useCallback(async (data: ManagerSchemaType) => {
    console.log("Form submitted with data:", data);
    fetchManagerFromAPI({ id: data.managerId });
    // Here you can handle the form submission, e.g., send data to an API
  }, []);
  if (!session.user.manager) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="bg-white/10 text-white">
          <CardHeader>
            <CardTitle>FPL Player?</CardTitle>
            <CardDescription>
              Find your FPL team by ID manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>

              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button type="submit" variant="outline" disabled={isPendingFetchManagerFromAPI} className="w-full bg-white/10 text-white">
                      {!isPendingFetchManagerFromAPI ?  <SearchIcon className="mr-2 size-4" /> : <Loader2 className="mr-2 size-4 animate-spin" />}
                      Find Manager by ID
                    </Button>

                  </div>
                </div>

              </form>
            </FormProvider>
          </CardContent>
        </Card>
        {manager && (
          <ManagerCard
            className="w-full"
            managerId={manager.id.toString()}
            name={manager.name}
            player_first_name={manager.player_first_name}
            player_last_name={manager.player_last_name}
          />
        )}
      </div>
    )
  }
  return (
    <SessionProvider>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <ManagerCard
          className="w-full"
          id={session.user.manager.id.toString()}
          managerId={session.user.manager.managerId}
          name={session.user.manager.entry_name}
          alias={session.user.name ?? ""}
          player_first_name={session.user.manager.player_first_name}
          player_last_name={session.user.manager.player_last_name}
          showButtonLink={false}
          showButtonUnlink={true}
        />
      </div>

    </SessionProvider>
  )
}


