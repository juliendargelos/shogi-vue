<template>
  <div class="game">
    <board
      v-if="game"
      class="game__board"
      :board="game.board"
      :player="game.currentPlayer"
      @move="game.turn"
    />
  </div>
</template>

<script>
  import Shogi from '../shogi'
  import Board from './Board.vue'

  export default {
    data() {
      return {
        game: new Shogi.Game(
          new Shogi.Player('Player 1'),
          new Shogi.Player('Player 2')
        ).start()
      }
    },

    components: { board: Board }
  }
</script>

<style lang="sass">
  .game
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center

    &__board
      width: calc(100vw - 30px)
      height: calc(100vh - 30px)
      flex:
        grow: 0
        shrink: 0

      @media screen and (orientation: landscape)
        width: calc(100vh - 30px)

      @media screen and (orientation: portrait)
        height: calc(100vw - 30px)
</style>
