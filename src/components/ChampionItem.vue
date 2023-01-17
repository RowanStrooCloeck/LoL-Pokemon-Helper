<template>
    <span>{{ champion.name }} | {{ champion.masteryPoints }}</span>
</template>


<script lang="ts">
import type { LolDataObject } from "@/assets/LolDataObject";
import {Vue, Options, prop} from "vue-class-component";

class Props {
    champion: LolDataObject = prop({
        required: true
    })
}

@Options({})

export default class ChampionItem extends Vue.with(Props) {
    private imageUrl: string = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading';
    
}
</script>


<style scoped>

</style>