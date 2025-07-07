
import { getLiveEventData, getArchivedLiveEventData } from "@/services";
import { currentSeason } from "@/utils";
import { useQuery } from "@tanstack/react-query";

interface Stat {
  assists: number
  bonus: number
  bps: number
  clean_sheets: number
  creativity: string
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals: string;
  expected_goals_conceded: string;
  goals_conceded: number
  goals_scored: number
  ict_index: string
  in_dreamteam: boolean
  influence: string
  minutes: number
  own_goals: number
  penalties_missed: number
  penalties_saved: number
  red_cards: number
  saves: number
  starts: number
  threat: string
  total_points: number
  yellow_cards: number
}

interface PartialStat {
  [key: string]: number | string | boolean | undefined;
}

// const calculateTotalStats = (statsArray: Stat[]) => {
//   const totalStats: PartialStat = {};

//   statsArray.forEach((stat: Partial<Stat>) => {
//     for (const key in stat) {
//       interface PartialStat {
//         [key: string]: number | string | boolean | undefined;
//       }

//       if (typeof stat[key] === 'number') {
//         if (!totalStats[key]) {
//           totalStats[key] = 0;
//         }
//         totalStats[key] = (totalStats[key] || 0) + stat[key];
//       } else if (typeof stat[key] === 'string') {
//         if (!totalStats[key]) {
//           totalStats[key] = '0';
//         }
//         totalStats[key] = (parseFloat(totalStats[key]) + parseFloat(stat[key])).toFixed(2);
//       } else if (typeof stat[key] === 'boolean') {
//         if (!totalStats[key]) {
//           totalStats[key] = false;
//         }
//         totalStats[key] = totalStats[key] || stat[key];
//       }
//     }
//   });

//   return totalStats;
// };
const useLastFiveGw = ({ bootstrap, event, n }: any) => {
  const {
    data: last5,
    isLoading: isLoadingLast5,
    error: errorLast5,
  } = useQuery({
    queryKey: ["last5"],
    queryFn: async () => await Promise.all(Array.from({ length: n ? n : 5 }, (_, i: number) => {
      return getLiveEventData(event.id - i);
      // return i == 0 ? getLiveEventData(event.id - i) : getArchivedLiveEventData(currentSeason, event.id - i)
    })),
    
    // {
    //     let liveData;
    //     if (event.id < 5) {
    //         liveData = await Promise.all(Array.from({length: event.id}, (_, i: number) => getLiveEventData(event.id - i)));
    //     } else {
    //         liveData = await Promise.all([getLiveEventData(event.id), getLiveEventData(event.id - 1), getLiveEventData(event.id - 2), getLiveEventData(event.id - 3), getLiveEventData(event.id - 4)]);
    //     }

    //     return liveData
        
    // },
    enabled: !!bootstrap && !!event
  });

  return { last5, isLoadingLast5, errorLast5}
} 

export default useLastFiveGw;
