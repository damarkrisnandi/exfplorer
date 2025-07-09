import type { StatIdentifier } from "./fixture-type";
import type { XPoint } from "./xp-type";

export type LiveEvent = {
  elements: Array<{
    id: number;
    stats: LiveEventStat;
    explain: Array<{
      fixture: number;
      stats: {
        identifier: StatIdentifier;
        points: number;
        value: number;
        points_modification: number;
      }[];
    }>;
    modified: boolean;
  }>;
};

export type LiveEventStat = {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  mng_win: number;
  mng_draw: number;
  mng_loss: number;
  mng_underdog_win: number;
  mng_underdog_draw: number;
  mng_clean_sheets: number;
  mng_goals_scored: number;
  total_points: number;
  in_dreamteam: boolean;
} & XPoint
