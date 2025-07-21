import axios from "axios";
import type { Bootstrap } from "./bootstrap-type";
import { ARCHIVED_API_URL, currentSeason, previousSeason } from "./utils";
import type { Fixture } from "./fixture-type";
import type { LiveEvent } from "./live-event-type";
// bootstrap-static
export const bootstrapQuery = axios.get(BASE_API_URL + `/bootstrap-static`, {
     headers: {}
})
// export const bootstrapQuery = axios.get(ARCHIVED_API_URL + `/${currentSeason}/bootstrap-static.json`, {
 // headers: {}
// })
  .then((resp: { data: Bootstrap }) => resp.data)
  .catch((error) => {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  });

export const bootstrapHistoryQuery = axios.get(ARCHIVED_API_URL + `/${previousSeason}/bootstrap-static.json`, {
  headers: {}
})
  .then((resp: { data: Bootstrap }) => resp.data)
  .catch((error) => {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  });

export const fixturesQuery = axios.get(BASE_API_URL + `/fixtures`, {
  headers: {}
})
// export const fixturesQuery = axios.get(ARCHIVED_API_URL + `/${currentSeason}/fixtures.json`, {
//  headers: {}
// })
  .then((resp: { data: Fixture[] }) => resp.data)
  .catch((error) => {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  });

export const last5Queries = (currentEvent: number) => [1, 2, 3, 4, 5]
  .filter((n: number) => n <= currentEvent)
  .map((n: number) => {
    return axios.get(BASE_API_URL + `/live-event/${currentEvent - n - 1}`, {
      headers: {}
    })
    //return axios.get(ARCHIVED_API_URL + `/${currentSeason}/live-event/${currentEvent - n - 1}.json`, {
      //headers: {}
    //})
      .then((resp: { data: LiveEvent }) => resp.data)
      .catch((error) => {
        console.error("Error fetching liveEvent:", error);
        throw new Error("Failed to fetch liveEvent");
      });
  })


