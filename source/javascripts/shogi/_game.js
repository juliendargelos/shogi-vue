import Board from './_board'

export default class Game {
  constructor(player1, player2) {
    this.player1 = player1
    this.player2 = player2
    this.currentPlayer = null
    this.pieces = []
    this.board = new Board()
  }

  get firstPlayer() {
    return this.player1.first ? this.player1 : this.player2
  }

  get players() {
    return [this.player1, this.player2]
  }

  turn() {
    this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1
  }

  reversePlayers() {
    this.player1.type = this.player2.reverse().oppositeType
  }

  turn() {
    this.currentPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1
  }

  start() {
    this.reversePlayers()
    this.board.init(this.player1, this.player2)
    this.currentPlayer = this.firstPlayer
    this.pieces = this.board.pieces

    return this
  }

  get finished() {

  }
}
