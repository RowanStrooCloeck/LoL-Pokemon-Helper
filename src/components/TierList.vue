<template>
    <div>
        <!-- icon -->
        <img :src="tierIcon" alt="tier-icon">

        <!-- tier value -->
        <span>{{ description }}</span>

        <!-- amount -->
        <span>{{ amount }} / 150</span>

    </div>
    <div v-for="champ in data">
        <ChampionItem :champion="champ"/>
    </div>
</template>


<script lang="ts">
import type { LolDataObject } from "@/assets/LolDataObject";
import {Vue, Options, prop} from "vue-class-component";
import ChampionItem from "./ChampionItem.vue";

class Props {
    tierIcon: string = prop({
        required: true,
    })
    data: LolDataObject[] = prop({
        required: true,
    })
    description: string = prop({
        required: true,
    })
    amount: number = prop({
        required: true,
    })
}

@Options({
  components: {
    ChampionItem
  }
})

export default class TierList extends Vue.with(Props) {
    
}
</script>


<style scoped>

</style>