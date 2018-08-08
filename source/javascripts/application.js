import Vue from 'vue'
import Game from './components/Game.vue'

Vue.config.productionTip = false

new Vue({
  el: 'main',
  template: '<game/>',
  components: { game: Game }
})
