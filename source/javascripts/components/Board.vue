<template>
  <div
    class="board"
    :class="{
      'board--moving': movingPiece
    }"
    :style="{
      '--width': board.width,
      '--height': board.height
    }"
  >
    <template v-for="cell in board.cells">
      <cell
        class="board__cell"
        :class="{
          'board__cell--highlighted': movementCell(cell)
        }"
        :cell="cell"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        :droppable="movingPiece && movementCell(cell)"
        @drop.native="move(cell)"
      />
      <piece
        v-if="cell.piece"
        class="board__piece"
        :draggable="cell.piece.owner === player"
        :piece="cell.piece"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        @dragstart.native="moving(cell.piece)"
        @dragend.native="cancelMoving"
        @mouseover.native="showMovements(cell.piece)"
        @mouseout.native="hideMovements"
      />
    </template>
  </div>
</template>

<script>
  import Shogi from '../shogi'
  import Piece from './Piece.vue'
  import Cell from './Cell.vue'

  export default {
    props: ['board', 'player'],

    data() {
      return {
        movingPiece: null,
        movementCells: []
      }
    },

    mounted() {
      window.addEventListener('click', () => {
        this.movingPiece = null
      })
    },

    methods: {
      showMovements(piece) {
        if(!this.movingPiece && piece.owner === this.player) {
          this.movementCells = this.board.movements(piece)
        }
      },

      hideMovements() {
        if(!this.movingPiece) this.movementCells = []
      },

      movementCell(cell) {
        return this.movementCells.includes(cell)
      },

      move(cell) {
        if(!this.movingPiece) return
        this.board.move(this.movingPiece, cell)
        this.cancelMovement()
        this.$emit('move')
      },

      moving(piece) {
        if(this.movingPiece) return
        this.showMovements(piece)
        this.movingPiece = piece
      },

      cancelMoving() {
        this.movingPiece = null
        this.hideMovements()
      }
    },

    components: {
      piece: Piece,
      cell: Cell
    }
  }
</script>

<style lang="sass">
  .board
    border: 1px solid black
    box-sizing: border-box
    position: relative

    &__cell, &__piece
      width: calc(100% / var(--width))
      height: calc(100% / var(--height))
      top: calc(var(--y) * (100% / var(--height)))
      left: calc(var(--x) * (100% / var(--width)))
      position: absolute

    &__cell
      &--highlighted
        background-color: rgba(black, .2)

    &--moving &__piece
      pointer-events: none
</style>
