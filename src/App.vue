<template>
  <div class="header">
    <Multiselect v-model="selectedRegion" placeholder="Region" :options="regions" :multiple="false"
      :close-on-select="true" select-label="" deselect-label="" selected-label="" :allow-empty="false" label="abbr"
      track-by="code" @select="getData" class="region-selector">
    </Multiselect>

    <q-input class="summoner-input" placeholder="Summoner Name" v-model="summonerName" @change="getData" :dark="darkMode"
      filled />

    <div class="progress" @click="scrollToCurrentTier(progressTier)">
      <img :src="getTierIconUrl(progressTier)" alt="progress-icon" class="progress-icon">
      <div class="challenge-explanation">
        <h6>{{ challengeTitle }}</h6>
        <p>{{ challengeDescription }}</p>
        <p>{{ progressAmount }} / 150</p>
      </div>
    </div>
  </div>
  <div v-if="isLoading">
    <span class="loader"></span>
  </div>
  <div class="random-searcher" v-if="!isLoading">
    <h3>All Random Searcher</h3>
    <Multiselect v-model="multiValue" :options="all" :multiple="true" :close-on-select="false" placeholder="Pick some"
      label="name" track-by="name">
      <template v-slot:clear>
        <div class="multiselect__clear" v-if="multiValue.length" @mousedown.prevent.stop="clearAll()">❌</div>
      </template>
    </Multiselect>
  </div>

  <div class="aram-content" v-if="!isLoading">
    <template v-for="selection in multiValue">
      <div :id="selection.name" class="champion">
        <img :src="getLoadingIcon(selection.key)" :alt="selection.key" class="aram-icon" />
        <h5>{{ selection.name }}</h5>
        <div class="mastery-points">
          <p>Mastery Points</p>
          <p>{{ getLocaleNumberString(selection.masteryPoints) }}</p>
        </div>
        <div class="next-milestone">
          <p>Next Milestone</p>
          <p>{{ getNextMilestone(selection.masteryPoints) }}</p>
        </div>
      </div>
    </template>
  </div>

  <div v-if="!isLoading">
    <h3>Overall progress</h3>
    <!-- 115k+ -->
    <TierList :tierIcon="getTierIconUrl('Challenger')" :data="tieredData.challenger" id="challenger"
      :description="getLocaleNumberString(thresholds.CHALLENGER) + '+'" :amount="tieredData.challenger.length" />

    <!-- 107.5k - 115k -->
    <TierList :tierIcon="getTierIconUrl('GrandMaster')" :data="tieredData.grandmaster" id="grandmaster"
      :description="`${getLocaleNumberString(thresholds.GRANDMASTER)}+`" :amount="grandmasterAmount" />

    <!-- 100k - 107.5k -->
    <TierList :tierIcon="getTierIconUrl('Master')" :data="tieredData.master" id="Master"
      :description="`${getLocaleNumberString(thresholds.MASTER)}+`" :amount="masterAmount" />

    <!-- 50k - 100k -->
    <TierList :tierIcon="getTierIconUrl('Diamond')" :data="tieredData.diamond" id="Diamond"
      :description="`${getLocaleNumberString(thresholds.DIAMOND)}+`" :amount="diamondAmount" />

    <!-- 10k - 50k -->
    <TierList :tierIcon="getTierIconUrl('Platinum')" :data="tieredData.platinum" id="Platinum"
      :description="`${getLocaleNumberString(thresholds.PLATINUM)}+`" :amount="platinumAmount" />

    <!-- 5k - 10k -->
    <TierList :tierIcon="getTierIconUrl('Gold')" :data="tieredData.gold" id="Gold"
      :description="`${getLocaleNumberString(thresholds.GOLD)}+`" :amount="goldAmount" />

    <!-- 999 to 500 -->
    <TierList :tierIcon="getTierIconUrl('Silver')" :data="tieredData.silver" id="Silver"
      :description="`${getLocaleNumberString(thresholds.SILVER)}+`" :amount="silverAmount" />

    <!-- 499 to 100 -->
    <TierList :tierIcon="getTierIconUrl('Bronze')" :data="tieredData.bronze" id="Bronze"
      :description="`${getLocaleNumberString(thresholds.BRONZE)}+`" :amount="bronzeAmount" />

    <!-- 99 and below -->
    <TierList :tierIcon="getTierIconUrl('Iron')" :data="tieredData.iron" id="Iron"
      :description="`${getLocaleNumberString(thresholds.IRON)}+`" :amount="ironAmount" />

    <!-- 99 and below -->
    <TierList :data="tieredData.unranked" id="Unranked" />
  </div>

  <q-btn v-if="!atTopPosition" round color="purple" class="fixed-bottom-right" @click.native="scrollToTop"
    style="margin: 0 15px 15px 0">
    <q-icon name="keyboard_arrow_up" />
  </q-btn>

  <vue-cookie-accept-decline :debug="false" :disableDecline="true" :showPostponeButton="false" elementId="cookie"
    position="bottom-left" ref="cookie" transitionName="slideFromBottom" type="floating">
    <template #message>
      We use cookies to ensure you get the best experience on our website.
    </template></vue-cookie-accept-decline>
</template>

<script lang="ts">
import axios from "axios";
import { Vue, Options } from "vue-class-component";
import Multiselect from "vue-multiselect";
import type { LolDataObject } from "./assets/objects/LolDataObject";
import type { TieredLolDataObjects } from "./assets/objects/TieredLolDataObjects";
import { TierIconUrl } from "./assets/objects/TierIconUrl";
import TierList from "./components/TierList.vue";
import regionsJson from '@/assets/regions.json';

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
  public challengeTitle: string = '';
  public challengeDescription: string = '';
  public multiValue: LolDataObject[] = [];
  public selectedRegion = {};
  public regions = [{}];
  public atTopPosition = true;

  public all: LolDataObject[] = [];
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
    this.summonerName = this.$cookies.get("summonerName");
    this.regions = regionsJson;
    this.selectedRegion = this.$cookies.get("region") !== null ? this.$cookies.get("region") : this.regions[2];
    window.addEventListener('scroll', this.handleScroll);
    this.getData();
  }

  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  public async getData() {
    this.isLoading = true;
    this.resetData();

    await axios.get(`${this.baseUrl}/challenge`).then(res => {
      this.challengeTitle = res.data.name;
      this.challengeDescription = res.data.shortDescription;
      this.thresholds = res.data.thresholds;
    });

    if (this.summonerName !== null) {
      this.$cookies.set("summonerName", this.summonerName);
      this.$cookies.set("region", this.selectedRegion);
      // @ts-ignore
      await axios.get(`${this.baseUrl}/champion-mastery/${this.selectedRegion.code}/${this.summonerName}`).then(res => {
        if (res) {
          this.isLoading = false;
          this.all = res.data.slice();
          res.data.sort((a: { masteryPoints: number; }, b: { masteryPoints: number; }) => (a.masteryPoints > b.masteryPoints ? -1 : 1));
          this.setTierData(res.data);
          const highlight = res.data[149];
          this.$nextTick(() => {
            document.getElementById(highlight.key)!.style.boxShadow = '0 1px red';
            document.getElementById(highlight.key)!.style.paddingBottom = '5px';
          });
        }
      }).catch(err => {
        this.isLoading = false;
        // show error on screen
      });
    } else {
      this.isLoading = false;
    }
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

  public get darkMode() {
    const hasDarkPreference = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (hasDarkPreference) {
      return true;
    } else {
      return false;
    }
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

  public get progressAmount() {
    let total = 0;
    for (const key in this.tieredData) {
      if (Object.prototype.hasOwnProperty.call(this.tieredData, key)) {
        //@ts-ignore
        const amount = this.tieredData[key].length;
        if (total + amount >= 150) {
          return total;
        }
        total += amount;
      }
    }
    return 0;
  }

  public get progressTier() {
    let tier = '';
    let total = 0;
    for (const key in this.tieredData) {
      if (Object.prototype.hasOwnProperty.call(this.tieredData, key)) {
        //@ts-ignore
        const amount = this.tieredData[key].length;
        if (total + amount >= 150) {
          break;
        }
        total += amount;
        tier = key;

      }
    }
    tier = (tier === 'grandmaster') ? 'GrandMaster' : tier;
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  public scrollToCurrentTier(id: string) {
    window.scrollTo({
      top: document.getElementById(id)?.offsetTop,
      left: 0,
      behavior: "smooth",
    })
  }

  public scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }

  public handleScroll() {
    this.atTopPosition = window.scrollY === 0 ? true : false;
  }
}
</script>

<style scoped>
.header {
  line-height: 1.5;
  display: flex;
  height: 6rem;
}

.summoner-input,
.summoner-input input {
  margin: auto 0;
  height: 40px;
}

.region-selector {
  margin: auto 0;
  width: 6rem;
}

.progress {
  margin-left: auto;
  display: flex;
}

.progress:hover {
  cursor: pointer;
}


.progress-icon {
  max-height: 6rem;
  padding-right: 1rem;
}

.challenge-explanation {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}

.random-searcher {
  padding-top: 1rem;
}

.aram-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 1rem 0 5rem 0;
}

.champion {
  padding-right: 1rem;
}

.aram-icon {
  width: 100%;
}
</style>

<style></style>