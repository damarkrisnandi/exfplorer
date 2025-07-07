'use client'
import { getManagerData, getPicksData } from "@/services";
import { useMutation, useQuery } from "@tanstack/react-query";

const useMgrAndPicks = () => {
  let managerId = null
  if (typeof window !== 'undefined') {
    managerId = localStorage.getItem("manager_id_stored");
  }
  const { mutate: setManager, data: manager } = useMutation({
    mutationKey: ["managerData", managerId],
    mutationFn: async () => {

      return await getManagerData(Number(localStorage.getItem("manager_id_stored")!));
    },
    onSuccess: (data) => {
      // Handle success
      console.log("Manager data fetched successfully:", data);
    },
    onError: (error) => {
      // Handle error
    },
  })
  const { mutate: setPicks, data: picks } = useMutation({
    mutationKey: ["picks", localStorage.getItem("manager_id_stored"), ],
    mutationFn: async (currentEvent: number) => {
      return await getPicksData((Number(managerId!)), currentEvent);
    },
  });

  return { setManager, manager, setPicks, picks }
}

export default useMgrAndPicks;
