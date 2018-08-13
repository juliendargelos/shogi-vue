import Dimension from './iterator/_dimension'

export default class Iterator {
  constructor(board, cell, x, y) {
    this.board = board
    this.offset = 0
    this.x = Dimension.for(this, cell.x, x, board.width)
    this.y = Dimension.for(this, cell.y, y, board.height)
  }

  get infinite() {
    return this.x.infinite || this.y.infinite
  }

  get valid() {
    return this.x.valid && this.y.valid
  }

  forEach(callback) {
    var movement

    for(this.offset = 1; this.valid; this.offset++) {
      movement = this.board.cell(this.x.value, this.y.value)
      if(movement && callback.call(this, movement) === false) break
    }
  }
}
