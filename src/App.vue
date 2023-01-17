<template>
  <input placeholder="Summoner Name" v-model="summonerName" @change="getData" />

  <div v-if="isLoading">
    <span class="loader"></span>
  </div>

  <div v-else>
    Not loading
  </div>

  <div>
    <VueMultiselect v-model="multiValue" :options="all" :multiple="true" :close-on-select="false"
      placeholder="Pick some" label="name" track-by="name" />
  </div>

  <div v-if="multiValue.length > 0">
    <div v-for="champion in multiValue">
      {{ champion.name }} | {{ champion.masteryPoints }}
    </div>
  </div>

  <!-- 100k and above -->
  <TierList :tierIcon="getTierIconUrl('NotFound')" :data="tieredData.grandmaster" 
    description="100k and above" :amount="tieredData.grandmaster.length" />

  <!-- 99.999 to 50.000 -->
  <TierList :tierIcon="getTierIconUrl('Master')" :data="tieredData.master"
    description="100k to 50k" :amount="masterAmount" />

  <!-- 49.999 to 10.000 -->
  <TierList :tierIcon="getTierIconUrl('Diamond')" :data="tieredData.diamond"
    description="50k to 10k" :amount="diamondAmount" />

  <!-- 9.999 to 5.000 -->
  <TierList :tierIcon="getTierIconUrl('Platinum')" :data="tieredData.platinum"
    description="10k to 5k" :amount="platinumAmount" />

  <!-- 4.999 to 1.000 -->
  <TierList :tierIcon="getTierIconUrl('Gold')" :data="tieredData.gold"
    description="5k to 1k" :amount="goldAmount" />

  <!-- 999 to 500 -->
  <TierList :tierIcon="getTierIconUrl('Silver')" :data="tieredData.silver"
    description="1k to 500" :amount="silverAmount" />

  <!-- 499 to 100 -->
  <TierList :tierIcon="getTierIconUrl('Bronze')" :data="tieredData.bronze"
    description="500 to 100" :amount="bronzeAmount" />

  <!-- 99 and below -->
  <TierList :tierIcon="getTierIconUrl('Iron')" :data="tieredData.iron"
    description="Below 100" :amount="ironAmount" />

</template>

<script lang="ts">

import axios from "axios";
import { Vue, Options } from "vue-class-component";
import VueMultiselect from "vue-multiselect";
import type { LolDataObject } from "./assets/LolDataObject";
import type { TieredLolDataObjects } from "./assets/TieredLolDataObjects";
import { TierIconUrl } from "./assets/TierIconUrl";
import TierList from "./components/TierList.vue";

@Options({
  components: {
    TierList,
    VueMultiselect
  }
})

export default class App extends Vue {
  private baseUrl: string = 'http://localhost:3000';
  public summonerName: string = '';
  public isLoading: boolean = false;
  public multiValue: LolDataObject[] = [];

  public all: LolDataObject[] = [];
  public amount: number = 150;
  public tieredData: TieredLolDataObjects = {
    grandmaster: [],
    master: [],
    diamond: [],
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
    iron: []
};

  mounted() {
    this.summonerName = "shimomeikato";
    this.getData();
  }

  public async getData() {
    this.isLoading = true;
    this.resetData();
    await axios.get(`${this.baseUrl}/champion-mastery/euw1/${this.summonerName}`).then(res => {
      if (res) {
        this.isLoading = false;
        // show data on screen
        this.all = res.data.slice();
        res.data.sort((a: { masteryPoints: number; }, b: { masteryPoints: number; }) => (a.masteryPoints > b.masteryPoints ? -1 : 1));
        this.setTierData(res.data);
      }
    }).catch(err => {
      this.isLoading = false;
      // show error on screen
    });
  }

  public clearSearch() {
    this.multiValue = [];
  }

  public getTierIconUrl(tier: string) {
    return (<any>TierIconUrl)[tier];
  }

  public setTierData(data: LolDataObject[]) {
    data.forEach(champ => {
      if (champ.masteryPoints >= 100000) {
        this.tieredData.grandmaster.push(champ);
      } else if (champ.masteryPoints >= 50000) {
        this.tieredData.master.push(champ);
      } else if (champ.masteryPoints >= 10000) {
        this.tieredData.diamond.push(champ);
      } else if (champ.masteryPoints >= 5000) {
        this.tieredData.platinum.push(champ);
      } else if (champ.masteryPoints >= 1000) {
        this.tieredData.gold.push(champ);
      } else if (champ.masteryPoints >= 500) {
        this.tieredData.silver.push(champ);
      } else if (champ.masteryPoints >= 100) {
        this.tieredData.bronze.push(champ);
      } else {
        this.tieredData.iron.push(champ);
      }
    });
  }

  public resetData() {
      this.tieredData = {
      grandmaster: [],
      master: [],
      diamond: [],
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
      iron: []
    };
  }

  public get masterAmount(): number {
    return this.tieredData.grandmaster.length + this.tieredData.master.length;
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

}
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
