<template>
  <div class="header">
    <input placeholder="Summoner Name" v-model="summonerName" @change="getData" />
    <div v-if="isLoading">
      <span class="loader"></span>
    </div>

    <div v-else-if="!isLoading">
      Not loading
    </div>
  </div>

  <div>
    <Multiselect v-model="multiValue" :options="all" :multiple="true" :close-on-select="false" placeholder="Pick some"
      label="name" track-by="name">
      <template v-slot:clear>
        <div class="multiselect__clear" v-if="multiValue.length" @mousedown.prevent.stop="clearAll()">❌</div>
      </template>
    </Multiselect>
  </div>

  <div class="aram-content">
    <template v-for="selection in multiValue">
      <div :id="selection.name" class="champion">
        <img :src="getLoadingIcon(selection.key)" :alt="selection.key" class="aram-icon" />
        <h2>{{ selection.name }}</h2>
        <div class="mastery-points">
          <h4>Mastery Points</h4>
          <p>{{ getLocaleNumberString(selection.masteryPoints) }}</p>
        </div>
        <div class="next-milestone">
          <h4>Next Milestone</h4>
          <p>{{ getNextMilestone(selection.masteryPoints) }}</p>
        </div>
      </div>
    </template>
  </div>

  <div>
    <h1>Overall progress</h1>
    <!-- 115k+ -->
    <TierList :tierIcon="getTierIconUrl('Challenger')" :data="tieredData.challenger"
      :description="getLocaleNumberString(thresholds.CHALLENGER) + '+'" :amount="tieredData.challenger.length" />

    <!-- 107.5k - 115k -->
    <TierList :tierIcon="getTierIconUrl('GrandMaster')" :data="tieredData.grandmaster"
      :description="`${getLocaleNumberString(thresholds.GRANDMASTER)}+`" :amount="tieredData.grandmaster.length" />

    <!-- 100k - 107.5k -->
    <TierList :tierIcon="getTierIconUrl('Master')" :data="tieredData.master"
      :description="`${getLocaleNumberString(thresholds.MASTER)}+`" :amount="masterAmount" />

    <!-- 50k - 100k -->
    <TierList :tierIcon="getTierIconUrl('Diamond')" :data="tieredData.diamond"
      :description="`${getLocaleNumberString(thresholds.DIAMOND)}+`" :amount="diamondAmount" />

    <!-- 10k - 50k -->
    <TierList :tierIcon="getTierIconUrl('Platinum')" :data="tieredData.platinum"
      :description="`${getLocaleNumberString(thresholds.PLATINUM)}+`" :amount="platinumAmount" />

    <!-- 5k - 10k -->
    <TierList :tierIcon="getTierIconUrl('Gold')" :data="tieredData.gold"
      :description="`${getLocaleNumberString(thresholds.GOLD)}+`" :amount="goldAmount" />

    <!-- 999 to 500 -->
    <TierList :tierIcon="getTierIconUrl('Silver')" :data="tieredData.silver"
      :description="`${getLocaleNumberString(thresholds.SILVER)}+`" :amount="silverAmount" />

    <!-- 499 to 100 -->
    <TierList :tierIcon="getTierIconUrl('Bronze')" :data="tieredData.bronze"
      :description="`${getLocaleNumberString(thresholds.BRONZE)}+`" :amount="bronzeAmount" />

    <!-- 99 and below -->
    <TierList :tierIcon="getTierIconUrl('Iron')" :data="tieredData.iron"
      :description="`${getLocaleNumberString(thresholds.IRON)}+`" :amount="ironAmount" />

    <!-- 99 and below -->
    <TierList :data="tieredData.unranked" />
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { Vue, Options } from "vue-class-component";
import Multiselect from "vue-multiselect";
import type { LolDataObject } from "./assets/LolDataObject";
import type { TieredLolDataObjects } from "./assets/TieredLolDataObjects";
import { TierIconUrl } from "./assets/TierIconUrl";
import TierList from "./components/TierList.vue";

@Options({
  components: {
    TierList,
    Multiselect,
  }
})

export default class App extends Vue {
  private baseUrl: string = import.meta.env.VITE_BASE_URL;
  private imageUrl: string = import.meta.env.VITE_IMAGE_URL;
  public summonerName: string = '';
  public isLoading: boolean = false;
  public multiValue: LolDataObject[] = [];

  public all: LolDataObject[] = [];
  public amount: number = 150;
  public thresholds: any = {};
  public tieredData: TieredLolDataObjects = {
    challenger: [],
    grandmaster: [],
    master: [],
    diamond: [],
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
    iron: [],
    unranked: [],
  };

  mounted() {
    this.summonerName = "shimomeikato";
    this.getData();
  }

  public async getData() {
    this.isLoading = true;
    this.resetData();

    await axios.get(`${this.baseUrl}/challenge`).then(res => {
      this.thresholds = res.data.thresholds;
    });

    await axios.get(`${this.baseUrl}/champion-mastery/euw1/${this.summonerName}`).then(res => {
      if (res) {
        this.isLoading = false;
        this.all = res.data.slice();
        res.data.sort((a: { masteryPoints: number; }, b: { masteryPoints: number; }) => (a.masteryPoints > b.masteryPoints ? -1 : 1));
        this.setTierData(res.data);
      }
    }).catch(err => {
      this.isLoading = false;
      // show error on screen
    });
  }

  public clearAll() {
    this.multiValue = [];
  }

  public getTierIconUrl(tier: string) {
    return (<any>TierIconUrl)[tier];
  }

  public getLoadingIcon(name: string) {
    return `${this.imageUrl}/${name}.png`
  }

  public getLocaleNumberString(value: number) {
    if (value) {
      // @ts-ignore
      return value.toLocaleString(this.locale);
    }
    return 0;
  }

  public get grandmasterAmount(): number {
    return this.tieredData.challenger.length + this.tieredData.grandmaster.length;
  }

  public get masterAmount(): number {
    return this.grandmasterAmount + this.tieredData.master.length;
  }

  public get diamondAmount(): number {
    return this.masterAmount + this.tieredData.diamond.length;
  }

  public get platinumAmount(): number {
    return this.diamondAmount + this.tieredData.platinum.length;
  }

  public get goldAmount(): number {
    return this.platinumAmount + this.tieredData.gold.length;
  }

  public get silverAmount(): number {
    return this.goldAmount + this.tieredData.silver.length;
  }

  public get bronzeAmount(): number {
    return this.silverAmount + this.tieredData.bronze.length;
  }

  public get ironAmount(): number {
    return this.bronzeAmount + this.tieredData.iron.length;
  }

  public get unrankedAmount(): number {
    return this.ironAmount + this.tieredData.unranked.length;
  }

  public resetData() {
    this.tieredData = {
      challenger: [],
      grandmaster: [],
      master: [],
      diamond: [],
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
      iron: [],
      unranked: [],
    };
  }

  public setTierData(data: LolDataObject[]) {

    data.forEach(champ => {
      if (champ.masteryPoints >= this.thresholds.CHALLENGER) {
        this.tieredData.challenger.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.GRANDMASTER) {
        this.tieredData.grandmaster.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.MASTER) {
        this.tieredData.master.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.DIAMOND) {
        this.tieredData.diamond.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.PLATINUM) {
        this.tieredData.platinum.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.GOLD) {
        this.tieredData.gold.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.SILVER) {
        this.tieredData.silver.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.BRONZE) {
        this.tieredData.bronze.push(champ);
      } else if (champ.masteryPoints >= this.thresholds.IRON) {
        this.tieredData.iron.push(champ);
      } else {
        this.tieredData.unranked.push(champ);
      }
    });
  }

  public getNextMilestone(value: number) {
    switch (true) {
      case (value < this.thresholds.IRON):
        return this.thresholds.IRON;
      case (value < this.thresholds.BRONZE):
        return this.thresholds.BRONZE;
      case (value < this.thresholds.SILVER):
        return this.getLocaleNumberString(this.thresholds.SILVER);
      case (value < this.thresholds.GOLD):
        return this.getLocaleNumberString(this.thresholds.GOLD);
      case (value < this.thresholds.PLATINUM):
        return this.getLocaleNumberString(this.thresholds.PLATINUM);
      case (value < this.thresholds.DIAMOND):
        return this.getLocaleNumberString(this.thresholds.DIAMOND);
      case (value < this.thresholds.MASTER):
        return this.getLocaleNumberString(this.thresholds.MASTER);
      case (value < this.thresholds.GRANDMASTER):
        return this.getLocaleNumberString(this.thresholds.GRANDMASTER);
      case (value < this.thresholds.CHALLENGER):
        return this.getLocaleNumberString(this.thresholds.CHALLENGER);
      default:
        return 0;
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}

.aram-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 1rem 0 5rem 0;
}

.aram-icon {
  padding-right: 1rem;
}
</style>