export type ElementStat = {
  value: number,
  element: number
};

export type StatIdentifier = 'goals_scored' | 'assists' | 'own_goals' | 'penalties_saved' | 'penalties_missed' | 'yellow_cards' | 'red_cards' | 'saves' | 'bonus' | 'bps' | 'influence' | 'creativity' | 'threat' | 'ict_index' | 'clean_sheets';

export type FixtureStat = {
  identifier: StatIdentifier;
  a: ElementStat[];
  h: ElementStat[];
};

export type Fixture = {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number;
  team_h: number;
  team_h_score: number;
  stats: FixtureStat[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
};
