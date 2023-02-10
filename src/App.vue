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

  <div class="aram-content">
    <template v-for="selection in multiValue">
      <div :id="selection.name" class="champion">
        <img :src="getLoadingIcon(selection.name)" :alt="selection.name" />
        <h2>{{ selection.name }}</h2>
        <div class="mastery-points">
          <h4>Mastery Points</h4>
          <p>{{ selection.masteryPoints }}</p>
        </div>
        <div class="next-milestone">
          <h4>Next Milestone</h4>
          <p>{{ getNextMilestone(selection.masteryPoints) }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { Vue, Options } from "vue-class-component";

@Options({
  components: {}
})

export default class App extends Vue {
  private baseUrl: string = 'http://localhost:3000';
  private imageUrl: string = 'http://ddragon.leagueoflegends.com/cdn/13.3.1/img/champion';
  private summonerName: string = '';
  private isLoading: boolean = false;
  public multiValue = [{
    name: "Bard",
    masteryPoints: 67876
  }, {
    name: "Fizz",
    masteryPoints: 63876
  }, {
    name: "Irelia",
    masteryPoints: 4979
  }]

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

  public getLoadingIcon(name: string) {
    return `${this.imageUrl}/${name}.png`
  }

  public getNextMilestone(value: number) {
    switch (true) {
      case (value < 100):
        return 100;
      case (value < 500):
        return 500;
      case (value < 1000):
        return 1000;
      case (value < 5000):
        return 5000;
      case (value < 10000):
        return 10000;
      case (value < 50000):
        return 50000;
      case (value < 100000):
        return 100000;
      default:
        return 0;
    }
  }
}
</script>

<style scoped>
.aram-content {
  display: flex;
}

.champion {
  display: flex;
  flex-direction: column;
}
</style>
