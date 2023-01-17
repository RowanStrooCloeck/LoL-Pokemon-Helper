<template>
  <input placeholder="Summoner Name" v-model="summonerName" @change="getData"/>
  <div v-if="isLoading">
    <span class="loader"></span>
  </div>

  <div v-else-if="!isLoading">
    Not loading
  </div>
</template>

<script lang="ts">
import axios from "axios";
import {Vue, Options} from "vue-class-component";

@Options({
  components: {}
})

export default class App extends Vue {
  private baseUrl: string = 'http://localhost:3000';
  private imageUrl: string = 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading';
  private summonerName: string = '';
  private isLoading: boolean = false;

  private async getData() {
    this.isLoading = true;
    await axios.get(`${this.baseUrl}/champion-mastery/euw1/${this.summonerName}`).then(res => {
      if (res) {
        this.isLoading = false;
        console.log(res.data);
        // show data on screen
      }
    }).catch(err => {
      // show error on screen
    });
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
