'use client'
import { getBootstrapFromStorage } from "@/services";
import { useQuery } from "@tanstack/react-query";

const useBootstrap = () => {
  const { data: bootstrap, isLoading: isLoadingBootstrap, error: errorBootstrap } = useQuery({
    queryKey: ["bootstrap"],
    queryFn: async () => await getBootstrapFromStorage(),
  });

  return { bootstrap, isLoadingBootstrap, errorBootstrap }
}

export default useBootstrap;
