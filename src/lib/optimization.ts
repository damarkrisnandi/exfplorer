import type { Element, GameConfig, PointPerPosition, Team } from "./bootstrap-type";
import type { Fixture, FixtureStat } from "./fixture-type";
import type { LiveEvent } from "./live-event-type";

const calculateBaseExpected = (element: Element, game_config: GameConfig, fixtures: Fixture[]) => {
  let xP = 0;
  const {
    element_type,
    bonus,
    expected_goals_per_90,
    expected_assists_per_90,
    starts_per_90,
    clean_sheets_per_90,
    own_goals,
    expected_goals_conceded_per_90,
    saves,
    minutes,
    bps,
    yellow_cards,
    red_cards,
    goals_scored,
    assists,
    starts,
  } = element;
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

  const xMin = (minutes / (90 * fixtures.length))
  xP *= (xMin > 0.5) ? 1 : xMin;
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

  if (last5) {
    xP = calculateBaseExpectedLastMatches(element, game_config, last5, filteredFixtures.filter((f: Fixture) => f.event >= currentGameWeek - last5.length));
  } else {
    xP = calculateBaseExpected(element, game_config, filteredFixtures);
  }


  let xPHistory = 0;
  if (elementHistory && fixturesHistory) {
    xPHistory = calculateBaseExpected(elementHistory, game_config, fixturesHistory);
  }

  if (elementHistory) {
    if (gameWeek == 0) {
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
        (stat.h.find((e: { element: number, value: number}) => e.element === element.id ) ??
        stat.a.find((e: { element: number, value: number}) => e.element === element.id ))
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
  return ranksBPS.reduce((a, b) => a + b, 0) / ranksBPS.length;
}
