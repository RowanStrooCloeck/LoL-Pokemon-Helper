<template>
    <div class="champion-detail" :id="champion.key">
        <img :src="`${imageUrl}/${champion.key}.png`" :alt="champion.key" class="img-small"/>
        <span class="item-detail">{{ champion.name }}</span>
        <span class="item-detail">{{ getLocaleNumberString(champion.masteryPoints) }}</span>
        <img :src="getMasteryIcon(champion.masteryLevel)" alt="mastery" class="img-small" />
    </div>
    
</template>


<script lang="ts">
import type { LolDataObject } from "@/assets/objects/LolDataObject";
import {Vue, Options, prop} from "vue-class-component";
import {MasteryTierIconUrl} from "@/assets/objects/MasteryTierIconUrl";

class Props {
    champion: LolDataObject = prop({
        required: true
    })
}

@Options({})

export default class ChampionItem extends Vue.with(Props) {
    public imageUrl: string = import.meta.env.VITE_IMAGE_URL;

    public getMasteryIcon(level: number) {
        return (<any>MasteryTierIconUrl)[level];
    }

    public getLocaleNumberString(value: number) {
    if (value) {
      // @ts-ignore
      return value.toLocaleString(this.locale);
    }
    return 0;
  }
    
}
</script>


<style scoped>
.champion-detail {
    display: flex;
    justify-content: space-evenly;
}

.img-small {
    height: 4rem;
}

.item-detail {
    width: 8rem;
    text-align: center;
    margin: auto 0;
}
</style>