'use client'
import { getArchivedBootstrap } from "@/services";
import { useQuery } from "@tanstack/react-query";

const useBootstrapHist = ({ season }: any) => {
  const { data: bootstrapHist, isLoading: isLoadingBootstrapHist, error: errorBootstrapHist } = useQuery({
    queryKey: ["bootstrapHist"],
    queryFn: async () => await getArchivedBootstrap(season),
    enabled: !!season
  });

  return { bootstrapHist, isLoadingBootstrapHist, errorBootstrapHist }
}

export default useBootstrapHist;
