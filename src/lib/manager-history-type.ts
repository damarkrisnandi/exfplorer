export type EventManager = {
  event: number,
  points: number,
  total_points: number,
  rank: number,
  rank_sort: number,
  overall_rank: number,
  percentile_rank: number,
  bank: number,
  value: number,
  event_transfers: number,
  event_transfers_cost: number,
  points_on_bench: number
}

export type PastEventsResult = {
  season_name: string,
  total_points: number,
  rank: number
}

export type ChipUsage = {
  name: 'wildcard' | 'freehit' | 'manager' | '3xc' | 'bboost' | '',
  time: Date,
  event: number
}

export type ManagerHistory = {
  current: EventManager[],
  past: PastEventsResult[],
  chips: ChipUsage[]
}
