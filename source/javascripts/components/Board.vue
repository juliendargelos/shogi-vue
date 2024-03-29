<template>
  <div class="board">
    <table class="board__cells">
      <tbody>
        <tr v-for="y in board.height">
          <template v-for="x in board.width">
            <template v-for="cell in [board.cell(x - 1, y - 1)]">
              <td
                v-for="state in [cell.piece && cell.piece.king ? board.stateOf(cell.piece.owner) : null]"
                class="board__cell"
                :class="{
                  'board__cell--movement': movementCell(cell),
                  'board__cell--destination': destinationCell === cell,
                  'board__cell--check': state === board.constructor.states.check,
                  'board__cell--checkmate': state === board.constructor.states.checkmate,
                  'board__cell--promote-marker--top-left': y === 3 && x === 3,
                  'board__cell--promote-marker--top-right': y === 3 && x === 7,
                  'board__cell--promote-marker--bottom-left': y === 7 && x === 3,
                  'board__cell--promote-marker--bottom-right': y === 7 && x === 7,
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
          </template>
        </tr>
      </tbody>
    </table>

    <template v-for="p in board.players">
      <div :class="`board__player board__player--${p.typeName}`">
        <div class="board__state">
          {{stateName(board.stateOf(p))}}
        </div>
        <div class="board__captured-pieces">
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

    <div
      class="board__promote"
      :class="{
        'board__promote--visible': promoting
      }"
      :style="{
        top: `${movingPiecePosition.y}px`,
        left: `${movingPiecePosition.x}px`
      }"
    >
      <span class="board__promote-button" @click="move(true)">Promote</span>
      <span class="board__promote-button" @click="move(false)">Don't Promote</span>
    </div>
  </div>
</template>

<script>
  import Shogi from '../_shogi'
  import Piece from './Piece.vue'

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
        stoppedMoving: false,
        promoting: false
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

      move(promote = null) {
        if(!this.movingPiece || !this.movementCell(this.destinationCell)) return
        if(promote === null && this.board.promotable(this.movingPiece, this.destinationCell)) {
          window.removeEventListener('mousemove', this.movingPiecePositionCallback)
          window.removeEventListener('mouseup', this.movingPieceMoveCallback)
          this.promoting = true
        }
        else {
          this.promoting = false
          this.board.move(this.movingPiece, this.destinationCell, promote)
          this.stopMoving()
          this.$emit('move')
        }
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
      },

      stateName(state) {
        switch(state) {
          case Shogi.Board.states.check:
            return 'Check'
          case Shogi.Board.states.checkmate:
            return 'Checkmate'
          default:
            return ''
        }
      }
    },

    components: {
      piece: Piece
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
      border-radius: 6px
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
        transition: .2s

      &--movement::before
        opacity: .2
        transition: border-width .1s

      &--destination::before
        opacity: .4
        border:
          width: 6px

      &--check, &--checkmate
        &::before
          opacity: .6

      &--check::before
        border-color: orange

      &--checkmate::before
        border-color: red

      &--promote-marker
        &--top-left, &--top-right, &--bottom-left, &--bottom-right
          &::after
            content: ''
            background-color: rgba(black, .5)
            width: 4px
            height: 4px
            border-radius: 4px
            position: absolute
            display: block

        &--top-left, &--top-right
          &::after
            top: 100%

        &--bottom-left, &--bottom-right
          &::after
            bottom: 100%

        &--top-left, &--bottom-left
          &::after
            left: 100%

        &--top-right, &--bottom-right
          &::after
            right: 100%

    &__piece
      width: 100%
      height: 100%
      z-index: 2
      pointer-events: none
      position: relative

      &:not(&--moving)
        padding: 3px
        margin: -3px

      &--movable, &--captured
        pointer-events: auto
        cursor: -webkit-grab
        cursor: -moz-grab
        cursor: -ms-grab
        cursor: -o-grab
        cursor: grab

      &--captured
        width: 11%
        height: 100%
        flex-grow: 0
        flex-shrink: 1

      &--moving
        top: 0
        left: 0
        position: fixed
        cursor: -webkit-grabbing
        cursor: -moz-grabbing
        cursor: -ms-grabbing
        cursor: -o-grabbing
        cursor: grabbing

      &--dragging
        opacity: 0

      &--transition
        transition: transform .2s

    &__player
      width: 100%
      height: 9%
      display: flex
      flex-grow: 0
      flex-shrink: 0
      align-items: center

      &:first-of-type
        order: -1

      &:last-of-type
        order: 1

    &__state
      width: 150px
      flex-grow: 0
      flex-shrink: 0

    &__captured-pieces
      width: 100%
      height: 100%
      padding: 5px
      box-sizing: border-box
      display: flex
      flex-grow: 1
      flex-shrink: 1
      align-items: center
      justify-content: flex-end

    &__promote
      background: #eee
      z-index: 10
      position: fixed
      transform: translate(-25%, calc(50% + 20px))
      border-radius: 6px
      box-shadow: 0 15px 30px rgba(black, .1)
      opacity: 0
      transition: .2s
      pointer-events: none

      &--visible
        opacity: 1
        transform: translate(-25%, calc(50% + 0))
        pointer-events: auto

    &__promote-button
      padding: 15px 25px
      cursor: pointer
      display: block
      font-size: 12px
      text-align: center
      transition: .15s

      &:not(:last-of-type)
        border-bottom: 1px solid rgba(black, .1)

      &:hover
        background-color: rgba(black, .05)
</style>
