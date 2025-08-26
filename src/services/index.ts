import type { Bootstrap } from "@/lib/bootstrap-type";
import type { Fixture } from "@/lib/fixture-type";
import type { LiveEvent } from "@/lib/live-event-type";
import { fromStorage } from "@/lib/storage";
import type { ManagerFromAPI } from "@/server/api/routers/manager";
import type { PickData } from "@/server/api/routers/squad-pick";

const API_URL = "https://fantasy-pl-vercel-proxy-rs.vercel.app";
// const API_URL = "http://localhost:3001"
const ARCHIVED_API_URL = "https://fpl-static-data.vercel.app";

export async function getBootstrap() {
  return fetch(`${API_URL}/bootstrap-static`).then((res) =>
    res.ok ? res.json() as Promise<Bootstrap> : null
  );
}

export function getBootstrapFromStorage() {
  // return getBootstrap()
  return fromStorage<Bootstrap>("boostrap-static", `${API_URL}/bootstrap-static`, 7);
}

export function getFixtures() {
  return fromStorage<Fixture[]>("fixtures", `${API_URL}/fixtures`, 30);
  //   return fetch(`${API_URL}/fixtures`).then((res) => res.json());
}

// export function getLeagueData(league: string, page: number, phase?: number) {
//   return fromStorage(
//     `league/${league}/${page || 1}`,
//     `${API_URL}/league/${league}/${page || 1}${phase ? "&phase=" + phase : ""}`,
//   );
//   // return fetch(`${API_URL}/league/${league}/${page || 1}`).then((res) =>
//   //   res.json()
//   // );
// }

export function getManagerData(id: number | string) {
  return fromStorage<ManagerFromAPI>(
    `manager/${id}`,
    `${API_URL}/manager/${id}`,
    30
  );
  // return fetch(`${API_URL}/league/${league}/${page || 1}`).then((res) =>
  //   res.json()
  // );
}

// export function getManagerTransferData(id: number | string) {
//   return fromStorage(
//     `manager/${id}/transfers`,
//     `${API_URL}/manager/${id}/transfers`,
//     30
//   );
// }

export function getPicksData(managerId: number | string, gameweek: number) {
  return fromStorage<PickData>(
    `picks/${managerId}/${gameweek}`,
    `${API_URL}/picks/${managerId}/${gameweek}`,
    30,
  );
  // return fetch(`${API_URL}/league/${league}/${page || 1}`).then((res) =>
  //   res.json()
  // );
}

export function getLiveEventData(event: number, holdTime?: number) {
  return fromStorage<LiveEvent>(
    `live-event/${event}`,
    `${API_URL}/live-event/${event}`,
    holdTime
  );
  // return fetch(`${API_URL}/league/${league}/${page || 1}`).then((res) =>
  //   res.json()
  // );
}

export function getArchivedBootstrap(season: string) {
  return fetch(`${ARCHIVED_API_URL}/${season}/bootstrap-static.json`).then(
    (res) => res.json() as Promise<Bootstrap>,
  );
}

// export function getArchivedLeague(
//   season: string,
//   league: string,
//   page?: number,
// ) {
//   return fetch(
//     `${ARCHIVED_API_URL}/${season}/leagues-classic/fplmgm/${league}/${
//       page || 1
//     }.json`,
//   ).then((res) => res.json());
// }

export function getArchivedLiveEventData(season: string, event: number) {
  return fetch(`${ARCHIVED_API_URL}/${season}/live-event/${event}.json`).then(
    (res) => res.json() as Promise<LiveEvent>,
  );
}
