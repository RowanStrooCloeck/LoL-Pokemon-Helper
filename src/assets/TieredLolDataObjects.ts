import type { LolDataObject } from "./LolDataObject";

export interface TieredLolDataObjects {
    challenger: LolDataObject[],
    grandmaster: LolDataObject[],
    master: LolDataObject[],
    diamond: LolDataObject[],
    platinum: LolDataObject[],
    gold: LolDataObject[],
    silver: LolDataObject[],
    bronze: LolDataObject[],
    iron: LolDataObject[],
}