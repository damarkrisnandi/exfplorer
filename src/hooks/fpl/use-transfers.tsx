import { getManagerTransferData } from "@/services";
import { useQuery } from "@tanstack/react-query";

const useTransfers = ({ managerId }: any) => {
  const {
    data: transfers,
    isLoading: isLoadingTransfers,
    error: errorTransfers,
  } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => await getManagerTransferData(managerId || 0),
    enabled: !!managerId
  });

  return { transfers, isLoadingTransfers, errorTransfers}
} 

export default useTransfers;
