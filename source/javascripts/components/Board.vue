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
          'board__cell--highlighted': highlighted(cell)
        }"
        :cell="cell"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        @click.stop.native="move(cell)"
      />
      <piece
        v-if="cell.piece"
        class="board__piece"
        :piece="cell.piece"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        @click.stop.native="moving(cell.piece)"
        @mouseover.native="highlight(board.movements(cell))"
        @mouseout.native="unhighlight"
      />
    </template>
  </div>
</template>

<script>
  import Shogi from '../shogi'
  import Piece from './Piece.vue'
  import Cell from './Cell.vue'

  export default {
    props: ['board'],

    data() {
      return {
        movingPiece: null,
        highlightedCells: []
      }
    },

    mounted() {
      window.addEventListener('click', () => {
        this.movingPiece = null
      })
    },

    methods: {
      highlight(cells) {
        if(!this.movingPiece) this.highlightedCells = cells
      },

      unhighlight() {
        if(!this.movingPiece) this.highlightedCells = []
      },

      highlighted(cell) {
        return this.highlightedCells.includes(cell)
      },

      move(cell) {
        if(!this.movingPiece) return
        this.board.move(this.movingPiece, cell)
        this.movingPiece = null;
        this.unhighlight()
      },

      moving(piece) {
        if(this.movingPiece) return
        this.movingPiece = piece
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
