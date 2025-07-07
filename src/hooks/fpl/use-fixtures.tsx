import { getFixtures } from "@/services";
import { useQuery } from "@tanstack/react-query";

const useFixtures = () => {
  const { data: fixtures, isLoading: isLoadingFixtures, error: errorFixtures } = useQuery({
    queryKey: ["fixtures"],
    queryFn: async () => await getFixtures()
  });

  return { fixtures, isLoadingFixtures, errorFixtures };
}

export default useFixtures;
