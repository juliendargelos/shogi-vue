import Board from './board'

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

  reversePlayers() {
    this.player1.type = this.player2.reverse().oppositeType
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
