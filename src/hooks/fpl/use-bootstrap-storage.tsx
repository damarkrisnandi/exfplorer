"use client"

import { api } from "@/trpc/react"
import { useEffect, useState } from "react";
import { fromStorage } from "@/lib/storage";
import type { Bootstrap } from "@/lib/bootstrap-type";

export function useBootstrapStorage() {
  const mutation = api.bootstrap.fetch.useMutation();
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  if (typeof window !== "undefined") {

  }

  useEffect(() => {
    const fetchData = async () => {
      const fetchBootstrap = await fromStorage<Bootstrap>('bootstrap/fetch', {mutateAsync: async () => { await mutation.mutateAsync() }, data: mutation.data}, 10);
      if (fetchBootstrap && !bootstrap) {
        setBootstrap(fetchBootstrap);
      }
    };
    void fetchData();
  }, [mutation, bootstrap]);

  return { bootstrap }
}
