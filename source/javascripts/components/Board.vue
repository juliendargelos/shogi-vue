<template>
  <div class="board">
    <table class="board__cells">
      <tbody>
        <tr v-for="y in board.height">
          <template v-for="x in board.width">
            <td
              v-for="cell in [board.cell(x - 1, y - 1)]"
              class="board__cell"
              :class="{
                'board__cell--movement': movementCell(cell),
                'board__cell--destination': destinationCell === cell,
              }"
              :ref="`c${cell.x},${cell.y}`"
            >
              <piece
                v-if="cell.piece"
                class="board__piece"
                :class="{
                  'board__piece--dragging': movingPiece === cell.piece,
                  'board__piece--movable': cell.piece.owner === player
                }"
                :piece="cell.piece"
                @mousedown.native.prevent.stop="moving(cell.piece, $event)"
                @mouseover.native="showMovements(cell.piece)"
                @mouseout.native="hideMovements()"
              />
            </td>
          </template>
        </tr>
      </tbody>
    </table>

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
        movingPiecePositionCallback: event => {
          this.updateMovingPiecePosition(event)
          var destinationCell = this.movementCells.find(cell => {
            var bounds = this.$refs[`c${cell.x},${cell.y}`][0].getBoundingClientRect()

            if(event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
              this.showDestination(cell)

              return true
            }
          })

          if(!destinationCell) this.hideDestination()
        },
        movingPieceMoveCallback: event => this.destinationCell ? this.move() : this.stopMoving(),
        stoppedMoving: false
      }
    },

    computed: {
      destinationCellElement() {
        return this.destinationCell ? this.$refs[`c${this.destinationCell.x},${this.destinationCell.y}`][0] : null
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

      showDestination(cell) {
        if(this.movingPiece && this.movementCell(cell)) {
          this.destinationCell = cell
        }
      },

      hideDestination() {
        this.destinationCell = null
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
    box-sizing: border-box
    position: relative
    display: flex
    flex-direction: column

    &__cells
      width: 100%
      height: 82%
      border-spacing: 4px
      flex-grow: 0
      flex-shrink: 0
      position: relative

    &__cell
      background-color: rgba(black, .05)
      box-sizing: border-box
      border-radius: 4px
      position: relative

      &::before
        content: ''
        width: 100%
        height: 100%
        top: 0
        left: 0
        border: 3px solid black
          radius: 4px
        box-sizing: border-box
        opacity: 0
        display: block
        position: absolute

      &--movement::before
        opacity: .2
        transition: .15s

      &--destination::before
        opacity: .4
        border:
          width: 6px

    &__piece
      width: 100%
      height: 100%
      z-index: 2
      pointer-events: none
      position: relative

      &--movable, &--captured
        pointer-events: auto

      &--captured
        height: 100%
        flex-grow: 0
        flex-shrink: 1

      &--moving
        top: 0
        left: 0
        position: fixed

      &--dragging
        opacity: 0

      &--transition
        transition: .2s

    &__captured-pieces
      width: 100%
      height: 9%
      padding: 5px
      box-sizing: border-box
      flex-grow: 0
      flex-shrink: 0
      display: flex
      align-items: center
      justify-content: center

      &:first-of-type
        order: -1

      &:last-of-type
        order: 1
</style>
