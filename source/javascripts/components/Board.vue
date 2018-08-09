<template>
  <div
    class="board"
    :style="{
      '--width': board.width,
      '--height': board.height
    }"
  >
    <template v-for="cell in board.cells">
      <cell
        class="board__cell"
        :class="{
          'board__cell--movement': movementCell(cell),
          'board__cell--destination': destinationCell === cell,
        }"
        :cell="cell"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        @mouseover.native="showDestination(cell, $event)"
        @mouseout.native="hideDestination(cell)"
      />
      <piece
        v-if="cell.piece"
        class="board__piece"
        :class="{
          'board__piece--dragging': movingPiece === cell.piece,
          'board__piece--movable': cell.piece.owner === player
        }"
        :piece="cell.piece"
        :style="{
          '--x': cell.x,
          '--y': cell.y
        }"
        @mousedown.native="moving(cell.piece, $event)"
        @mouseover.native="showMovements(cell.piece)"
        @mouseout.native="hideMovements()"
      />
    </template>

    <template v-for="p in board.players">
      <div :class="`board__captured-pieces board__captured-pieces--${p.typeName}`">
        <piece
          v-for="piece in board.piecesCapturedBy(p)"
          class="board__piece board__piece--captured"
          :class="{
            'board__piece--dragging': movingPiece === piece,
            'board__piece--movable': piece.owner === player
          }"
          :piece="piece"
          @mousedown.native="moving(piece, $event)"
          @mouseover.native="showMovements(piece)"
          @mouseout.native="hideMovements()"
        />
      </div>
    </template>

    <piece
      v-if="movingPiece"
      class="board__piece board__piece--movable board__piece--moving"
      :class="{
        'board__piece--transition': movingPieceTransition
      }"
      :piece="movingPiece"
      :style="{
        width: `${movingPieceWidth}px`,
        height: `${movingPieceHeight}px`,
        transform: `translate(${movingPiecePosition.x}px, ${movingPiecePosition.y}px)${movingPiece.owner.jeweledGeneral ? ' rotate(180deg)' : ''}`
      }"
    />
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
        movementCells: [],
        destinationCell: null,
        movingPiecePosition: {x: 0, y: 0},
        movingPiecePositionOffset: {x: 0, y: 0},
        movingPieceWidth: 0,
        movingPieceHeight: 0,
        movingPieceElement: null,
        movingPieceTransition: false,
        destinationCellElement: null,
        movingPiecePositionCallback: event => this.updateMovingPiecePosition(event),
        movingPieceMoveCallback: event => this.destinationCell ? this.move() : this.stopMoving(),
        stoppedMoving: false
      }
    },

    methods: {
      showMovements(piece) {
        if(!this.movingPiece && piece.owner === this.player) this.movementCells = this.board.movements(piece)
      },

      hideMovements() {
        if(!this.movingPiece) this.movementCells = []
      },

      movementCell(cell) {
        return this.movementCells.includes(cell)
      },

      showDestination(cell, event) {
        if(this.movingPiece && this.movementCell(cell)) {
          this.destinationCell = cell
          this.destinationCellElement = event.target
        }
      },

      hideDestination(cell) {
        if(this.destinationCell === cell) {
          this.destinationCell = null
          this.destinationCellElement = null
        }
      },

      move() {
        if(!this.movingPiece || !this.movementCell(this.destinationCell)) return
        this.board.move(this.movingPiece, this.destinationCell)
        this.stopMoving()
        this.$emit('move')
      },

      moving(piece, event) {
        if(this.movingPiece || piece.owner !== this.player) return
        var bounds = event.target.getBoundingClientRect()
        this.movingPieceWidth = bounds.width
        this.movingPieceHeight = bounds.height
        this.movingPieceElement = event.target
        this.movingPiecePositionOffset = {
          x: bounds.left - event.clientX,
          y: bounds.top - event.clientY
        }
        this.showMovements(piece)
        this.updateMovingPiecePosition(event)
        window.addEventListener('mousemove', this.movingPiecePositionCallback)
        window.addEventListener('mouseup', this.movingPieceMoveCallback)
        this.movingPiece = piece
      },

      stopMoving() {
        if(this.stoppedMoving) return
        this.stoppedMoving = true
        window.removeEventListener('mousemove', this.movingPiecePositionCallback)
        window.removeEventListener('mouseup', this.movingPieceMoveCallback)
        var bounds = (this.destinationCellElement || this.movingPieceElement).getBoundingClientRect()
        this.movingPiecePosition = {x: bounds.left, y: bounds.top}
        this.movingPieceWidth = bounds.width
        this.movingPieceHeigt = bounds.height
        this.movingPieceTransition = true
        this.destinationCell = null
        this.destinationCellElement = null
        this.movementCells = []

        setTimeout(() => {
          this.movingPiece = null
          this.movingPieceTransition = false
          this.stoppedMoving = false
        }, 201)
      },

      updateMovingPiecePosition(event) {
        this.movingPiecePosition = {
          x: this.movingPiecePositionOffset.x + event.clientX,
          y: this.movingPiecePositionOffset.y + event.clientY
        }
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
    $padding: 150px
    border: 1px solid black
    box-sizing: border-box
    position: relative

    &__cell, &__piece
      width: calc(100% / var(--width))
      height: calc((100% - #{$padding}) / var(--height))
      top: calc(#{$padding/2} + (var(--y) * ((100% - #{$padding}) / var(--height))))
      left: calc(var(--x) * (100% / var(--width)))
      position: absolute

    &__cell
      &--movement
        background-color: rgba(black, .2)

      &--destination
        background-color: rgba(red, .2)

    &__piece
      z-index: -1

      &--movable
        z-index: 10

      &--captured
        height: 100%
        flex-grow: 0
        flex-shrink: 1
        position: relative

      &--moving
        top: 0
        left: 0
        position: fixed
        pointer-events: none

      &--dragging
        opacity: 0

      &--transition
        transition: .2s

    &__captured-pieces
      width: 100%
      height: #{$padding/2}
      padding: 5px
      border: 1px solid black
      box-sizing: border-box
      position: absolute
      left: 0
      display: flex
      align-items: center
      justify-content: center

      &--jeweled-general
        top: 0

      &--king-general
        top: 100%
        transform: translateY(-100%)
</style>
