import type { LolDataObject } from "./LolDataObject";

export interface TieredLolDataObjects {
    grandmaster: LolDataObject[],
    master: LolDataObject[],
    diamond: LolDataObject[],
    platinum: LolDataObject[],
    gold: LolDataObject[],
    silver: LolDataObject[],
    bronze: LolDataObject[],
    iron: LolDataObject[],
}