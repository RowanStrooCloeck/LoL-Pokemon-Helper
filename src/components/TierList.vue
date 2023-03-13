<template>

    <div v-for="champ in data" class="list-item">
        <ChampionItem :champion="champ"/>
    </div>

    <div v-if="tierIcon" class="tier" :id="id">
        <!-- icon -->
        <img :src="tierIcon" alt="tier-icon" class="tier-icon">

        <!-- tier value -->
        <h5 class="tier-text">{{ description }}</h5>

        <!-- amount -->
        <h5 class="amount tier-text">{{ amount }} / 150</h5>
    </div>

</template>


<script lang="ts">
import type { LolDataObject } from "@/assets/objects/LolDataObject";
import {Vue, Options, prop} from "vue-class-component";
import ChampionItem from "./ChampionItem.vue";

class Props {
    id: string | undefined = prop({
        required: false,
    })
    tierIcon: string | undefined = prop({
        required: false,
    })
    data: LolDataObject[] = prop({
        required: true,
    })
    description: string | undefined = prop({
        required: false,
    })
    amount: number | undefined = prop({
        required: false,
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
.tier-text {
    margin: auto 0;
}

.amount {
    padding-right: 1rem;
}
.tier {
    
    display:flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

@media (prefers-color-scheme: dark) {
    .tier {
        background-color: #202020;
    }
}

@media (prefers-color-scheme: light) {
    .tier {
        background-color:aliceblue;
    }
}

.tier-icon {
    max-height: 6rem;
    padding-left: 1rem;
}

.list-item {
    padding-bottom: 0.5rem;
}
</style>