import type { PickData, PlayerPicked } from "@/server/api/routers/squad-pick";
import type { Bootstrap, Element, Event, GameConfig, PointPerPosition, Team } from "./bootstrap-type";
import type { Fixture, FixtureStat } from "./fixture-type";
import type { LiveEvent } from "./live-event-type";
import { solve, type Solution } from 'yalps';
import type { XPoint } from "./xp-type";

const calculateBaseExpected = (element: Element, game_config: GameConfig, fixtures: Fixture[]) => {
  let xP = 0;
  const {
    element_type,
    bonus,
    saves,
    minutes,
    bps,
    yellow_cards,
    red_cards,
    goals_scored,
    assists,
    starts,
    own_goals
  } = element;

  const expected_goals_per_90 = Number(element.expected_goals_per_90);
  const expected_assists_per_90 = Number(element.expected_assists_per_90);
  const starts_per_90 = Number(element.starts_per_90);
  const clean_sheets_per_90 = Number(element.clean_sheets_per_90);
  const expected_goals_conceded_per_90 = Number(element.expected_goals_conceded_per_90);

  const indexPer90 = minutes > 0 ? (90 / minutes) : 0;
  const xYC = (yellow_cards * indexPer90) * game_config.scoring.yellow_cards;
  const xRC = (red_cards * indexPer90) * game_config.scoring.red_cards;
  const pMP = starts_per_90 >= 0.67 ? game_config.scoring.long_play : starts_per_90 == 0 ? 0 : game_config.scoring.short_play;
  const xOG = (own_goals * indexPer90) * game_config.scoring.own_goals;
  const goalp90 = goals_scored * indexPer90;
  const assistp90 = assists * indexPer90;

  const position = (element_type: number) => {
    switch (element_type) {
      case 1:
        return 'GKP'
      case 2:
        return 'DEF'
      case 3:
        return 'MID'
      case 4:
        return 'FWD'

      default:
        return 'FWD'
    }
  }
  const xPG = ((expected_goals_per_90 + goalp90) / 2) * game_config.scoring.goals_scored[position(element_type) as keyof PointPerPosition];
  const xPA = ((expected_assists_per_90 + assistp90) / 2) * game_config.scoring.assists;
  const xCS = starts_per_90 >= 0.67
    ? (clean_sheets_per_90 >= 0.67 ? (game_config.scoring.clean_sheets[position(element_type) as keyof PointPerPosition] * clean_sheets_per_90) : 0)
    : 0;
  const xGC = Math.floor(expected_goals_conceded_per_90 / 2) * game_config.scoring.goals_conceded[position(element_type) as keyof PointPerPosition];
  const xSaves = Math.floor((saves * indexPer90) / 3);
  const bpsRank = averageRank(element, fixtures);
  let xBonus = 0;
  if (bpsRank && bpsRank <= 1.05) {
    xBonus = 3
  } else if (bpsRank && bpsRank <= 2.05) {
    xBonus = 2
  } else if (bpsRank && bpsRank <= 3.05) {
    xBonus = 1
  }

  xP = pMP + xOG + xYC + xRC + xPG + xPA + xGC + xSaves + xCS + xBonus;

  // const xMin = fixtures.length > 0 ? (minutes / (90 * fixtures.length)) : 0.0;
  // xP *= (xMin > 0.5) ? 1 : xMin;
  return xP;
};

const calculateBaseExpectedLastMatches = (
  baseEl: Element,
  game_config: GameConfig,
  stat5: LiveEvent[],

  fixtures: Fixture[]
) => {
  let xP5 = 0;
  let match = 0

  if (!stat5) return 0;

  for (const live of stat5.filter((le: LiveEvent) => le.elements.find((e: { id: number }) => e.id === baseEl.id))) {
    match++;
    let xP = 0
    const {
      element_type,

    } = baseEl;

    const stats = live.elements.find((el: { id: number }) => el.id === baseEl.id)?.stats;
    if (!stats) continue;
    const {
      // element_type,
      bonus,
      // expected_goals_per_90,
      // expected_assists_per_90,
      // starts_per_90,
      // clean_sheets_per_90,
      own_goals,
      // expected_goals_conceded_per_90,
      saves,
      minutes,
      bps,
      yellow_cards,
      red_cards,
      goals_scored,
      assists,
      starts,
      expected_goals,
      expected_assists,
      expected_goals_conceded,
      clean_sheets
    } = stats;

    const indexPer90 = minutes / 90 //minutes > 0 ? (90 / minutes) : 0;
    const xYC = (yellow_cards * indexPer90) * -1;
    const xRC = (red_cards * indexPer90) * -2;
    const pMP = starts >= 0.67 ? 2 : starts == 0 ? 0 : 1;
    const xOG = (own_goals * indexPer90) * -1;
    const goalp90 = goals_scored * indexPer90;
    const assistp90 = assists * indexPer90;
    const position = (element_type: number) => {
      switch (element_type) {
        case 1:
          return 'GKP'
        case 2:
          return 'DEF'
        case 3:
          return 'MID'
        case 4:
          return 'FWD'

        default:
          return 'FWD'
      }
    }


    const xPG = ((Number(expected_goals) + Number(goalp90)) / 2) * game_config.scoring.goals_scored[position(element_type) as keyof PointPerPosition];
    const xPA = ((Number(expected_assists) + assistp90) / 2) * game_config.scoring.assists;
    const xCS = starts >= 0.67
      ? (clean_sheets >= 0.67 ? (game_config.scoring.clean_sheets[position(element_type) as keyof PointPerPosition] * clean_sheets) : 0)
      : 0;
    const xGC = Math.floor(Number(expected_goals_conceded) / 2) * game_config.scoring.goals_conceded[position(element_type) as keyof PointPerPosition];
    const xSaves = Math.floor((saves * indexPer90) / 3);

    const bpsRank = averageRank(baseEl, fixtures);
    let xBonus = 0;
    if (bpsRank && bpsRank <= 1.05) {
      xBonus = 3
    } else if (bpsRank && bpsRank <= 2.05) {
      xBonus = 2
    } else if (bpsRank && bpsRank <= 3.05) {
      xBonus = 1
    }



    xP = xPG + xPA + xGC + xSaves + xCS + xBonus;
    xP += pMP + xOG + xYC + xRC;
    // const xMin = (minutes / (90 * fixturesLen))
    // xP *= (xMin > 0.5) ? 1 : xMin;

    xP5 += xP;
  }

  return xP5 / match;

}

export function getExpectedPoints({
  element,
  currentGameWeek,
  deltaEvent,
  game_config,
  fixtures,
  teams,
  elementHistory,
  fixturesHistory,
  last5
}: {
  element: Element,
  currentGameWeek: number,
  deltaEvent: number,
  game_config: GameConfig,
  fixtures: Fixture[],
  teams: Team[],
  elementHistory?: Element,
  fixturesHistory?: Fixture[],
  last5?: LiveEvent[]
}) {
  const gameWeek = currentGameWeek + deltaEvent;

  if (gameWeek > 38) {
    return 0;
  } else if (gameWeek < 1) {
    // bisa pake history data bootstrap static
    return 0;
  }

  let xP = 0;
  const filteredFixtures = fixtures.filter(
    (fix: Fixture) =>
      (element.team == fix.team_h || element.team == fix.team_a) &&
      fix.event <= gameWeek - 1,
  );

  if (last5 && last5?.length > 0) {
    xP = calculateBaseExpectedLastMatches(element, game_config, last5, filteredFixtures.filter((f: Fixture) => f.event >= currentGameWeek - last5.length));
  } else {
    xP = calculateBaseExpected(element, game_config, filteredFixtures);
  }


  let xPHistory = 0;
  if (elementHistory && fixturesHistory) {
    xPHistory = calculateBaseExpected(elementHistory, game_config, fixturesHistory);
  }

  if (elementHistory) {
    if (gameWeek == 1) {
      xP = xPHistory;
    } else {
      xP = (0.85 * xP) + (0.15 * xPHistory);
    }
  } else {
  }

  const elementStatusIndex = {
    a: 1,
    d: element.chance_of_playing_next_round / 100,
    i: element.chance_of_playing_next_round / 100,
    u: 0,
    s: 0,
  };

  // TODO: specify diffRef for each element
  const diffRef = {
    1: 1.2,
    2: 1.04,
    3: 0.96,
    4: 0.88,
    5: 0.8,
  };
  let diffIndex = 1;
  const filteredfixturesByGameweek = fixtures.filter(
    (fix: Fixture) =>
      fix.event == gameWeek &&
      (element.team == fix.team_h || element.team == fix.team_a),
  );

  let totalXP = 0;

  for (const fixture of filteredfixturesByGameweek) {
    if (element.team == fixture.team_h) {
      if (deltaEvent < 0 && !fixture.finished) {
        return 0;
      }
      const foundTeam_H = teams.find((t: Team) => t.id == fixture.team_h);
      const foundTeam_A = teams.find((t: Team) => t.id == fixture.team_a);
      if (!foundTeam_H || !foundTeam_A) {
        return 0
      }
      diffIndex = diffRef[fixture.team_h_difficulty as keyof typeof diffRef] +
        getHomeAwayIndex(
          element,
          foundTeam_H,
          foundTeam_A,
          true,
        );
    } else if (element.team == fixture.team_a) {
      if (deltaEvent < 0 && !fixture.finished) {
        return 0;
      }
      const foundTeam_H = teams.find((t: Team) => t.id == fixture.team_h);
      const foundTeam_A = teams.find((t: Team) => t.id == fixture.team_a);
      if (!foundTeam_H || !foundTeam_A) {
        return 0
      }
      diffIndex = diffRef[fixture.team_a_difficulty as keyof typeof diffRef] +
        getHomeAwayIndex(
          element,
          foundTeam_A,
          foundTeam_H,
          false,
        );
    }

    xP = xP * element.starts_per_90 * diffIndex *
      elementStatusIndex[element.status as keyof typeof elementStatusIndex];

    totalXP += xP;
  }
  return totalXP;
}

function getHomeAwayIndex(
  element: Element,
  teamData: Team,
  opponentData: Team,
  isHome: boolean,
) {
  let haIdxValue = 1;

  const homeOff = teamData.strength_attack_home;
  const homeDef = teamData.strength_defence_home;
  const awayOff = teamData.strength_attack_away;
  const awayDef = teamData.strength_defence_away;

  // const homeOvr = teamData.strength_overall_home;
  // const awayOvr = teamData.strength_overall_away;

  const homeOffOpp = opponentData.strength_attack_home;
  const homeDefOpp = opponentData.strength_defence_home;
  const awayOffOpp = opponentData.strength_attack_away;
  const awayDefOpp = opponentData.strength_defence_away;

  const homeOvrOpp = opponentData.strength_overall_home;
  const awayOvrOpp = opponentData.strength_overall_away;

  if (isHome) {
    switch (element.element_type) {
      case 4:
        haIdxValue = (1 * (homeOff - awayDefOpp)) / awayOvrOpp +
          (0 * (homeDef - awayOffOpp)) / awayOvrOpp;
        break;
      case 3:
        haIdxValue = ((8 / 9) * (homeOff - awayDefOpp)) / awayOvrOpp +
          ((1 / 9) * (homeDef - awayOffOpp)) / awayOvrOpp;
        break;
      case 2:
        haIdxValue = ((9 / 15) * (homeOff - awayDefOpp)) / awayOvrOpp +
          ((6 / 15) * (homeDef - awayOffOpp)) / awayOvrOpp;
        break;
      case 1:
        haIdxValue = (0 * (homeOff - awayDefOpp)) / awayOvrOpp +
          (1 * (homeDef - awayOffOpp)) / awayOvrOpp;
        break;
      default:
        break;
    }
  } else {
    switch (element.element_type) {
      case 4:
        haIdxValue = (1 * (awayOff - homeDefOpp)) / homeOvrOpp +
          (0 * (awayDef - homeOffOpp)) / homeOvrOpp;
        break;
      case 3:
        haIdxValue = ((8 / 9) * (awayOff - homeDefOpp)) / homeOvrOpp +
          ((1 / 9) * (awayDef - homeOffOpp)) / homeOvrOpp;
        break;
      case 2:
        haIdxValue = ((9 / 15) * (awayOff - homeDefOpp)) / homeOvrOpp +
          ((6 / 15) * (awayDef - homeOffOpp)) / homeOvrOpp;
        break;
      case 1:
        haIdxValue = (0 * (awayOff - homeDefOpp)) / homeOvrOpp +
          (1 * (awayDef - homeOffOpp)) / homeOvrOpp;
        break;
      default:
        break;
    }
  }

  return haIdxValue;
}

function averageRank(element: Element, fixtures: Fixture[]) {
  const filteredFixtures = fixtures.filter(
    (f: Fixture) => f.stats.find(
      (stat: FixtureStat) => (
        stat.identifier === 'bps' &&
        (stat.h.find((e: { element: number, value: number }) => e.element === element.id) ??
          stat.a.find((e: { element: number, value: number }) => e.element === element.id))
      )
    )
  )

  const ranksBPS: number[] = [];

  for (const fixture of filteredFixtures) {
    const stat = fixture.stats.find((s: FixtureStat) => s.identifier === 'bps');
    if (!stat) continue;

    // Combine home and away BPS arrays
    const allBps = [...(stat.h ?? []), ...(stat.a ?? [])];

    // Sort descending by value (higher BPS is better)
    allBps.sort((a, b) => b.value - a.value);

    // Find the rank (1-based) of the element
    const rank = allBps.findIndex(e => e.element === element.id);
    if (rank !== -1) {
      ranksBPS.push(rank + 1);
    }
  }

  if (ranksBPS.length === 0) return null;
  return ranksBPS.reduce((a, b) => a + (b ?? 0), 0) / ranksBPS.length;
}


export function wildcardOptimizationModel({
  bootstrap,
  bootstrapHistory,
  fixtures,
  fixturesHistory,
  last5,
  objective,
}: {
  fixtures: Fixture[],
  fixturesHistory: Fixture[],
  last5?: LiveEvent[],
  bootstrap: Bootstrap,
  bootstrapHistory: Bootstrap,
  objective?: keyof XPoint
}) {
  bootstrap.elements.sort((a: Element, b: Element) => a.element_type - b.element_type);

  bootstrap.elements.sort((a: Element, b: Element) => {
    return (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0);
  });

  // const playerConstraints = Object.fromEntries(mandatoryPlayer.map(p => [p, {"equal": 1}]))
  const teamConstaints = Object.fromEntries(
    bootstrap.elements.map((e: Element) => [`team_${e.team_code}`, { max: 3 }]),
  );

  // only integers
  const fplInts = Object.fromEntries(
    bootstrap.elements.map((e: Element) => [`player_${e.id}`, 1]),
  );

  //#region pick optimization
  // variables
  const fplVariables2 = createVariables({
    bootstrap,
    bootstrapHistory,
    fixtures,
    fixturesHistory,
    last5
  });
  // constraints
  const maxPick2 = Object.fromEntries(
    bootstrap.elements.map((e: Element) => [`player_${e.id}`, { max: 1, min: 0 }]),
  );
  const posConstraints2 = {
    gkp: { equal: 2 },
    def: { equal: 5 },
    mid: { equal: 5 },
    fwd: { equal: 3 },
  };
  // const playerConstraints2 = Object.fromEntries(mandatoryPlayer.map(p => [p, {"min": 0, "max": 1}]))

  // pick optimization model
  return {
    direction: "maximize" as const,
    objective: "xp_o5",
    constraints: {
      ...maxPick2,
      now_cost: { max: 1000 },
      ...posConstraints2,
      ...teamConstaints,
      max_pick: { equal: 15 },
    },
    variables: {
      ...fplVariables2,
      // ...fplCaptaincyVariables2
    },
    integers: [...Object.keys(fplInts)],
  };
};

export function picksOptimizationModel({
  bootstrap,
  bootstrapHistory,
  fixtures,
  fixturesHistory,
  last5,
  picksData
}: {
  // elements: Element[],
  fixtures: Fixture[],
  fixturesHistory: Fixture[],
  last5?: LiveEvent[],
  bootstrap: Bootstrap,
  bootstrapHistory: Bootstrap,
  picksData: PickData

}) {
  bootstrap.elements.sort((a: Element, b: Element) => a.element_type - b.element_type);
  const elements1 = bootstrap.elements.filter((el: Element) =>
    picksData.picks.map((a: PlayerPicked) => a.element).includes(el.id)
  );

  elements1.sort((a: Element, b: Element) => {
    return (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0);
  });

  // const playerConstraints = Object.fromEntries(mandatoryPlayer.map(p => [p, {"equal": 1}]))
  const teamConstaints = Object.fromEntries(
    elements1.map((e: Element) => [`team_${e.team_code}`, { max: 3 }]),
  );

  // only integers
  const fplInts = Object.fromEntries(
    elements1.map((e: Element) => [`player_${e.id}`, 1]),
  );

  //#region pick optimization
  // variables
  const newBootstrap = {
    ...bootstrap,
    elements: elements1
  }
  const fplVariables2 = createVariables({
    bootstrap: newBootstrap,
    bootstrapHistory,
    fixtures,
    fixturesHistory,
    last5
  });

  // constraints
  const maxPick2 = Object.fromEntries(
    elements1.map((e: Element) => [`player_${e.id}`, { max: 1, min: 0 }]),
  );
  const posConstraints2 = {
    gkp: { min: 1, max: 1 },
    def: { min: 3, max: 5 },
    mid: { min: 2, max: 5 },
    fwd: { min: 1, max: 3 },
  };
  // const playerConstraints2 = Object.fromEntries(mandatoryPlayer.map(p => [p, {"min": 0, "max": 1}]))

  // pick optimization model
  return {
    direction: "maximize" as const,
    objective: "xp_o5",
    constraints: {
      ...maxPick2,
      ...posConstraints2,
      ...teamConstaints,
      max_pick: { equal: 11 },
    },
    variables: {
      ...fplVariables2,
      // ...fplCaptaincyVariables2
    },
    integers: [...Object.keys(fplInts)],
  };
};

export function optimizationModel({
  direction,
  objective,
  bootstrap,
  bootstrapHistory,
  fixtures,
  fixturesHistory,
  last5,
  picksData
}: {
  direction: 'maximize' | 'minimize',
  objective: keyof Element,
  // elements: Element[],
  fixtures: Fixture[],
  fixturesHistory: Fixture[],
  last5?: LiveEvent[],
  bootstrap: Bootstrap,
  bootstrapHistory: Bootstrap,
  picksData: PickData

}) {
  bootstrap.elements.sort((a: Element, b: Element) => a.element_type - b.element_type);
  const elements1 = bootstrap.elements.filter((el: Element) =>
    picksData.picks.map((a: PlayerPicked) => a.element).includes(el.id)
  );

  elements1.sort((a: Element, b: Element) => {
    return (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0);
  });

  // const playerConstraints = Object.fromEntries(mandatoryPlayer.map(p => [p, {"equal": 1}]))
  const teamConstaints = Object.fromEntries(
    elements1.map((e: Element) => [`team_${e.team_code}`, { max: 3 }]),
  );

  // only integers
  const fplInts = Object.fromEntries(
    elements1.map((e: Element) => [`player_${e.id}`, 1]),
  );

  //#region pick optimization
  // variables
  const newBootstrap = {
    ...bootstrap,
    elements: elements1
  }
  const fplVariables2 = createVariables({
    bootstrap: newBootstrap,
    bootstrapHistory,
    fixtures,
    fixturesHistory,
    last5
  });

  // constraints
  const maxPick2 = Object.fromEntries(
    elements1.map((e: Element) => [`player_${e.id}`, { max: 1, min: 0 }]),
  );
  const posConstraints2 = {
    gkp: { min: 1, max: 1 },
    def: { min: 3, max: 5 },
    mid: { min: 2, max: 5 },
    fwd: { min: 1, max: 3 },
  };
  // const playerConstraints2 = Object.fromEntries(mandatoryPlayer.map(p => [p, {"min": 0, "max": 1}]))

  // pick optimization model
  return {
    direction,
    objective,
    constraints: {
      ...maxPick2,
      ...posConstraints2,
      ...teamConstaints,
      max_pick: { equal: 11 },
    },
    variables: {
      ...fplVariables2,
      // ...fplCaptaincyVariables2
    },
    integers: [...Object.keys(fplInts)],
  };
};

/**
 * create variable models
 * @param {string} suffix
 * @param {function} filterCat
 * @param {Array} addEntries
 * @returns
 */
const createVariables = ({
  bootstrap,
  bootstrapHistory,
  // elements,
  fixtures,
  fixturesHistory,
  // teams,
  // inputGw,
  last5,
}: {
  // elements: Element[],
  fixtures: Fixture[],
  fixturesHistory: Fixture[],
  // teams: Team[],
  // inputGw?: number,
  last5?: LiveEvent[],
  bootstrap: Bootstrap,
  bootstrapHistory: Bootstrap,

}) =>
  Object.fromEntries(
    bootstrap.elements
      .map((e: Element) => {
        const picksData = {
          picks: [
            {
              element: e.id,
              multiplier: 1,
            },
          ],
        };

        const elementHist = bootstrapHistory.elements.find((eh: Element) => e.code == eh.code)

        const foundCurrentEvent = bootstrap.events.find((ev: Event) => ev.is_current);
        const xpDatas = [1, 2, 3].map((n: number) => [
          `xp_next_${n}`, getExpectedPoints({
            element: e, currentGameWeek:
              foundCurrentEvent ? foundCurrentEvent.id : 0,
            deltaEvent: n,
            fixtures,
            teams: bootstrap.teams,
            last5: last5 ?? [],
            elementHistory: elementHist,
            fixturesHistory: fixturesHistory,
            game_config: bootstrap.game_config
          })]);

        const sigmaXpDatas = [1, 2, 3].map((n: number) => getExpectedPoints({
          element: e, currentGameWeek:
            foundCurrentEvent ? foundCurrentEvent.id : 0,
          deltaEvent: n,
          fixtures,
          teams: bootstrap.teams,
          last5: last5 ?? [],
          elementHistory: elementHist,
          fixturesHistory: fixturesHistory,
          game_config: bootstrap.game_config
        }));
        const sigmaXpSum = sigmaXpDatas.reduce((sum, val) => sum + val, 0);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const entries = Object.fromEntries([
          [`player_${e.id}`, 1],
          ["fwd", e.element_type == 4 ? 1 : 0],
          ["mid", e.element_type == 3 ? 1 : 0],
          ["def", e.element_type == 2 ? 1 : 0],
          ["gkp", e.element_type == 1 ? 1 : 0],
          ...xpDatas,
          [
            "xp_sigm_3",
            sigmaXpSum
          ],
          [
            "surplus_point",
            typeof e.event_points === "number" && typeof xpDatas[0]?.[1] === "number"
              ? e.event_points - (xpDatas[0][1])
              : 0,
          ],

          [`team_${e.team_code}`, 1],
          [`is_playing_next`, e.chance_of_playing_next_round || 0],
        ]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          ...e,
          max_pick: 1,
          ...entries,
        };
      })
      .map((e: Element & Record<string, unknown>): [string, Record<string, number>] => {
        // Only include numeric coefficients for the solver
        const allowedKeys = [
          `player_${e.id}`,
          "fwd",
          "mid",
          "def",
          "gkp",
          "xp_next_1",
          "xp_next_2",
          "xp_next_3",
          "xp_sigm_3",
          "surplus_point",
          `team_${e.team_code}`,
          `is_playing_next`,
          "max_pick",
          "now_cost"
        ];
        const coeffs: Record<string, number> = {};
        for (const key of allowedKeys) {
          if (typeof (e as Record<string, unknown>)[key] === "number") {
            coeffs[key] = (e as Record<string, unknown>)[key] as number;
          }
        }
        return [`player_${e.id}`, coeffs];
      }),
  );

export function optimizationProcess({
  bootstrap,
  bootstrapHistory,
  fixtures,
  fixturesHistory,
  last5,
  picksData,
  modelName
}: {
  bootstrap: Bootstrap,
  bootstrapHistory: Bootstrap,
  fixtures: Fixture[],
  fixturesHistory: Fixture[],
  last5?: LiveEvent[],
  picksData?: PickData,
  modelName?: 'wildcard' | 'pick' | 'overqualified'
}) {
  const isWildcard = !picksData;
  try {
    const currentEvent = bootstrap.events.find((event: Event) => event.is_current);

    const newBootstrap = {
      ...bootstrap,
      elements: bootstrap.elements.map((el: Element) => {
        const foundElementHistory = bootstrapHistory.elements.find((elh: Element) => elh.code === el.code)

        const xpRef = {
          fixtures,
          game_config: bootstrap.game_config,
          teams: bootstrap.teams,
          fixturesHistory: fixtures,
          element: el,
          currentGameWeek: currentEvent ? currentEvent.id : 0,
          elementHistory: foundElementHistory!
        }

        const xp = getExpectedPoints({ ...xpRef, deltaEvent: 1, });
        const xp_current = getExpectedPoints({ ...xpRef, deltaEvent: 0, });
        const xp_o5 = getExpectedPoints({ ...xpRef, deltaEvent: 1, last5 })


        const xp_o5_current = getExpectedPoints({ ...xpRef, deltaEvent: 0, last5 })
        return {
          ...el,
          xp,
          xp_current,
          xp_o5,
          xp_o5_current,
          delta_xp: el.event_points - xp_current,
          delta_xp_05: el.event_points - xp_o5_current
        }
      })
    };

    const reference = {
      bootstrap: newBootstrap,
      bootstrapHistory,
      fixtures,
      fixturesHistory,
      last5,
    }

    let picksData1: PickData;
    if (isWildcard) {
      picksData1 = {
        active_chip: null,
        automatic_subs: [],
        entry_history: {
          percentile_rank: 1,
          event: currentEvent ? currentEvent.id : 0,
          points: 0,
          total_points: 0,
          rank: 0,
          rank_sort: 0,
          overall_rank: 0,
          bank: 0,
          value: 0,
          event_transfers: 0,
          event_transfers_cost: 0,
          points_on_bench: 0,
        },
        picks: reference.bootstrap.elements.map((el: Element) => {
          return {
            element: el.id,
            position: 1,
            multiplier: 1,
            is_captain: false,
            is_vice_captain: false,
            element_type: el.element_type,

            xp: el.xp,
            xp_current: el.xp_current,
            xp_o5: el.xp_o5,
            xp_o5_current: el.xp_o5_current,
            delta_xp_05: el.event_points - (el.xp_o5_current ?? 0),
            delta_xp: el.event_points - (el.xp ?? 0)
          };
        }),
      };

    } else {
      picksData1 = {
        ...picksData,
        picks: picksData.picks.map((pick: PlayerPicked) => {
          const foundElement = reference.bootstrap.elements.find((el: Element) => el.id === pick.element);
          return {
            ...pick,
            xp: foundElement?.xp,
            xp_o5: foundElement?.xp_o5,
            xp_current: foundElement?.xp_current,
            xp_o5_current: foundElement?.xp_o5_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - (foundElement?.xp_o5_current ?? 0),
            delta_xp: (foundElement?.event_points ?? 0) - (foundElement?.xp ?? 0)
          }
        })
      };
    }

    const pickOpt = picksOptimizationModel({ ...reference, picksData: picksData1 ?? undefined })
    const wildcardOpt = wildcardOptimizationModel({ ...reference, objective: 'delta_xp_05' });

    const model: typeof pickOpt | typeof wildcardOpt = !isWildcard ? pickOpt : wildcardOpt;

    const solution: Solution<string> = solve(model);


    const max = Math.max(...solution.variables.map(([, value]: [string, number]) => value))
    const choosenCapt = solution.variables.find(([, value]: [string, number]) => value === max)
    const choosenCaptIndex = solution.variables.findIndex(([, value]: [string, number]) => value === max)
    const benched = [];
    if (!isWildcard && solution.variables.length === 11) {
      const benchPicks: PlayerPicked[] = picksData1.picks
        .filter((pick: PlayerPicked) => !solution.variables.map(
          (v: [string, number]) => Number(v[0].replace('player_', ''))
        ).includes(pick.element))
        .map((pick: PlayerPicked, i: number) => {
          return {
            ...pick,
            position: i + 12
          }
        })
      benched.push(...benchPicks)
    }
    // Build PickData from solution
    const fakePicks: PickData = {
      active_chip: null,
      automatic_subs: [],
      entry_history: {
        percentile_rank: 1,
        event: currentEvent ? currentEvent.id : 0,
        points: 0,
        total_points: 0,
        rank: 0,
        rank_sort: 0,
        overall_rank: 0,
        bank: 0,
        value: 0,
        event_transfers: 0,
        event_transfers_cost: 0,
        points_on_bench: 0,
      },
      picks: [
        ...solution.variables.map(([identifier, value]: [string, number], index: number) => {
          const element = Number(identifier.split('_')[1]);
          const captainElement = choosenCapt ? Number(choosenCapt[0].split('_')[1]) : null;
          let multiplier = 1;
          const foundElement = bootstrap.elements.find((el: Element) => el.id === element);
          if (element === captainElement) {
            multiplier = 2;
          }
          
          if (index > 10) {
            multiplier = 0;
          }


          return {
            element_type: foundElement ? foundElement.element_type : 1,
            element,
            web_name: foundElement ? foundElement.web_name : 'Player',
            multiplier,
            is_captain: index === choosenCaptIndex,
            is_vice_captain: false,
            position: index + 1,

            xp: foundElement?.xp,
            xp_o5: foundElement?.xp_o5,
            xp_current: foundElement?.xp_current,
            xp_o5_current: foundElement?.xp_o5_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - (foundElement?.xp_o5_current ?? 0),
            delta_xp: (foundElement?.event_points ?? 0) - (foundElement?.xp ?? 0)
          } as PlayerPicked;
        }),
        ...benched
      ]
    };

    return fakePicks;
  } catch (error) {
    console.log('error', error);
    // willReplace += 1;
    // console.log(`replace + 1 = ${willReplace}`)
  }

  return {
    active_chip: null,
    automatic_subs: [],
    entry_history: {
      percentile_rank: 1,
      event: 1,
      points: 0,
      total_points: 0,
      rank: 0,
      rank_sort: 0,
      overall_rank: 0,
      bank: 0,
      value: 0,
      event_transfers: 0,
      event_transfers_cost: 0,
      points_on_bench: 0,
    },
    picks: []
  } as PickData
}

